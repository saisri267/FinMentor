import React from "react";
import { formatINR } from "../services/api";
import FireStats from "../components/FireStats";
import FireProgressRing from "../components/FireProgressRing";
import ScoreCard from "../components/ScoreCard";
import ProfileSummary from "../components/ProfileSummary";
import WealthChart from "../components/WealthChart";
import DecisionImpact from "../components/DecisionImpact";
import TopAction from "../components/TopAction";
import InsightsPanel from "../components/InsightsPanel";
import AIExplanation from "../components/AIExplanation";
import "./Dashboard.css";

const PERSONA_LABEL = { conservative:"Conservative — 8% p.a.", balanced:"Balanced — 10% p.a.", aggressive:"Aggressive — 12% p.a." };
const RELIABILITY_COLOR = { High:"green", Moderate:"amber", Low:"red" };

export default function Dashboard({ result, formData, onReset }) {
  const {
    fire_corpus, inflation_adjusted_corpus, sip_required, years_left,
    persona, annual_return_rate,
    health_score, health_grade, health_grade_label, score_breakdown,
    profile_summary, reliability,
    insights, decision_impact, top_action, wealth_projection,
    ai_explanation, cached,
  } = result;

  const baseYears = decision_impact?.base_years_to_fire || years_left;
  const relColor  = RELIABILITY_COLOR[reliability?.label] || "amber";

  return (
    <div className="dash-page">
      {/* Header */}
      <header className="site-header">
        <div className="container header-inner">
          <div className="logo">
            <div className="logo-mark">F</div>
            <div>
              <div className="logo-name">FinMentor</div>
              <div className="logo-tagline">Financial Independence Planner</div>
            </div>
          </div>
          <div className="header-right">
            {cached && <span className="badge badge-blue">Cached</span>}
            <button className="btn btn-secondary" onClick={onReset}>New Analysis</button>
          </div>
        </div>
      </header>

      <div className="container dash-body">

        {/* Page title bar */}
        <div className="dash-titlebar fade-up">
          <div className="dash-title-left">
            <h1 className="dash-title">Financial Analysis Report</h1>
            <div className="dash-meta-row">
              <span className="meta-pill">Age {formData.age}</span>
              <span className="meta-sep">·</span>
              <span className="meta-pill">Target retirement {formData.retirement_age}</span>
              <span className="meta-sep">·</span>
              <span className="meta-pill">{years_left} years remaining</span>
              <span className="meta-sep">·</span>
              <span className="meta-pill">{PERSONA_LABEL[persona]}</span>
            </div>
          </div>
          {reliability && (
            <div className={`reliability-block reliability-${relColor}`}>
              <span className="reliability-label">Plan Reliability</span>
              <span className="reliability-value">{reliability.label}</span>
              <span className="reliability-score">{reliability.score}/100</span>
            </div>
          )}
        </div>

        {/* Reliability warnings */}
        {reliability?.notes?.length > 0 && (
          <div className="alert-row fade-up">
            {reliability.notes.map((n, i) => (
              <div key={i} className="alert-item alert-amber">
                <span className="status-dot amber" />
                {n}
              </div>
            ))}
          </div>
        )}

        {/* Top action */}
        {top_action?.lever && <TopAction topAction={top_action} baseYears={baseYears} />}

        {/* KPI strip */}
        <FireStats
          fireCorpus={fire_corpus}
          inflationCorpus={inflation_adjusted_corpus}
          sipRequired={sip_required}
          yearsLeft={years_left}
          profileSummary={profile_summary}
        />

        {/* Row: Progress ring + Score */}
        <div className="grid-2" style={{marginTop:16}}>
          <FireProgressRing
            progressPct={profile_summary.fire_progress_pct}
            yearsLeft={years_left}
            netWorth={profile_summary.net_worth}
            fireCorpus={fire_corpus}
          />
          <ScoreCard
            score={health_score}
            grade={health_grade}
            gradeLabel={health_grade_label}
            breakdown={score_breakdown}
          />
        </div>

        {/* Profile summary — full width */}
        <div style={{marginTop:16}}>
          <ProfileSummary summary={profile_summary} />
        </div>

        {/* Chart */}
        <div style={{marginTop:16}}>
          <WealthChart
            data={wealth_projection}
            fireCorpus={fire_corpus}
            yearsLeft={years_left}
            persona={PERSONA_LABEL[persona]}
            annualRate={annual_return_rate}
          />
        </div>

        {/* Decision impact */}
        <div style={{marginTop:16}}>
          <DecisionImpact data={decision_impact} />
        </div>

        {/* Insights + AI */}
        <div className="grid-2" style={{marginTop:16}}>
          <InsightsPanel insights={insights} />
          <AIExplanation explanation={ai_explanation} />
        </div>

        {/* Footer */}
        <div className="dash-footer fade-up">
          <p>
            Projections assume {(annual_return_rate * 100).toFixed(0)}% annual CAGR ({PERSONA_LABEL[persona]}).
            Past performance does not guarantee future returns.
            Consult a SEBI-registered investment adviser before making decisions.
          </p>
          <button className="btn btn-primary" onClick={onReset}>Run New Analysis</button>
        </div>
      </div>
    </div>
  );
}
