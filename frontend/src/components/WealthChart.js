import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { formatINR } from "../services/api";
import "./WealthChart.css";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <div className="chart-tip-year">Year {label}</div>
      {payload.map(p => (
        <div key={p.name} className="chart-tip-row">
          <span className="chart-tip-dot" style={{background:p.color}} />
          <span className="chart-tip-name">{p.name}</span>
          <span className="chart-tip-val">{formatINR(p.value, true)}</span>
        </div>
      ))}
    </div>
  );
}

function fmtY(v) {
  if (v >= 10000000) return `₹${(v/10000000).toFixed(0)}Cr`;
  if (v >= 100000)   return `₹${(v/100000).toFixed(0)}L`;
  if (v >= 1000)     return `₹${(v/1000).toFixed(0)}K`;
  return `₹${v}`;
}

export default function WealthChart({ data, fireCorpus, yearsLeft, persona, annualRate }) {
  const chartData = data.map(d => ({...d, corpus_target: fireCorpus}));
  const crossover = data.findIndex(d => d.invested_wealth >= fireCorpus);

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <div className="section-heading" style={{marginBottom:2}}>Wealth Projection</div>
          <p className="chart-sub">
            Portfolio growth vs FIRE target over {yearsLeft} years at {((annualRate||0.1)*100).toFixed(0)}% p.a.
          </p>
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-line" style={{background:"var(--blue-600)"}} />Invested Portfolio</span>
          <span className="legend-item"><span className="legend-line legend-line-dash" style={{borderColor:"var(--red-600)"}} />FIRE Target</span>
        </div>
      </div>

      {crossover > 0 && (
        <div className="chart-callout">
          Portfolio projected to reach FIRE corpus at Year {crossover}
        </div>
      )}

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{top:8,right:8,left:4,bottom:0}}>
          <defs>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--blue-500)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--blue-500)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="var(--grey-200)" vertical={false} />
          <XAxis dataKey="year"
            tick={{fill:"var(--grey-400)",fontSize:11,fontFamily:"Roboto Mono"}}
            tickLine={false} axisLine={false} />
          <YAxis tickFormatter={fmtY}
            tick={{fill:"var(--grey-400)",fontSize:11,fontFamily:"Roboto Mono"}}
            tickLine={false} axisLine={false} width={68} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={fireCorpus} stroke="var(--red-400)" strokeDasharray="5 3" strokeWidth={1.5}
            label={{value:`Target: ${formatINR(fireCorpus,true)}`,position:"insideTopLeft",fill:"var(--red-600)",fontSize:10,fontFamily:"Roboto Mono"}} />
          <Area type="monotone" dataKey="invested_wealth" name="Invested Portfolio"
            stroke="var(--blue-600)" strokeWidth={2} fill="url(#blueGrad)" dot={false}
            activeDot={{r:4,fill:"var(--blue-600)",stroke:"#fff",strokeWidth:2}} />
        </AreaChart>
      </ResponsiveContainer>

      <p className="chart-disclaimer">
        Past performance does not guarantee future results. Projections are illustrative only.
      </p>
    </div>
  );
}
