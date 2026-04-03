"""
Rule-Based Insights Engine.

Generates actionable, prioritized financial insights.
Priority 1-2 → HIGH, 3-4 → MEDIUM, 5 → LOW
"""

PRIORITY_LEVEL = {1: "HIGH", 2: "HIGH", 3: "MEDIUM", 4: "MEDIUM", 5: "LOW"}


def generate_insights(
    annual_income: float,
    monthly_expenses: float,
    savings: float,
    investments: float,
    age: int,
    retirement_age: int,
    fire_corpus: float,
    sip_required: float,
    health_score: dict
) -> list:
    insights = []
    monthly_income = annual_income / 12
    monthly_savings = monthly_income - monthly_expenses
    savings_rate = monthly_savings / monthly_income if monthly_income > 0 else 0
    months_emergency = savings / monthly_expenses if monthly_expenses > 0 else 0
    years_left = retirement_age - age
    expense_ratio = (monthly_expenses * 12) / annual_income if annual_income > 0 else 0

    def _add(priority, category, icon, title, message, action):
        insights.append({
            "priority": priority,
            "priority_level": PRIORITY_LEVEL.get(priority, "LOW"),
            "category": category,
            "icon": icon,
            "title": title,
            "message": message,
            "action": action,
        })

    # ── Emergency Fund ───────────────────────────────────────────────────────
    if months_emergency < 3:
        _add(1, "Emergency Fund", "🚨",
             "Critical: Build Emergency Fund Immediately",
             f"Only {months_emergency:.1f} months covered. Need 6 months (₹{monthly_expenses * 6:,.0f}).",
             f"Save ₹{max(monthly_expenses * 6 - savings, 0):,.0f} more in a liquid fund before investing.")
    elif months_emergency < 6:
        _add(2, "Emergency Fund", "⚠️",
             "Strengthen Your Emergency Fund",
             f"{months_emergency:.1f} months covered — target is 6. Shortage: ₹{max(monthly_expenses * 6 - savings, 0):,.0f}.",
             "Top up liquid savings before increasing investment contributions.")

    # ── Savings Rate ─────────────────────────────────────────────────────────
    if savings_rate < 0:
        _add(1, "Cash Flow", "🔴",
             "Spending More Than You Earn",
             f"Monthly deficit: ₹{abs(monthly_savings):,.0f}. This erodes your savings daily.",
             f"Cut expenses by at least ₹{abs(monthly_savings) + monthly_income * 0.10:,.0f}/month.")
    elif savings_rate < 0.10:
        _add(2, "Savings Rate", "🟡",
             "Low Savings Rate — Increase Urgently",
             f"Saving only {savings_rate * 100:.1f}% of income. Target: 20%+.",
             f"Aim for ₹{monthly_income * 0.20:,.0f}/month (20% of income).")
    elif savings_rate < 0.20:
        _add(3, "Savings Rate", "🟡",
             "Savings Rate Below 20% Target",
             f"Current: {savings_rate * 100:.1f}%. Push toward 20% to accelerate wealth.",
             f"Increase savings by ₹{(monthly_income * 0.20 - monthly_savings):,.0f}/month.")

    # ── SIP ──────────────────────────────────────────────────────────────────
    if sip_required > 0 and sip_required > monthly_savings * 0.8:
        _add(2, "Investment", "📈",
             "Required SIP Exceeds Comfortable Range",
             f"Required SIP ₹{sip_required:,.0f}/month is high vs your savings capacity.",
             f"Extending retirement by 2-3 years significantly lowers the required SIP.")
    elif sip_required > 0:
        _add(3, "Investment", "💰",
             f"Start SIP of ₹{sip_required:,.0f}/month",
             f"To reach FIRE corpus of ₹{fire_corpus:,.0f} by age {retirement_age}, invest ₹{sip_required:,.0f}/month.",
             "Set up an automatic SIP in a diversified equity mutual fund today.")
    else:
        _add(5, "Investment", "🏆",
             "Already On Track for FIRE!",
             f"Current investments of ₹{investments:,.0f} projected to meet your corpus without extra SIP.",
             "Consider increasing SIP to retire earlier or boost lifestyle in retirement.")

    # ── Retirement Timeline ───────────────────────────────────────────────────
    if years_left < 10 and investments < fire_corpus * 0.5:
        _add(2, "Retirement Timeline", "⏰",
             "Retirement Timeline Needs Adjustment",
             f"Only {years_left} years left but investments at ₹{investments:,.0f} vs target ₹{fire_corpus:,.0f}.",
             "Consider retiring later OR dramatically increase monthly savings.")

    # ── Age-specific ──────────────────────────────────────────────────────────
    if age < 30 and investments < annual_income * 0.5:
        _add(4, "Early Career", "🌱",
             "Leverage Compounding — Invest Early",
             "Under 30: ₹1,000 invested today = ₹17,000+ at retirement (10% over 30 yrs).",
             "Invest aggressively in equity funds. Even ₹2,000/month makes a huge difference.")

    if age >= 40 and months_emergency < 6:
        _add(2, "Mid-Career", "🛡️",
             "Prioritize Safety Net at 40+",
             "Approaching retirement — a weak emergency fund is a serious risk.",
             "Allocate 10-15% of savings toward topping up emergency fund before investing more.")

    # ── Tax optimisation ──────────────────────────────────────────────────────
    if annual_income > 500000:
        saving_est = min(annual_income * 0.30, 60000)
        _add(4, "Tax Optimization", "🧾",
             "Maximize Section 80C & 80CCD Deductions",
             f"Up to ₹1.5L under 80C (ELSS/PPF) + ₹50K under 80CCD(1B) NPS. Est. saving: ₹{saving_est:,.0f}/yr.",
             "Open an ELSS SIP + NPS account to reduce taxable income while building wealth.")

    # ── High expenses ─────────────────────────────────────────────────────────
    if expense_ratio > 0.70:
        _add(2, "Expense Control", "💸",
             "Expenses Too High Relative to Income",
             f"Spending {expense_ratio * 100:.0f}% of income — leaves almost no room for investing.",
             "Create a zero-based budget. Track and cut the top 3 expense categories.")

    insights.sort(key=lambda x: x["priority"])
    return insights[:8]
