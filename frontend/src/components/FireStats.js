import React from "react";
import { formatINR } from "../services/api";
import "./FireStats.css";

function KpiCard({ label, value, sub, trend, borderColor }) {
  return (
    <div className="kpi-card card" style={{borderTop:`3px solid ${borderColor}`}}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

export default function FireStats({ fireCorpus, inflationCorpus, sipRequired, yearsLeft, profileSummary }) {
  const { net_worth, fire_progress_pct, corpus_gap } = profileSummary;

  return (
    <div className="kpi-strip fade-up">
      <KpiCard
        label="FIRE Corpus Required"
        value={formatINR(fireCorpus, true)}
        sub={`Inflation-adjusted: ${formatINR(inflationCorpus, true)}`}
        borderColor="var(--blue-600)"
      />
      <KpiCard
        label="Monthly SIP Required"
        value={sipRequired > 0 ? formatINR(sipRequired, true) : "—"}
        sub={sipRequired > 0 ? "Required monthly investment" : "Current portfolio is sufficient"}
        borderColor="var(--blue-400)"
      />
      <KpiCard
        label="Years to Retirement"
        value={`${yearsLeft} years`}
        sub={`${yearsLeft * 12} SIP installments remaining`}
        borderColor="var(--grey-400)"
      />
      <KpiCard
        label="FIRE Progress"
        value={`${Math.min(fire_progress_pct, 100).toFixed(1)}%`}
        sub={`Net worth ${formatINR(net_worth, true)} · Gap ${formatINR(corpus_gap, true)}`}
        borderColor={fire_progress_pct >= 50 ? "var(--green-600)" : "var(--amber-600)"}
      />
    </div>
  );
}
