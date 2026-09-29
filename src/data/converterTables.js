// Conversion tables for /blood-sugar-converter (content-ux batch CU-02).
//
// Forward table: 29 mg/dL values, 40–600. Reverse table: 27 mmol/L values,
// 2.0–30.0, kept as integer tenths and divided by 10 once. Every converted
// value is COMPUTED AT MODULE LOAD through formulas.mgdlToMmol /
// formulas.mmolToMgdl — the same conversion the interactive tool uses — and
// every display string comes from display.js. No number in either table is
// hand-typed; scripts/verify-dist.mjs re-hardcodes golden rows independently.
//
// Conversion only: rows carry no band, label, or highlight of any kind.

import { mgdlToMmol, mmolToMgdl } from "../lib/formulas.js";
import { formatMgdl, formatMmol } from "../lib/display.js";

const FORWARD_MGDL = [
  40, 50, 60, 70, 80, 90, 100, 110, 120, 126, 130, 140, 150, 160, 170, 180, 190,
  200, 220, 240, 250, 270, 300, 350, 400, 450, 500, 550, 600,
];

const REVERSE_MMOL_TENTHS = [
  20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120,
  130, 140, 150, 160, 180, 200, 250, 300,
];

/**
 * mg/dL → mmol/L row: { mgdl, mmol } unrounded, plus display strings
 * { mgdlDisplay: "126", mmolDisplay: "7.0" }.
 */
export function mgdlToMmolRow(mgdl) {
  const mmol = mgdlToMmol(mgdl);
  return {
    mgdl,
    mmol,
    mgdlDisplay: formatMgdl(mgdl),
    mmolDisplay: formatMmol(mmol),
  };
}

/**
 * mmol/L → mg/dL row: { mmol, mgdl } unrounded, plus display strings
 * { mmolDisplay: "5.5", mgdlDisplay: "99" }.
 */
export function mmolToMgdlRow(mmol) {
  const mgdl = mmolToMgdl(mmol);
  return {
    mmol,
    mgdl,
    mmolDisplay: formatMmol(mmol),
    mgdlDisplay: formatMgdl(mgdl),
  };
}

export const MGDL_TO_MMOL_TABLE = FORWARD_MGDL.map(mgdlToMmolRow);

export const MMOL_TO_MGDL_TABLE = REVERSE_MMOL_TENTHS.map((tenths) =>
  mmolToMgdlRow(tenths / 10),
);
