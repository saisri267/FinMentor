# FinMentor AI — Personal Finance Intelligence System

> **AI-Powered Personal Finance Mentor using deterministic financial calculations + Claude AI explanations**

---

## 🏗 Architecture Overview

```
FinMentor AI
├── backend/          FastAPI Python backend (all financial logic)
│   ├── main.py
│   ├── routes/
│   │   └── finance.py        POST /api/analyze endpoint
│   ├── services/
│   │   ├── fire.py           FIRE corpus + SIP calculation (deterministic)
│   │   ├── scoring.py        Money Health Score 0-100 (deterministic)
│   │   ├── insights.py       Rule-based insights engine
│   │   ├── profile.py        Financial profile summary
│   │   └── oxlo_explainer.py Claude AI explanation (NOT for calculations)
│   └── models/
│       └── input_model.py    Pydantic request validation
│
└── frontend/         React frontend (responsive dashboard)
    └── src/
        ├── pages/
        │   ├── InputForm.js  Financial data entry form
        │   └── Dashboard.js  Results dashboard
        └── components/
            ├── FireStats.js      4 top-level KPI cards
            ├── ScoreCard.js      Animated health score circle
            ├── WealthChart.js    Recharts area chart
            ├── InsightsPanel.js  Expandable insights list
            ├── AIExplanation.js  AI-generated explanation card
            └── ProfileSummary.js Detailed financial breakdown
```

---

## 🔢 Financial Calculations (All Deterministic)

### 1. FIRE Corpus
```
annual_expenses = monthly_expenses × 12
fire_corpus     = annual_expenses × 25    (4% Safe Withdrawal Rule)
```

### 2. Monthly SIP Required
```
FV = fire_corpus − (current_investments × (1 + r)^n)
r  = 0.10 / 12   (monthly rate)
n  = years_left × 12

SIP = (FV × r) / ((1 + r)^n − 1)
```

### 3. Savings Rate
```
savings_rate = (monthly_income − monthly_expenses) / monthly_income
```

### 4. Money Health Score (0–100)
| Component | Max | Criteria |
|---|---|---|
| Emergency Fund | 30 pts | ≥6 months expenses |
| Savings Rate | 30 pts | ≥20% income |
| Investment Ratio | 25 pts | Age-based target |
| Income/Expense Ratio | 15 pts | Annual expenses <40% income |

### 5. AI (Claude) Usage
> **Strictly limited to explanation only.** Claude receives pre-calculated numbers and generates plain-English descriptions. It is never used to compute any financial value.

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

---

### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
# (Optional: app works without it using a fallback explanation)

# 4. Run the server
uvicorn main:app --reload --port 8000
```

Backend will be live at: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start development server
npm start
```

Frontend will open at: `http://localhost:3000`

---

### Getting an Anthropic API Key (Optional)

1. Go to https://console.anthropic.com/
2. Create an account and generate an API key
3. Add it to `backend/.env`: `ANTHROPIC_API_KEY=sk-ant-...`

If no API key is set, the app uses a smart rule-based fallback explanation instead.

---

## 📡 API Reference

### POST /api/analyze

**Request:**
```json
{
  "age": 28,
  "income": 1500000,
  "expenses": 50000,
  "savings": 300000,
  "investments": 250000,
  "retirement_age": 50
}
```

**Response:**
```json
{
  "fire_corpus": 15000000,
  "inflation_adjusted_corpus": 28500000,
  "sip_required": 22450,
  "years_left": 22,
  "health_score": 62,
  "health_grade": "B",
  "health_grade_label": "Good",
  "score_breakdown": {
    "emergency_fund": { "score": 20, "max": 30, "months_covered": 6.0, "status": "Good" },
    "savings_rate":   { "score": 18, "max": 30, "rate_percentage": 20.0, "status": "Good" },
    "investment_ratio": { "score": 12, "max": 25, "status": "Fair" },
    "income_expense_ratio": { "score": 10, "max": 15, "status": "Good" }
  },
  "profile_summary": { ... },
  "insights": [ { "priority": 1, "category": "...", "title": "...", "message": "...", "action": "..." } ],
  "wealth_projection": [ { "year": 0, "invested_wealth": 250000, "total_wealth": 550000 }, ... ],
  "ai_explanation": "At 28, you have a solid foundation..."
}
```

---

## 🎨 UI Features

- **Dark premium finance theme** — deep navy with gold accents
- **Fully responsive** — mobile-first design, works on all screen sizes  
- **Animated score circle** — SVG with smooth counting animation
- **Interactive chart** — Recharts area chart with FIRE corpus reference line
- **Expandable insights** — click to reveal detailed advice
- **Loading states** — spinner during analysis
- **Sample data** — one-click demo fill

---

## ⚠️ Disclaimer

This application is for **educational purposes only**. It does not constitute financial advice. Consult a SEBI-registered financial advisor before making investment decisions.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, CSS Variables |
| Charts | Recharts |
| HTTP client | fetch API |
| Backend | Python 3.10+, FastAPI |
| Validation | Pydantic v2 |
| HTTP server | Uvicorn |
| AI Explanation | Anthropic Claude Haiku |
