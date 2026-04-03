"""
Finance API Routes — updated with:
  • Persona-aware return rates
  • Decision Impact Engine
  • Simple in-memory request cache (hash of input → result)
  • All intermediate values computed once and reused
"""
import hashlib, json
from fastapi import APIRouter, HTTPException
from models.input_model import FinancialInput, PERSONA_RATES
from services.fire import (
    get_annual_rate,
    calculate_fire_corpus,
    calculate_sip_required,
    calculate_years_left,
    calculate_inflation_adjusted_corpus,
    project_wealth_over_time,
    calculate_decision_impact,
    get_top_action,
)
from services.scoring import calculate_health_score
from services.insights import generate_insights
from services.profile import build_profile_summary
from services.oxlo_explainer import get_ai_explanation

router = APIRouter()

# ── In-memory cache (keyed by hash of request body) ───────────────────────
_cache: dict = {}
_CACHE_MAX = 100   # evict oldest when full


def _cache_key(data: FinancialInput) -> str:
    payload = json.dumps(data.model_dump(), sort_keys=True)
    return hashlib.md5(payload.encode()).hexdigest()


def _cache_get(key: str):
    return _cache.get(key)


def _cache_set(key: str, value: dict):
    if len(_cache) >= _CACHE_MAX:
        oldest = next(iter(_cache))
        del _cache[oldest]
    _cache[key] = value


# ── Main endpoint ──────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_finances(data: FinancialInput):
    """
    Full financial analysis. Execution order:
      1. Check cache
      2. Compute shared primitives once
      3. FIRE + SIP (persona-aware)
      4. Health Score
      5. Profile Summary
      6. Insights (with priority levels)
      7. Decision Impact Engine
      8. Wealth Projection (chart)
      9. AI Explanation (last, explanation only)
    """
    ck = _cache_key(data)
    if cached := _cache_get(ck):
        return {**cached, "cached": True}

    try:
        # ── Shared primitives (computed once) ────────────────────────────────
        annual_rate  = get_annual_rate(data.persona)
        years_left   = calculate_years_left(data.age, data.retirement_age)
        monthly_income = data.income / 12

        # ── FIRE core ────────────────────────────────────────────────────────
        fire_corpus  = calculate_fire_corpus(data.expenses)
        infl_corpus  = calculate_inflation_adjusted_corpus(data.expenses, years_left)
        sip_required = calculate_sip_required(
            fire_corpus, data.investments, years_left, annual_rate
        )

        # ── Health Score ─────────────────────────────────────────────────────
        health_data = calculate_health_score(
            data.income, data.expenses, data.savings, data.investments, data.age
        )

        # ── Profile (reuses computed values) ─────────────────────────────────
        profile = build_profile_summary(
            age=data.age,
            annual_income=data.income,
            monthly_expenses=data.expenses,
            savings=data.savings,
            investments=data.investments,
            retirement_age=data.retirement_age,
            fire_corpus=fire_corpus,
            sip_required=sip_required,
        )

        # ── Insights ─────────────────────────────────────────────────────────
        insights = generate_insights(
            data.income, data.expenses, data.savings, data.investments,
            data.age, data.retirement_age, fire_corpus, sip_required, health_data
        )

        # ── Decision Impact ───────────────────────────────────────────────────
        decision_impact = calculate_decision_impact(
            fire_corpus=fire_corpus,
            current_investments=data.investments,
            base_sip=max(sip_required, 0),
            monthly_expenses=data.expenses,
            years_left=years_left,
            annual_rate=annual_rate,
        )

        # ── Wealth Projection ─────────────────────────────────────────────────
        monthly_surplus = max(profile["monthly_savings"], 0)
        actual_sip = min(sip_required, monthly_surplus) if sip_required > 0 else monthly_surplus * 0.7
        wealth_projection = project_wealth_over_time(
            current_investments=data.investments,
            monthly_sip=actual_sip,
            years_left=min(years_left, 40),
            monthly_savings=max(monthly_surplus - actual_sip, 0),
            annual_rate=annual_rate,
        )

        # ── Reliability Score (simple, deterministic) ─────────────────────────
        reliability_score = _reliability(data, years_left, sip_required, monthly_income)


        # ── Top Action (best single lever) ───────────────────────────────
        top_action = get_top_action(decision_impact)

        calculated_summary = {
            "fire_corpus": fire_corpus,
            "sip_required": sip_required,
            "years_left": years_left,
            "health_score": health_data["total_score"],
            "net_worth": profile["net_worth"],
            "emergency_months": profile["emergency_coverage_months"],
            "savings_rate_pct": profile["savings_rate_pct"],
            "top_action": top_action,
        }
        user_profile_dict = data.model_dump()
        ai_explanation = await get_ai_explanation(calculated_summary, user_profile_dict)

        # ── Build response ────────────────────────────────────────────────────
        result = {
            "fire_corpus": fire_corpus,
            "inflation_adjusted_corpus": infl_corpus,
            "sip_required": sip_required,
            "years_left": years_left,
            "persona": data.persona,
            "annual_return_rate": annual_rate,

            "health_score": health_data["total_score"],
            "health_grade": health_data["grade"],
            "health_grade_label": health_data["grade_label"],
            "score_breakdown": health_data["breakdown"],

            "profile_summary": profile,
            "reliability": reliability_score,

            "insights": insights,
            "decision_impact": decision_impact,
            "top_action": top_action,
            "wealth_projection": wealth_projection,

            "ai_explanation": ai_explanation,
            "cached": False,
        }

        _cache_set(ck, result)
        return result

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


def _reliability(data, years_left, sip_required, monthly_income) -> dict:
    """
    Deterministic reliability score (0-100): how realistic / achievable is the plan?
    Factors: SIP affordability, timeline, income stability proxy.
    """
    score = 100
    notes = []

    # SIP affordability
    if monthly_income > 0 and sip_required > 0:
        sip_ratio = sip_required / monthly_income
        if sip_ratio > 0.6:
            score -= 30
            notes.append("SIP requires >60% of income — very aggressive")
        elif sip_ratio > 0.4:
            score -= 15
            notes.append("SIP requires 40-60% of income — challenging")
        elif sip_ratio > 0.25:
            score -= 5
            notes.append("SIP requires 25-40% of income — manageable")

    # Timeline
    if years_left < 5:
        score -= 25
        notes.append("Very short timeline — corpus may be hard to achieve")
    elif years_left < 10:
        score -= 10
        notes.append("Short timeline — requires high discipline")

    # Corpus feasibility
    if data.investments > 0:
        score = min(score + 5, 100)

    score = max(score, 0)
    label = (
        "High" if score >= 75
        else "Moderate" if score >= 50
        else "Low"
    )
    return {"score": score, "label": label, "notes": notes}


@router.get("/sample")
def get_sample_input():
    return {
        "age": 28,
        "income": 1500000,
        "expenses": 50000,
        "savings": 300000,
        "investments": 250000,
        "retirement_age": 50,
        "persona": "balanced",
    }


@router.delete("/cache")
def clear_cache():
    _cache.clear()
    return {"message": "Cache cleared"}
