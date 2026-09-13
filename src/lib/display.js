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

// eAG display rule (ticket 08, Spec §5 a1c row / §8 T1): BOTH eAG units render
// with exactly 1 decimal, half-up — the T1 golden value for eag(7.0) is 154.2
// (one decimal), so eAG mg/dL deliberately does NOT reuse the integer
// formatMgdl rule. Naive Math.round(x*10)/10 misrounds the spec's own golden
// values because of binary float noise: raw eag(6.5) is 139.84999999999997,
// which naive rounding turns into "139.8" instead of the half-up "139.9"
// (the same trap §8 T1 flags for (139.85).toFixed(1) → "139.8"). The scaled
// value is therefore snapped to 12 significant digits first, recovering the
// intended decimal value before the half-up rounding:
//   eag(7.0)     = 154.2              → "154.2"
//   eag(6.5)     = 139.84999999999997 → "139.9"
//   eagMmol(7.0) = 8.540000000000001  → "8.5"
export function formatEag(raw) {
  const scaled = Number((Number(raw) * 10).toPrecision(12));
  return (Math.round(scaled) / 10).toFixed(1);
}

// GMI display rule (ticket 10, Spec §5 gmi row / §5A.2 gmi / §8 T1): one
// decimal, %, half-up. Reuses formatEag's float-noise defense: the ×10-scaled
// value is snapped to 12 significant digits before Math.round, so binary noise
// on either side of a .x5 boundary cannot flip the half-up result (raw
// gmi(125) is 6.300000000000001; an exact half like a raw 6.25 must go UP to
// "6.3", which (6.25).toFixed(1) banker's-style would get right here but the
// snap keeps the rule uniform with formatEag). Golden values (§8 T1 + ticket
// 10 e2e):
//   gmi(150)              = 6.898              → "6.9"
//   gmi(154)              = 6.9936799999999995 → "7.0"  (carry across 7)
//   gmi(mmolToMgdl(8.3)),
//     8.3 mmol/L = 149.5494 mg/dL
//                         = 6.887221648        → "6.9"
export function formatGmi(raw) {
  const scaled = Number((Number(raw) * 10).toPrecision(12));
  return (Math.round(scaled) / 10).toFixed(1);
}

// Estimated-A1C range display (ticket 09, Spec §5A.2 estimator / §1 D4).
// formulas.a1cRange already performs the ONE spec-mandated rounding inside
// formulas.js (each endpoint half-up to 0.1%), so this helper only fixes the
// decimals and joins with an en dash. The output is deliberately a RANGE
// string — there is no single-point formatter for this tool, and e2e +
// verify-dist assert the "≈ X.X% – Y.Y%" shape:
//   a1cRange(126)     = {low: 5.5, high: 6.6} → "≈ 5.5% – 6.6%"
//   a1cRange(126.126) = {low: 5.5, high: 6.6} → "≈ 5.5% – 6.6%"  (7.0 mmol/L)
//   a1cRange(180.18)  = {low: 7.4, high: 8.5} → "≈ 7.4% – 8.5%"  (10.0 mmol/L;
//     note 180 mg/dL gives 8.4 — the discriminator that mmol input really is
//     converted before entering a1cRange, not display-rounded to 180)
export function formatA1cRange(range) {
  return `≈ ${range.low.toFixed(1)}% – ${range.high.toFixed(1)}%`;
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
