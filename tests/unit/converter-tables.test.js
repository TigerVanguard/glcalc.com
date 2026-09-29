// Content-ux batch CU-02: the two /blood-sugar-converter conversion tables,
// built at module load from formulas.js + display.js. Raw floats are compared
// with tolerances; display strings with string equality (they ARE the display
// contract). Golden values are the spec's 13, independently verified.

import { describe, expect, it } from "vitest";
import { mgdlToMmol, mmolToMgdl } from "../../src/lib/formulas.js";
import { formatMgdl, formatMmol } from "../../src/lib/display.js";
import {
  MGDL_TO_MMOL_TABLE,
  MMOL_TO_MGDL_TABLE,
} from "../../src/data/converterTables.js";

const EXPECTED_MGDL = [
  40, 50, 60, 70, 80, 90, 100, 110, 120, 126, 130, 140, 150, 160, 170, 180, 190,
  200, 220, 240, 250, 270, 300, 350, 400, 450, 500, 550, 600,
];

const EXPECTED_MMOL_DISPLAY = [
  "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0",
  "7.5", "8.0", "8.5", "9.0", "9.5", "10.0", "11.0", "12.0", "13.0", "14.0",
  "15.0", "16.0", "18.0", "20.0", "25.0", "30.0",
];

describe("MGDL_TO_MMOL_TABLE (mg/dL → mmol/L, 29 rows)", () => {
  it("holds exactly the 29 spec mg/dL values, in order", () => {
    expect(MGDL_TO_MMOL_TABLE).toHaveLength(29);
    expect(MGDL_TO_MMOL_TABLE.map((row) => row.mgdl)).toEqual(EXPECTED_MGDL);
    expect(MGDL_TO_MMOL_TABLE.map((row) => row.mgdlDisplay)).toEqual(
      EXPECTED_MGDL.map(String),
    );
  });

  it("derives every value from formulas.js and every string from display.js", () => {
    for (const row of MGDL_TO_MMOL_TABLE) {
      const label = `${row.mgdl} mg/dL`;
      expect(Math.abs(row.mmol - mgdlToMmol(row.mgdl)), label).toBeLessThan(1e-12);
      expect(Math.abs(row.mmol - row.mgdl / 18.018), label).toBeLessThan(1e-9);
      expect(row.mgdlDisplay, label).toBe(formatMgdl(row.mgdl));
      expect(row.mmolDisplay, label).toBe(formatMmol(row.mmol));
    }
  });

  it("matches the 6 spec golden rows", () => {
    const GOLDEN = [
      ["40", "2.2"],
      ["60", "3.3"],
      ["126", "7.0"],
      ["250", "13.9"],
      ["300", "16.7"],
      ["600", "33.3"],
    ];
    const byMgdl = new Map(MGDL_TO_MMOL_TABLE.map((row) => [row.mgdlDisplay, row]));
    for (const [mgdl, mmol] of GOLDEN) {
      expect(byMgdl.get(mgdl)?.mmolDisplay, `${mgdl} mg/dL`).toBe(mmol);
    }
  });

  it("is a pure conversion: strictly increasing, with no band or label field", () => {
    for (let i = 1; i < MGDL_TO_MMOL_TABLE.length; i += 1) {
      expect(MGDL_TO_MMOL_TABLE[i].mmol).toBeGreaterThan(MGDL_TO_MMOL_TABLE[i - 1].mmol);
    }
    for (const row of MGDL_TO_MMOL_TABLE) {
      expect(Object.keys(row).sort()).toEqual(["mgdl", "mgdlDisplay", "mmol", "mmolDisplay"]);
    }
  });
});

describe("MMOL_TO_MGDL_TABLE (mmol/L → mg/dL, 27 rows)", () => {
  it("holds exactly the 27 spec mmol/L values, in order", () => {
    expect(MMOL_TO_MGDL_TABLE).toHaveLength(27);
    expect(MMOL_TO_MGDL_TABLE.map((row) => row.mmolDisplay)).toEqual(EXPECTED_MMOL_DISPLAY);
    MMOL_TO_MGDL_TABLE.forEach((row, i) => {
      expect(Math.abs(row.mmol - Number(EXPECTED_MMOL_DISPLAY[i])), `row ${i}`).toBeLessThan(1e-12);
    });
  });

  it("derives every value from formulas.js and every string from display.js", () => {
    for (const row of MMOL_TO_MGDL_TABLE) {
      const label = `${row.mmolDisplay} mmol/L`;
      expect(Math.abs(row.mgdl - mmolToMgdl(row.mmol)), label).toBeLessThan(1e-12);
      expect(Math.abs(row.mgdl - row.mmol * 18.018), label).toBeLessThan(1e-9);
      expect(row.mmolDisplay, label).toBe(formatMmol(row.mmol));
      expect(row.mgdlDisplay, label).toBe(formatMgdl(row.mgdl));
    }
  });

  it("matches the 7 spec golden rows", () => {
    const GOLDEN = [
      ["2.0", "36"],
      ["4.0", "72"],
      ["5.5", "99"],
      ["7.0", "126"],
      ["10.0", "180"],
      ["11.0", "198"],
      ["30.0", "541"],
    ];
    const byMmol = new Map(MMOL_TO_MGDL_TABLE.map((row) => [row.mmolDisplay, row]));
    for (const [mmol, mgdl] of GOLDEN) {
      expect(byMmol.get(mmol)?.mgdlDisplay, `${mmol} mmol/L`).toBe(mgdl);
    }
  });

  it("is a pure conversion: strictly increasing, with no band or label field", () => {
    for (let i = 1; i < MMOL_TO_MGDL_TABLE.length; i += 1) {
      expect(MMOL_TO_MGDL_TABLE[i].mgdl).toBeGreaterThan(MMOL_TO_MGDL_TABLE[i - 1].mgdl);
    }
    for (const row of MMOL_TO_MGDL_TABLE) {
      expect(Object.keys(row).sort()).toEqual(["mgdl", "mgdlDisplay", "mmol", "mmolDisplay"]);
    }
  });
});
