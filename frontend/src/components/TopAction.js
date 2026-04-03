import React from "react";
import "./TopAction.css";

export default function TopAction({ topAction, baseYears }) {
  if (!topAction?.lever) return null;
  const improved = Math.max(baseYears - topAction.years_impact, 0);

  return (
    <div className="top-action fade-up">
      <div className="top-action-tag">Highest Impact Action</div>
      <div className="top-action-content">
        <div className="top-action-text">
          <span className="top-action-detail">{topAction.detail}</span>
          <span className="top-action-result">reduces retirement timeline by {topAction.years_impact.toFixed(1)} years</span>
        </div>
        <div className="top-action-timeline">
          <div className="timeline-col">
            <span className="timeline-label">Current</span>
            <span className="timeline-val">{baseYears.toFixed(1)} yrs</span>
          </div>
          <div className="timeline-arrow">→</div>
          <div className="timeline-col">
            <span className="timeline-label">With change</span>
            <span className="timeline-val timeline-val-better">{improved.toFixed(1)} yrs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
