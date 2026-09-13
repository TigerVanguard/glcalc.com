import React from "react";

// Shared live-output card (Spec §5A.1-3, ticket 07; reused by tickets
// 08/09/10). Mirrors CalculatorResult's stat/pill visual language. The whole
// card is an aria-live="polite" region so screen readers hear recalculations.
// A null/undefined/"" `value` renders the placeholder hint — never 0 or NaN
// (§5A.1-4 empty-input rule).
export default function ResultCard({ label, value, badge, badgeTone, note, placeholder }) {
  const hasValue = value !== null && value !== undefined && value !== "";

  return (
    <div className="stat result-card" aria-live="polite">
      <p className="stat__label">{label}</p>
      {hasValue ? (
        <p className="stat__value">
          <strong>{value}</strong>
          {badge ? (
            <span className={`pill pill--${(badgeTone ?? "low").toLowerCase()}`}>{badge}</span>
          ) : null}
        </p>
      ) : (
        <p className="result-card__placeholder muted">{placeholder}</p>
      )}
      {hasValue && note ? <p className="stat__note">{note}</p> : null}
    </div>
  );
}
