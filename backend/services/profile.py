"""
Financial Profile Builder.

Computes summary statistics about the user's financial profile.
All deterministic — no AI.
"""


def build_profile_summary(
    age: int,
    annual_income: float,
    monthly_expenses: float,
    savings: float,
    investments: float,
    retirement_age: int,
    fire_corpus: float,
    sip_required: float
) -> dict:
    """
    Build a comprehensive financial profile summary.

    Returns:
        Dict with key ratios, milestones, and derived financial data.
    """
    monthly_income = annual_income / 12
    monthly_savings = monthly_income - monthly_expenses
    annual_expenses = monthly_expenses * 12
    net_worth = savings + investments
    years_left = retirement_age - age
    months_to_retire = years_left * 12

    # Savings rate
    savings_rate = (monthly_savings / monthly_income * 100) if monthly_income > 0 else 0

    # Emergency fund coverage
    emergency_coverage = (savings / monthly_expenses) if monthly_expenses > 0 else 0

    # FIRE progress percentage
    fire_progress = (net_worth / fire_corpus * 100) if fire_corpus > 0 else 0

    # Wealth-to-income ratio
    wealth_to_income = net_worth / annual_income if annual_income > 0 else 0

    # Annual investment capacity (what they can invest per year from savings)
    annual_investable = max(monthly_savings * 12, 0)

    return {
        "monthly_income": round(monthly_income, 2),
        "monthly_savings": round(monthly_savings, 2),
        "annual_expenses": round(annual_expenses, 2),
        "net_worth": round(net_worth, 2),
        "savings_rate_pct": round(savings_rate, 2),
        "emergency_coverage_months": round(emergency_coverage, 2),
        "fire_progress_pct": round(min(fire_progress, 100), 2),
        "wealth_to_income_ratio": round(wealth_to_income, 2),
        "annual_investable": round(annual_investable, 2),
        "years_to_retirement": years_left,
        "months_to_retirement": months_to_retire,
        "retirement_age": retirement_age,
        "corpus_gap": round(max(fire_corpus - net_worth, 0), 2)
    }
