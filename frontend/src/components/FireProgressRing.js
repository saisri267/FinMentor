import React, { useEffect, useState } from "react";
import "./FireProgressRing.css";

function fmt(n) {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function FireProgressRing({ progressPct, yearsLeft, netWorth, fireCorpus }) {
  const [pct, setPct] = useState(0);
  const clamped = Math.min(Math.max(progressPct, 0), 100);

  useEffect(() => {
    const timer = setTimeout(() => setPct(clamped), 50);
    return () => clearTimeout(timer);
  }, [clamped]);

  const SIZE = 160; const STROKE = 10; const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC - (pct / 100) * CIRC;

  const ringColor = clamped >= 75 ? "var(--green-600)" : clamped >= 40 ? "var(--blue-600)" : "var(--amber-600)";
  const statusText = clamped >= 100 ? "Target reached" : clamped >= 75 ? "Near target" : clamped >= 40 ? "On track" : "Building";

  return (
    <div className="card ring-card">
      <div className="section-heading">FIRE Progress</div>
      <div className="ring-layout">
        <div className="ring-wrap" style={{width:SIZE, height:SIZE}}>
          <svg width={SIZE} height={SIZE}>
            <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="var(--grey-200)" strokeWidth={STROKE} />
            <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={ringColor} strokeWidth={STROKE}
              strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
              style={{transform:"rotate(-90deg)", transformOrigin:"center", transition:"stroke-dashoffset 800ms ease"}} />
          </svg>
          <div className="ring-center">
            <div className="ring-pct" style={{color: ringColor}}>{pct.toFixed(1)}%</div>
            <div className="ring-sub">funded</div>
            <div className="ring-status" style={{color: ringColor}}>{statusText}</div>
          </div>
        </div>

        <div className="ring-stats">
          {[
            { label: "Net Worth",      value: fmt(netWorth) },
            { label: "Target Corpus",  value: fmt(fireCorpus) },
            { label: "Remaining Gap",  value: fmt(Math.max(fireCorpus - netWorth, 0)) },
            { label: "Years Left",     value: `${yearsLeft} years` },
          ].map(s => (
            <div key={s.label} className="ring-stat">
              <div className="ring-stat-label">{s.label}</div>
              <div className="ring-stat-val">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:11,color:"var(--text-muted)"}}>₹0</span>
          <span style={{fontSize:11,color:"var(--text-muted)"}}>{fmt(fireCorpus)}</span>
        </div>
        <div className="progress-track" style={{height:6}}>
          <div className="progress-fill" style={{width:`${pct}%`, background:ringColor}} />
        </div>
      </div>
    </div>
  );
}
