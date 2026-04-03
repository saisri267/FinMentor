"""
Money Health Score Calculator.

Scores the user's financial health on a 0–100 scale.
Score breakdown is deterministic — no AI involvement.
"""


def calculate_savings_rate(annual_income: float, monthly_expenses: float) -> float:
    """
    Calculate the monthly savings rate.
    savings_rate = (monthly_income - monthly_expenses) / monthly_income
    
    Returns a value between 0 and 1 (or negative if spending > income).
    """
    monthly_income = annual_income / 12
    if monthly_income <= 0:
        return 0.0
    savings_rate = (monthly_income - monthly_expenses) / monthly_income
    return round(savings_rate, 4)


def score_emergency_fund(savings: float, monthly_expenses: float) -> dict:
    """
    Score the emergency fund component (max 30 points).
    Ideal: 6 months of expenses in liquid savings.
    
    Scoring:
      >= 6 months: 30 pts
      4-6 months:  20 pts
      2-4 months:  12 pts
      1-2 months:   6 pts
      < 1 month:    0 pts
    """
    if monthly_expenses <= 0:
        return {"score": 0, "max": 30, "months_covered": 0, "status": "Unknown"}

    months_covered = round(savings / monthly_expenses, 2)
    
    if months_covered >= 6:
        score = 30
        status = "Excellent"
    elif months_covered >= 4:
        score = 20
        status = "Good"
    elif months_covered >= 2:
        score = 12
        status = "Fair"
    elif months_covered >= 1:
        score = 6
        status = "Poor"
    else:
        score = 0
        status = "Critical"

    return {
        "score": score,
        "max": 30,
        "months_covered": months_covered,
        "status": status,
        "ideal_amount": round(monthly_expenses * 6, 2)
    }


def score_savings_rate(annual_income: float, monthly_expenses: float) -> dict:
    """
    Score the savings rate component (max 30 points).
    Ideal: Save > 20% of monthly income.
    
    Scoring:
      >= 40%: 30 pts
      >= 30%: 24 pts
      >= 20%: 18 pts
      >= 10%: 10 pts
      >= 0%:   4 pts
      < 0%:    0 pts (spending more than income)
    """
    rate = calculate_savings_rate(annual_income, monthly_expenses)
    rate_pct = rate * 100

    if rate >= 0.40:
        score = 30
        status = "Excellent"
    elif rate >= 0.30:
        score = 24
        status = "Very Good"
    elif rate >= 0.20:
        score = 18
        status = "Good"
    elif rate >= 0.10:
        score = 10
        status = "Fair"
    elif rate >= 0:
        score = 4
        status = "Poor"
    else:
        score = 0
        status = "Critical"

    return {
        "score": score,
        "max": 30,
        "rate_percentage": round(rate_pct, 2),
        "status": status,
        "monthly_savings": round((annual_income / 12) - monthly_expenses, 2)
    }


def score_investment_ratio(investments: float, annual_income: float, age: int) -> dict:
    """
    Score the investment ratio component (max 25 points).
    Rule of thumb: investments should be >= (age - 25) * annual_income / 10
    
    More aggressive targets for younger users to encourage early investing.
    
    Scoring:
      >= target: 25 pts
      >= 75% of target: 18 pts
      >= 50% of target: 12 pts
      >= 25% of target:  6 pts
      < 25% of target:   0 pts
    """
    # Target: roughly 1x income for every 10 years of working life post-25
    years_working = max(age - 22, 1)
    target = (years_working / 10) * annual_income

    if target <= 0:
        return {"score": 25, "max": 25, "status": "N/A", "ratio": 1.0, "target": 0}

    ratio = investments / target

    if ratio >= 1.0:
        score = 25
        status = "Excellent"
    elif ratio >= 0.75:
        score = 18
        status = "Good"
    elif ratio >= 0.50:
        score = 12
        status = "Fair"
    elif ratio >= 0.25:
        score = 6
        status = "Poor"
    else:
        score = 0
        status = "Critical"

    return {
        "score": score,
        "max": 25,
        "ratio": round(ratio, 4),
        "target_investments": round(target, 2),
        "status": status
    }


def score_income_to_expense_ratio(annual_income: float, monthly_expenses: float) -> dict:
    """
    Score the income vs expense component (max 15 points).
    Annual expenses should not exceed 60% of annual income.
    
    Scoring:
      Annual expenses < 40% income: 15 pts
      Annual expenses < 50% income: 10 pts
      Annual expenses < 60% income:  6 pts
      Annual expenses < 75% income:  2 pts
      Annual expenses >= 75% income: 0 pts
    """
    annual_expenses = monthly_expenses * 12
    if annual_income <= 0:
        return {"score": 0, "max": 15, "expense_ratio": 1.0, "status": "Unknown"}

    expense_ratio = annual_expenses / annual_income

    if expense_ratio < 0.40:
        score = 15
        status = "Excellent"
    elif expense_ratio < 0.50:
        score = 10
        status = "Good"
    elif expense_ratio < 0.60:
        score = 6
        status = "Fair"
    elif expense_ratio < 0.75:
        score = 2
        status = "Poor"
    else:
        score = 0
        status = "Critical"

    return {
        "score": score,
        "max": 15,
        "expense_ratio": round(expense_ratio * 100, 2),
        "status": status
    }


def calculate_health_score(
    annual_income: float,
    monthly_expenses: float,
    savings: float,
    investments: float,
    age: int
) -> dict:
    """
    Aggregate all score components into a single Money Health Score (0–100).
    
    Returns:
        Total score, grade, and detailed breakdown per component.
    """
    ef_score = score_emergency_fund(savings, monthly_expenses)
    sr_score = score_savings_rate(annual_income, monthly_expenses)
    inv_score = score_investment_ratio(investments, annual_income, age)
    ie_score = score_income_to_expense_ratio(annual_income, monthly_expenses)

    total = ef_score["score"] + sr_score["score"] + inv_score["score"] + ie_score["score"]
    total = min(total, 100)  # Cap at 100

    # Assign grade
    if total >= 85:
        grade = "A+"
        grade_label = "Outstanding"
    elif total >= 75:
        grade = "A"
        grade_label = "Excellent"
    elif total >= 65:
        grade = "B"
        grade_label = "Good"
    elif total >= 50:
        grade = "C"
        grade_label = "Average"
    elif total >= 35:
        grade = "D"
        grade_label = "Below Average"
    else:
        grade = "F"
        grade_label = "Needs Immediate Attention"

    return {
        "total_score": total,
        "grade": grade,
        "grade_label": grade_label,
        "breakdown": {
            "emergency_fund": ef_score,
            "savings_rate": sr_score,
            "investment_ratio": inv_score,
            "income_expense_ratio": ie_score
        }
    }
