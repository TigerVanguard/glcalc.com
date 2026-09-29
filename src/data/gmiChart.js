// GMI chart dataset for /gmi-calculator (GMI content spec GC-01, D2/D3).
//
// 30 rows: GMI 5.5%–8.0% in 0.1 steps, then 8.5, 9.0, 9.5, and 10.0. The GMI
// values are generated as integer tenths and divided by 10 once, so no
// floating-point step error can accumulate. Every glucose value is COMPUTED
// AT MODULE LOAD — mg/dL via formulas.meanGlucoseFromGmi (the exact inverse
// of the Bergenstal 2018 GMI definition), mmol/L via formulas.mgdlToMmol —
// and every display string comes from display.js. No number in this table is
// hand-typed; scripts/verify-dist.mjs re-hardcodes golden rows independently.
//
// Conversion only: rows carry no band, label, or highlight of any kind (GMI
// content spec §3 red line 2).

import { meanGlucoseFromGmi, mgdlToMmol } from "../lib/formulas.js";
import { formatGmi, formatMgdl, formatMmol } from "../lib/display.js";

const GMI_TENTHS = [
  ...Array.from({ length: 80 - 55 + 1 }, (_, i) => 55 + i),
  85,
  90,
  95,
  100,
];

/**
 * One chart row: { gmi, mgdl, mmol } unrounded, plus the display strings
 * { gmiDisplay: "6.5%", mgdlDisplay: "133", mmolDisplay: "7.4" }.
 */
export function gmiChartRow(gmiPercent) {
  const mgdl = meanGlucoseFromGmi(gmiPercent);
  const mmol = mgdlToMmol(mgdl);
  return {
    gmi: gmiPercent,
    mgdl,
    mmol,
    gmiDisplay: `${formatGmi(gmiPercent)}%`,
    mgdlDisplay: formatMgdl(mgdl),
    mmolDisplay: formatMmol(mmol),
  };
}

export const GMI_CHART = GMI_TENTHS.map((tenths) => gmiChartRow(tenths / 10));
