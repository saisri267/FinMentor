import React from "react";
import { formatINR } from "../services/api";
import "./ProfileSummary.css";

function Row({ label, value, color }) {
  return (
    <div className="ps-row">
      <span className="ps-label">{label}</span>
      <span className={`ps-value ${color ? "ps-" + color : ""}`}>{value}</span>
    </div>
  );
}

export default function ProfileSummary({ summary }) {
  const {
    monthly_income, monthly_savings, annual_expenses, net_worth,
    savings_rate_pct, emergency_coverage_months,
    fire_progress_pct, wealth_to_income_ratio,
    annual_investable, corpus_gap, years_to_retirement,
  } = summary;

  const srColor  = savings_rate_pct >= 20 ? "green" : savings_rate_pct >= 10 ? "amber" : savings_rate_pct >= 0 ? "amber" : "red";
  const efColor  = emergency_coverage_months >= 6 ? "green" : emergency_coverage_months >= 3 ? "amber" : "red";

  return (
    <div className="card ps-card">
      <div className="section-heading">Financial Profile Overview</div>
      <div className="ps-grid">
        <div className="ps-section">
          <div className="ps-section-label">Cash Flow</div>
          <Row label="Monthly Income"   value={formatINR(monthly_income, true)} />
          <Row label="Monthly Savings"  value={formatINR(monthly_savings, true)} color={monthly_savings >= 0 ? "green" : "red"} />
          <Row label="Savings Rate"     value={`${savings_rate_pct.toFixed(1)}%`} color={srColor} />
          <Row label="Annual Expenses"  value={formatINR(annual_expenses, true)} />
        </div>

        <div className="ps-section">
          <div className="ps-section-label">Wealth Position</div>
          <Row label="Net Worth"          value={formatINR(net_worth, true)} />
          <Row label="Wealth / Income"    value={`${wealth_to_income_ratio.toFixed(2)}×`} />
          <Row label="Annual Investable"  value={formatINR(annual_investable, true)} />
          <Row label="Corpus Gap"         value={formatINR(corpus_gap, true)} color="red" />
        </div>

        <div className="ps-section">
          <div className="ps-section-label">Progress</div>
          <Row label="Emergency Fund"  value={`${emergency_coverage_months.toFixed(1)} months`} color={efColor} />
          <Row label="FIRE Progress"   value={`${Math.min(fire_progress_pct,100).toFixed(1)}%`} />
          <Row label="Years Remaining" value={`${years_to_retirement} years`} />
          <div className="ps-prog-wrap">
            <div className="progress-track" style={{height:5}}>
              <div className="progress-fill" style={{
                width:`${Math.min(fire_progress_pct,100)}%`,
                background: fire_progress_pct >= 50 ? "var(--green-600)" : "var(--blue-600)"
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
