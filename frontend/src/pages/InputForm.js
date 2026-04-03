import React, { useState } from "react";
import { analyzeFinances, loadSampleData } from "../services/api";
import "./InputForm.css";

const FIELDS = [
  { id: "age",            label: "Current Age",             hint: "Between 18 and 80",                   placeholder: "28",      min: 18, max: 80 },
  { id: "income",         label: "Annual Income (₹)",       hint: "Total gross income per year",          placeholder: "1200000" },
  { id: "expenses",       label: "Monthly Expenses (₹)",    hint: "Rent, EMIs, food, utilities",          placeholder: "45000"   },
  { id: "savings",        label: "Current Savings (₹)",     hint: "Bank accounts, FDs, liquid funds",     placeholder: "300000"  },
  { id: "investments",    label: "Current Investments (₹)", hint: "Mutual funds, stocks, EPF, PPF, NPS",  placeholder: "500000"  },
  { id: "retirement_age", label: "Target Retirement Age",   hint: "Age at which you plan to retire",      placeholder: "50",     min: 25, max: 80 },
];

const PERSONAS = [
  { id: "conservative", label: "Conservative", rate: "8% p.a.", desc: "Lower risk, stable returns" },
  { id: "balanced",     label: "Balanced",     rate: "10% p.a.", desc: "Moderate risk — recommended" },
  { id: "aggressive",   label: "Aggressive",   rate: "12% p.a.", desc: "Higher risk, higher potential" },
];

const DEFAULT = { age:"", income:"", expenses:"", savings:"", investments:"", retirement_age:"", persona:"balanced" };

export default function InputForm({ onAnalysisComplete }) {
  const [form, setForm]         = useState(DEFAULT);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState(null);
  const [sampleLoading, setSampleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.age || form.age < 18 || form.age > 80)   e.age = "Must be between 18 and 80";
    if (!form.income || form.income <= 0)                e.income = "Enter a valid income";
    if (!form.expenses || form.expenses <= 0)            e.expenses = "Enter valid monthly expenses";
    if (form.savings === "" || form.savings < 0)         e.savings = "Enter 0 or current savings";
    if (form.investments === "" || form.investments < 0) e.investments = "Enter 0 or investment value";
    if (!form.retirement_age || Number(form.retirement_age) <= Number(form.age))
      e.retirement_age = "Must be greater than current age";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError(null);
    try {
      const result = await analyzeFinances(form);
      onAnalysisComplete(result, form);
    } catch (err) {
      setApiError(err.message || "Could not connect to analysis server. Ensure the backend is running on port 8000.");
    } finally { setLoading(false); }
  };

  const fillSample = async () => {
    setSampleLoading(true);
    try {
      const s = await loadSampleData();
      setForm({ age:String(s.age), income:String(s.income), expenses:String(s.expenses),
        savings:String(s.savings), investments:String(s.investments),
        retirement_age:String(s.retirement_age), persona:s.persona||"balanced" });
      setErrors({});
    } catch {
      setForm({ age:"28", income:"1500000", expenses:"50000", savings:"300000", investments:"250000", retirement_age:"50", persona:"balanced" });
    } finally { setSampleLoading(false); }
  };

  return (
    <div className="input-page">
      <header className="site-header">
        <div className="container header-inner">
          <div className="logo">
            <div className="logo-mark">F</div>
            <div>
              <div className="logo-name">FinMentor</div>
              <div className="logo-tagline">Financial Independence Planner</div>
            </div>
          </div>
        </div>
      </header>

      <div className="input-body">
        <div className="container">
          <div className="page-header fade-up">
            <div>
              <h1 className="page-title">Financial Independence Analysis</h1>
              <p className="page-desc">
                Enter your financial details to calculate your FIRE corpus, required SIP, and personalised action plan.
              </p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={fillSample} disabled={sampleLoading}>
              {sampleLoading ? <><span className="spinner spinner-dark" style={{borderTopColor:"var(--grey-600)"}} /> Loading</> : "Load Sample Data"}
            </button>
          </div>

          <div className="form-layout fade-up">
            {/* Left: Persona + Fields */}
            <div className="form-main">
              <div className="card" style={{marginBottom:16}}>
                <div className="section-heading">Investment Strategy</div>
                <div className="persona-row">
                  {PERSONAS.map(p => (
                    <button key={p.id} type="button"
                      className={`persona-btn ${form.persona === p.id ? "active" : ""}`}
                      onClick={() => setForm(prev => ({...prev, persona: p.id}))}>
                      <span className="persona-name">{p.label}</span>
                      <span className="persona-rate">{p.rate}</span>
                      <span className="persona-desc">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {apiError && (
                <div className="error-banner">
                  <span className="error-icon">!</span>
                  <span>{apiError}</span>
                </div>
              )}

              <div className="card">
                <div className="section-heading">Financial Profile</div>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="fields-grid">
                    {FIELDS.map(field => (
                      <div key={field.id} className="form-group">
                        <label className="form-label" htmlFor={field.id}>{field.label}</label>
                        <input id={field.id} name={field.id} type="number"
                          className={`form-input ${errors[field.id] ? "form-input-error" : ""}`}
                          value={form[field.id]} onChange={handleChange}
                          placeholder={field.placeholder}
                          min={field.min} max={field.max} step="1" />
                        {errors[field.id]
                          ? <span className="form-error">{errors[field.id]}</span>
                          : <span className="form-hint">{field.hint}</span>}
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
                    {loading ? <><span className="spinner" /> Calculating...</> : "Run Analysis"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Info panel */}
            <div className="form-sidebar">
              <div className="card info-card">
                <div className="section-heading">How It Works</div>
                <div className="info-list">
                  <div className="info-row">
                    <div className="info-num">01</div>
                    <div>
                      <div className="info-title">FIRE Corpus</div>
                      <div className="info-text">Calculated as 25× annual expenses using the 4% safe withdrawal rate.</div>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-num">02</div>
                    <div>
                      <div className="info-title">SIP Calculation</div>
                      <div className="info-text">Monthly investment required using compound interest formula based on your persona.</div>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-num">03</div>
                    <div>
                      <div className="info-title">Health Score</div>
                      <div className="info-text">0–100 score across emergency fund, savings rate, investments, and expense ratio.</div>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-num">04</div>
                    <div>
                      <div className="info-title">Decision Impact</div>
                      <div className="info-text">Shows how adjusting SIP or expenses changes your retirement date.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="disclaimer-box">
                <p>Calculations use the 4% Safe Withdrawal Rule and compound SIP formula. All data is processed in-memory and not stored. For educational purposes only — not financial advice.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
