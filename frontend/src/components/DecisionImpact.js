import React from "react";
import "./DecisionImpact.css";

function CompareBar({ baseYears, improvedYears, color }) {
  const max = Math.max(baseYears, 1);
  const basePct     = 100;
  const improvedPct = Math.min((improvedYears / max) * 100, 100);
  const saved = (baseYears - improvedYears).toFixed(1);

  return (
    <div className="cbar-wrap">
      <div className="cbar-row">
        <span className="cbar-label">Current</span>
        <div className="cbar-track">
          <div className="cbar-fill" style={{width:`${basePct}%`, background:"var(--grey-300)"}} />
        </div>
        <span className="cbar-val">{baseYears.toFixed(1)} yrs</span>
      </div>
      <div className="cbar-row">
        <span className="cbar-label">After</span>
        <div className="cbar-track">
          <div className="cbar-fill" style={{width:`${improvedPct}%`, background:color}} />
        </div>
        <span className="cbar-val" style={{color}}>{improvedYears.toFixed(1)} yrs</span>
      </div>
      {parseFloat(saved) > 0 && (
        <div className="cbar-saved" style={{color}}>Save {saved} years</div>
      )}
    </div>
  );
}

const COLORS = ["var(--green-600)", "var(--blue-600)", "var(--amber-600)"];

export default function DecisionImpact({ data }) {
  if (!data) return null;
  const { base_years_to_fire, impacts } = data;

  return (
    <div className="card impact-card">
      <div className="impact-head">
        <div className="section-heading" style={{marginBottom:0}}>Scenario Analysis</div>
        <span className="badge badge-grey">{base_years_to_fire.toFixed(1)} years — current trajectory</span>
      </div>
      <p className="impact-desc">
        Modelled impact of individual changes on your retirement timeline.
      </p>

      <div className="impact-grid">
        {impacts.map((impact, i) => {
          const color = COLORS[i] || COLORS[0];
          const improved = Math.max(base_years_to_fire - impact.years_impact, 0);

          return (
            <div key={i} className="impact-panel">
              <div className="impact-panel-head">
                <div>
                  <div className="impact-lever">{impact.lever}</div>
                  <div className="impact-detail">{impact.detail}</div>
                </div>
                <div className="impact-saving" style={{color}}>
                  {impact.years_impact > 0 ? `−${impact.years_impact} yrs` : `+${Math.abs(impact.years_impact)} yrs`}
                </div>
              </div>
              <CompareBar baseYears={base_years_to_fire} improvedYears={improved} color={color} />
            </div>
          );
        })}
      </div>

      <p className="impact-note">
        Calculated using compound SIP formula. Assumes consistent contributions at stated return rates.
      </p>
    </div>
  );
}
