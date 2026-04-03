"""
Pydantic v2 input model for financial analysis request.
"""
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Literal

PERSONA_RATES = {
    "conservative": 0.08,
    "balanced": 0.10,
    "aggressive": 0.12,
}


class FinancialInput(BaseModel):
    age: int = Field(..., ge=18, le=80)
    income: float = Field(..., gt=0)
    expenses: float = Field(..., gt=0)
    savings: float = Field(..., ge=0)
    investments: float = Field(..., ge=0)
    retirement_age: int = Field(..., ge=30, le=80)
    persona: Literal["conservative", "balanced", "aggressive"] = Field(default="balanced")

    @field_validator("expenses")
    @classmethod
    def expenses_reasonable(cls, v, info):
        income = info.data.get("income")
        if income and v * 12 > income * 2:
            raise ValueError("Monthly expenses seem unusually high relative to income")
        return v

    @model_validator(mode="after")
    def retirement_after_current_age(self):
        if self.retirement_age <= self.age:
            raise ValueError("retirement_age must be greater than current age")
        return self

    model_config = {
        "json_schema_extra": {
            "example": {
                "age": 28,
                "income": 1500000,
                "expenses": 50000,
                "savings": 300000,
                "investments": 250000,
                "retirement_age": 50,
                "persona": "balanced"
            }
        }
    }
