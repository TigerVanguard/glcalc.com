// Estimated A1C range chart for /glucose-to-a1c-estimator (content-ux batch
// CU-03).
//
// 18 rows: average glucose 70–240 mg/dL in steps of 10, all inside the ADAG
// window (≈68.1–240.3 mg/dL, so formulas.a1cRange never flags outOfRange here
// and no row is extrapolated). Every value is COMPUTED AT MODULE LOAD through
// the estimator's own path — the range is display.formatA1cRange of
// formulas.a1cRange, exactly what the calculator shows for the same input, and
// mmol/L is display.formatMmol of formulas.mgdlToMmol. No number in this table
// is hand-typed; scripts/verify-dist.mjs re-hardcodes golden rows
// independently.
//
// Range lookup only (main Spec D4 / §9): every row is an interval
// "≈ X.X% – Y.Y%", never a single A1C value, and rows carry no band, label,
// or highlight of any kind.

import { a1cRange, mgdlToMmol } from "../lib/formulas.js";
import { formatA1cRange, formatMgdl, formatMmol } from "../lib/display.js";

const MGDL_VALUES = Array.from({ length: 18 }, (_, i) => 70 + i * 10);

/**
 * One chart row: { mgdl, mmol } unrounded, plus the display strings
 * { mgdlDisplay: "160", mmolDisplay: "8.9", rangeDisplay: "≈ 6.7% – 7.7%" }.
 */
export function estimatorChartRow(mgdl) {
  const mmol = mgdlToMmol(mgdl);
  return {
    mgdl,
    mmol,
    mgdlDisplay: formatMgdl(mgdl),
    mmolDisplay: formatMmol(mmol),
    rangeDisplay: formatA1cRange(a1cRange(mgdl)),
  };
}

export const ESTIMATOR_CHART = MGDL_VALUES.map(estimatorChartRow);
