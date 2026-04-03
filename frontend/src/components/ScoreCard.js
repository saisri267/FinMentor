import React, { useEffect, useState } from "react";
import "./ScoreCard.css";

const SCORE_COLOR = s => s >= 75 ? "var(--green-600)" : s >= 55 ? "var(--blue-600)" : s >= 40 ? "var(--amber-600)" : "var(--red-600)";
const STATUS_BADGE = s => s >= 75 ? ["green","Good"] : s >= 55 ? ["blue","Fair"] : s >= 40 ? ["amber","Below Average"] : ["red","Needs Attention"];

function ScoreRow({ label, data }) {
  const pct = (data.score / data.max) * 100;
  const barColor = data.status === "Excellent" || data.status === "Very Good" ? "var(--green-600)"
    : data.status === "Good" ? "var(--blue-600)"
    : data.status === "Fair" ? "var(--amber-600)" : "var(--red-600)";

  const badgeCls = data.status === "Excellent" || data.status === "Very Good" ? "badge-green"
    : data.status === "Good" ? "badge-blue"
    : data.status === "Fair" ? "badge-amber" : "badge-red";

  return (
    <div className="score-row">
      <div className="score-row-top">
        <span className="score-row-label">{label}</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span className={`badge ${badgeCls}`}>{data.status}</span>
          <span className="score-row-pts">{data.score}/{data.max}</span>
        </div>
      </div>
      <div className="progress-track" style={{height:4}}>
        <div className="progress-fill" style={{width:`${pct}%`, background:barColor}} />
      </div>
    </div>
  );
}

export default function ScoreCard({ score, grade, gradeLabel, breakdown }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 50);
    return () => clearTimeout(timer);
  }, [score]);

  const color = SCORE_COLOR(score);
  const [badgeCls, badgeLabel] = STATUS_BADGE(score);

  const R = 48; const CIRC = 2 * Math.PI * R;
  const offset = CIRC - (animated / 100) * CIRC;

  return (
    <div className="card score-card">
      <div className="section-heading">Financial Health Score</div>
      <div className="score-main">
        <div className="score-ring-wrap">
          <svg width="120" height="120">
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--grey-200)" strokeWidth="8" />
            <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="8"
              strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
              style={{transform:"rotate(-90deg)",transformOrigin:"center",transition:"stroke-dashoffset 800ms ease"}} />
          </svg>
          <div className="score-ring-center">
            <div className="score-num" style={{color}}>{score}</div>
            <div className="score-denom">/100</div>
          </div>
        </div>

        <div className="score-detail">
          <div style={{marginBottom:8}}>
            <span className={`badge badge-${badgeCls}`}>Grade {grade} — {badgeLabel}</span>
          </div>
          <div className="score-rows">
            <ScoreRow label="Emergency Fund"      data={breakdown.emergency_fund} />
            <ScoreRow label="Savings Rate"        data={breakdown.savings_rate} />
            <ScoreRow label="Investment Ratio"    data={breakdown.investment_ratio} />
            <ScoreRow label="Income vs Expenses"  data={breakdown.income_expense_ratio} />
          </div>
        </div>
      </div>

      <div className="score-footer">
        {breakdown.emergency_fund.months_covered !== undefined && (
          <div className="score-footer-item">
            <span className="score-footer-label">Emergency Fund</span>
            <span className="score-footer-val">{breakdown.emergency_fund.months_covered.toFixed(1)} months</span>
          </div>
        )}
        {breakdown.savings_rate.rate_percentage !== undefined && (
          <div className="score-footer-item">
            <span className="score-footer-label">Savings Rate</span>
            <span className="score-footer-val">{breakdown.savings_rate.rate_percentage.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
