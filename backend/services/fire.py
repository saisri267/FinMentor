"""
FIRE (Financial Independence, Retire Early) Calculation Service.

All calculations are deterministic. NO AI used here.
Supports persona-based return rates and Decision Impact Engine.
"""

SAFE_WITHDRAWAL_RATE = 0.04   # 4% rule → 25x corpus
INFLATION_RATE = 0.06         # 6% assumed inflation (India)

PERSONA_RATES = {
    "conservative": 0.08,
    "balanced":     0.10,
    "aggressive":   0.12,
}


def get_annual_rate(persona: str = "balanced") -> float:
    return PERSONA_RATES.get(persona, 0.10)


def calculate_fire_corpus(monthly_expenses: float) -> float:
    """fire_corpus = annual_expenses * 25  (4% SWR)"""
    return round(monthly_expenses * 12 * (1 / SAFE_WITHDRAWAL_RATE), 2)


def calculate_sip_required(
    fire_corpus: float,
    current_investments: float,
    years_left: int,
    annual_rate: float = 0.10
) -> float:
    """
    SIP = (FV * r) / ((1 + r)^n - 1)
    FV  = corpus needed after subtracting future value of current investments.
    """
    r = annual_rate / 12
    n = years_left * 12
    if n <= 0:
        return 0.0
    fv_current = current_investments * ((1 + r) ** n)
    remaining = fire_corpus - fv_current
    if remaining <= 0:
        return 0.0
    denom = ((1 + r) ** n) - 1
    return round((remaining * r) / denom, 2) if denom else round(remaining / n, 2)


def calculate_years_left(age: int, retirement_age: int) -> int:
    return max(retirement_age - age, 0)


def calculate_inflation_adjusted_corpus(monthly_expenses: float, years_left: int) -> float:
    future_monthly = monthly_expenses * ((1 + INFLATION_RATE) ** years_left)
    return round(future_monthly * 12 * 25, 2)


def project_wealth_over_time(
    current_investments: float,
    monthly_sip: float,
    years_left: int,
    monthly_savings: float,
    annual_rate: float = 0.10
) -> list:
    """Year-by-year wealth projection for chart rendering."""
    r = annual_rate / 12
    portfolio = current_investments
    savings_balance = 0.0
    projection = []
    for year in range(0, years_left + 1):
        projection.append({
            "year": year,
            "invested_wealth": round(portfolio, 2),
            "total_wealth": round(portfolio + savings_balance, 2),
        })
        for _ in range(12):
            portfolio = portfolio * (1 + r) + monthly_sip
            savings_balance += monthly_savings * (1 - annual_rate / 12)
    return projection


# ── Decision Impact Engine ─────────────────────────────────────────────────

def _years_to_reach_corpus(
    corpus: float,
    current_investments: float,
    monthly_sip: float,
    annual_rate: float
) -> float:
    """Binary-search how many years until portfolio reaches corpus."""
    r = annual_rate / 12
    lo, hi = 0.0, 80.0
    for _ in range(60):
        mid = (lo + hi) / 2
        n = mid * 12
        fv = current_investments * ((1 + r) ** n)
        if monthly_sip > 0 and r > 0:
            fv += monthly_sip * (((1 + r) ** n - 1) / r)
        if fv >= corpus:
            hi = mid
        else:
            lo = mid
    return round((lo + hi) / 2, 2)


def calculate_decision_impact(
    fire_corpus: float,
    current_investments: float,
    base_sip: float,
    monthly_expenses: float,
    years_left: int,
    annual_rate: float = 0.10,
) -> dict:
    """
    Show retirement-timeline impact of key financial levers.
    Returns years saved relative to base scenario.
    """
    SIP_DELTA = 5000
    EXP_DELTA = 5000

    base_years = _years_to_reach_corpus(
        fire_corpus, current_investments, base_sip, annual_rate
    )

    # +₹5,000 SIP
    sip_years = _years_to_reach_corpus(
        fire_corpus, current_investments, base_sip + SIP_DELTA, annual_rate
    )
    sip_impact = round(base_years - sip_years, 1)

    # −₹5,000 expenses → lower corpus + freed cash goes to SIP
    new_corpus = calculate_fire_corpus(monthly_expenses - EXP_DELTA)
    exp_years = _years_to_reach_corpus(
        new_corpus, current_investments, base_sip + EXP_DELTA, annual_rate
    )
    exp_impact = round(base_years - exp_years, 1)

    # Switch balanced → aggressive return
    agg_years = _years_to_reach_corpus(
        fire_corpus, current_investments, base_sip, PERSONA_RATES["aggressive"]
    )
    persona_impact = round(base_years - agg_years, 1)

    def _fmt(y):
        if y > 0:   return f"retire {y:.1f} yrs earlier"
        if y < 0:   return f"retire {abs(y):.1f} yrs later"
        return "no change"

    return {
        "base_years_to_fire": base_years,
        "impacts": [
            {
                "lever": "Increase SIP",
                "detail": f"+₹{SIP_DELTA:,}/month SIP",
                "years_impact": sip_impact,
                "summary": _fmt(sip_impact),
                "icon": "📈",
            },
            {
                "lever": "Reduce Expenses",
                "detail": f"−₹{EXP_DELTA:,}/month expenses",
                "years_impact": exp_impact,
                "summary": _fmt(exp_impact),
                "icon": "✂️",
            },
            {
                "lever": "Switch to Aggressive",
                "detail": "Balanced (10%) → Aggressive (12%)",
                "years_impact": persona_impact,
                "summary": _fmt(persona_impact),
                "icon": "🚀",
            },
        ],
    }


def get_top_action(decision_impact: dict) -> dict:
    """
    Pick the single highest-impact lever from decision_impact results.
    Returns the best impact dict (most years saved).
    """
    impacts = decision_impact.get("impacts", [])
    if not impacts:
        return {}
    best = max(impacts, key=lambda x: x.get("years_impact", 0))
    return best
