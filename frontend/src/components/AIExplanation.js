import React from "react";
import "./AIExplanation.css";

export default function AIExplanation({ explanation }) {
  return (
    <div className="card ai-card">
      <div className="section-heading">AI Summary</div>
      <div className="ai-note">
        <span className="status-dot green" />
        Generated from calculated results only — AI does not perform financial calculations.
      </div>
      <blockquote className="ai-text">{explanation}</blockquote>
      <div className="ai-footer">
        <span className="ai-model-note">Explanation only</span>
      </div>
    </div>
  );
}
