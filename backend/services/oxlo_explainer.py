"""
AI Explainer Service (Claude / Oxlo).

IMPORTANT: Used ONLY to explain pre-calculated results in plain English.
           Never used for financial calculations.

API key loaded from OXLO_API_KEY env variable (falls back gracefully).
"""
import os
import httpx
import logging

logger = logging.getLogger(__name__)

# Secure: loaded from environment only — never hardcoded
_API_KEY = os.getenv("OXLO_API_KEY", "")
_API_URL = "https://api.anthropic.com/v1/messages"
_MODEL   = "claude-haiku-4-5-20251001"


def _prompt(calculated: dict, profile: dict) -> str:
    persona_label = profile.get("persona", "balanced").capitalize()
    top = calculated.get("top_action", {})
    top_action_str = (
        f"{top.get('detail', '')} → {top.get('summary', '')}"
        if top else "maintain current savings discipline"
    )
    return f"""You are a warm, knowledgeable personal finance mentor.
A user's financial analysis has been computed. Explain these PRE-CALCULATED numbers in simple, encouraging language.
Do NOT recalculate anything. Just explain what the numbers mean for their life.

Profile:
- Age: {profile['age']}, Target retirement: {profile['retirement_age']}
- Annual income: ₹{profile['income']:,.0f}  Monthly expenses: ₹{profile['expenses']:,.0f}
- Savings: ₹{profile['savings']:,.0f}  Investments: ₹{profile['investments']:,.0f}
- Persona: {persona_label}

Results (already calculated — do not recompute):
- FIRE Corpus: ₹{calculated['fire_corpus']:,.0f}
- Monthly SIP needed: ₹{calculated['sip_required']:,.0f}
- Years to retirement: {calculated['years_left']}
- Health Score: {calculated['health_score']}/100
- Net worth: ₹{calculated.get('net_worth', 0):,.0f}
- Emergency fund: {calculated.get('emergency_months', 0):.1f} months
- Savings rate: {calculated.get('savings_rate_pct', 0):.1f}%
- Best single action: {top_action_str}

Write 3-4 short paragraphs that:
1. Acknowledge their current situation warmly, mention their {calculated['years_left']} years to FIRE goal
2. Explain the FIRE corpus and SIP in plain English
3. Highlight the single best action they can take: "{top_action_str}"
4. End with an energising, motivating message

Keep it under 200 words. Use ₹. No bullet points."""


async def get_ai_explanation(calculated: dict, profile: dict) -> str:
    """Return AI explanation, falling back gracefully if key is absent."""
    if not _API_KEY or _API_KEY == "your_api_key_here":
        return _fallback(calculated, profile)

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                _API_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": _API_KEY,
                    "anthropic-version": "2023-06-01",
                },
                json={
                    "model": _MODEL,
                    "max_tokens": 400,
                    "messages": [{"role": "user", "content": _prompt(calculated, profile)}],
                },
            )
        if resp.status_code == 200:
            return resp.json()["content"][0]["text"].strip()
        logger.warning("AI API status %s", resp.status_code)
    except httpx.TimeoutException:
        logger.warning("AI explanation timed out")
    except Exception as exc:
        logger.error("AI explanation error: %s", exc)

    return _fallback(calculated, profile)


def _fallback(calculated: dict, profile: dict) -> str:
    score   = calculated["health_score"]
    corpus  = calculated["fire_corpus"]
    sip     = calculated["sip_required"]
    years   = calculated["years_left"]
    age     = profile["age"]
    ret_age = profile["retirement_age"]
    persona = profile.get("persona", "balanced").capitalize()
    top     = calculated.get("top_action", {})
    top_str = top.get("detail", "") if top else ""

    opening = (
        f"Great news! At {age} you're on a solid financial path."
        if score >= 70 else
        f"At {age}, you have a real opportunity to transform your financial future."
    )
    sip_note = (
        f"investing ₹{sip:,.0f}/month via SIP" if sip > 0
        else "your current investments are already on track"
    )
    action_line = (
        f" Your single highest-impact move right now: {top_str}."
        if top_str else ""
    )
    return (
        f"{opening} "
        f"With {years} years until your target retirement at {ret_age}, you need a corpus of ₹{corpus:,.0f} — "
        f"the amount that, invested safely, funds your lifestyle forever. "
        f"With a {persona} strategy, {sip_note} will get you there.{action_line} "
        f"Your Money Health Score of {score}/100 is your financial fitness gauge. "
        f"Consistency is everything: small, regular investments today create extraordinary wealth over time. "
        f"Stay disciplined — financial freedom is absolutely within your reach."
    )
