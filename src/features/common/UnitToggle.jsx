import React from "react";
import { mgdlToMmol, mmolToMgdl } from "../../lib/formulas.js";
import { formatMgdl, formatMmol, parsePositiveNumber } from "../../lib/display.js";

const UNITS = [
  { value: "mgdl", label: "mg/dL" },
  { value: "mmol", label: "mmol/L" },
];

// Shared mg/dL ⇄ mmol/L segmented toggle (Spec §5A.1-3, ticket 07; consumed by
// the GMI and glucose→A1C pages, tickets 08/10 — the converter page shows both
// units at once and does not need it). Controlled: the parent owns the unit
// and the input text. On switch, a currently-valid value is converted through
// formulas.js into the new unit's display precision and handed back together
// with the unit, so the visible number keeps meaning the same glucose level;
// empty/invalid text is passed through untouched.
export default function UnitToggle({ unit, value, onChange, label = "Units" }) {
  const select = (nextUnit) => {
    if (nextUnit === unit) {
      return;
    }
    const parsed = parsePositiveNumber(value);
    let nextValue = value;
    if (parsed.state === "valid") {
      nextValue =
        nextUnit === "mmol"
          ? formatMmol(mgdlToMmol(parsed.value))
          : formatMgdl(mmolToMgdl(parsed.value));
    }
    onChange(nextUnit, nextValue);
  };

  return (
    <div className="unit-toggle" role="group" aria-label={label}>
      {UNITS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`unit-toggle__option${
            option.value === unit ? " unit-toggle__option--active" : ""
          }`}
          aria-pressed={option.value === unit}
          onClick={() => select(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
