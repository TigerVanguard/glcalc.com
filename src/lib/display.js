// Display-layer helpers (Spec §5A.1-4 / §5A.2, ticket 07). formulas.js returns
// raw, unrounded values; every user-facing rounding rule lives HERE so pages,
// verify-dist expectations, and e2e golden values share one definition:
//
// - mg/dL renders as an integer (Math.round, half-up):
//     mmolToMgdl(5.5) = 99.099        → "99"
// - mmol/L renders with exactly 1 decimal (round half-up to 0.1, then fixed):
//     mgdlToMmol(100) = 5.5500555…    → "5.6"
//     mgdlToMmol(126) = 6.9930070…    → "7.0"
//     mgdlToMmol(1200) = 66.600067…   → "66.6"

export function formatMgdl(raw) {
  return String(Math.round(Number(raw)));
}

export function formatMmol(raw) {
  return (Math.round(Number(raw) * 10) / 10).toFixed(1);
}

// Shared input parsing for the numeric tools (converter / a1c-to-eag /
// glucose-to-a1c / gmi). Three states per §5A.1-4:
// - "empty":   placeholder only — never 0, never NaN;
// - "invalid": non-numeric or ≤0 — page shows ErrorNotice, output cleared;
// - "valid":   finite number > 0, returned unrounded.
export function parsePositiveNumber(text) {
  const trimmed = String(text).trim();
  if (trimmed === "") {
    return { state: "empty", value: null };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) {
    return { state: "invalid", value: null };
  }
  return { state: "valid", value };
}
