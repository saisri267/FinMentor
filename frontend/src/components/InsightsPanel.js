import React, { useState } from "react";
import "./InsightsPanel.css";

const LEVEL_CONFIG = {
  HIGH:   { cls:"red",   badge:"badge-red",   bar:"var(--red-600)"   },
  MEDIUM: { cls:"amber", badge:"badge-amber",  bar:"var(--amber-600)" },
  LOW:    { cls:"blue",  badge:"badge-blue",   bar:"var(--blue-400)"  },
};

export default function InsightsPanel({ insights }) {
  const [open, setOpen] = useState(null);
  const high = insights.filter(i => i.priority_level === "HIGH").length;
  const med  = insights.filter(i => i.priority_level === "MEDIUM").length;

  return (
    <div className="card insights-card">
      <div className="insights-head">
        <div className="section-heading" style={{marginBottom:0}}>Recommendations</div>
        <div style={{display:"flex",gap:6}}>
          {high > 0 && <span className="badge badge-red">{high} High</span>}
          {med  > 0 && <span className="badge badge-amber">{med} Medium</span>}
        </div>
      </div>
      <p className="insights-desc">Rule-based analysis of your financial profile. Select an item for details.</p>

      <div className="insights-list">
        {insights.map((item, i) => {
          const cfg = LEVEL_CONFIG[item.priority_level] || LEVEL_CONFIG.LOW;
          const isOpen = open === i;
          return (
            <div key={i} className={`insight-row insight-${cfg.cls} ${isOpen ? "open" : ""}`}
              onClick={() => setOpen(isOpen ? null : i)} role="button">
              <div className="insight-row-head">
                <div className="insight-left">
                  <div className="insight-level-bar" style={{background: cfg.bar}} />
                  <div>
                    <div className="insight-title">{item.title}</div>
                    <div className="insight-category">{item.category}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  <span className={`badge ${cfg.badge}`}>{item.priority_level}</span>
                  <span className="insight-chevron">{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {isOpen && (
                <div className="insight-body">
                  <p className="insight-message">{item.message}</p>
                  <div className="insight-action-row">
                    <span className="insight-action-label">Recommended action</span>
                    <span className="insight-action-text">{item.action}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
