// Display-layer rounding + input parsing (ticket 07, Spec §5A.1-4/§5A.2).
// These anchor the T4-1 e2e golden values: the display strings asserted in
// tests/e2e/converter.spec.js must be derivable as
// format*(formulas raw value) — verified here without a browser.
//
// String-equality assertions are safe here (unlike raw float comparisons):
// format* output IS the display contract.

import { describe, expect, it } from "vitest";
import { mgdlToMmol, mmolToMgdl } from "../../src/lib/formulas.js";
import { formatMgdl, formatMmol, parsePositiveNumber } from "../../src/lib/display.js";

describe("formatMmol (1 decimal, half-up)", () => {
  it("renders mgdlToMmol(100) = 5.5500… as 5.6", () => {
    expect(formatMmol(mgdlToMmol(100))).toBe("5.6");
  });

  it("renders the reference-table anchors consistently with formulas", () => {
    const expected = { 70: "3.9", 100: "5.6", 126: "7.0", 140: "7.8", 180: "10.0", 200: "11.1" };
    for (const [mgdl, mmol] of Object.entries(expected)) {
      expect(formatMmol(mgdlToMmol(Number(mgdl)))).toBe(mmol);
    }
  });

  it("keeps exactly one decimal, padding with zero", () => {
    expect(formatMmol(7)).toBe("7.0");
    expect(formatMmol(mgdlToMmol(1200))).toBe("66.6");
  });
});

describe("formatMgdl (integer, half-up)", () => {
  it("renders mmolToMgdl(5.5) = 99.099 as 99", () => {
    expect(formatMgdl(mmolToMgdl(5.5))).toBe("99");
  });

  it("round-trips a whole mg/dL value unchanged", () => {
    expect(formatMgdl(mmolToMgdl(mgdlToMmol(126)))).toBe("126");
  });
});

describe("parsePositiveNumber", () => {
  it("treats empty and whitespace-only input as the empty state", () => {
    expect(parsePositiveNumber("").state).toBe("empty");
    expect(parsePositiveNumber("   ").state).toBe("empty");
  });

  it("rejects non-numeric, non-finite, zero, and negative input", () => {
    for (const bad of ["abc", "-5", "0", "1e999", "Infinity", "12abc"]) {
      expect(parsePositiveNumber(bad).state, `input "${bad}"`).toBe("invalid");
    }
  });

  it("returns the unrounded value for valid input", () => {
    expect(parsePositiveNumber("5.5")).toEqual({ state: "valid", value: 5.5 });
    expect(parsePositiveNumber(" 100 ")).toEqual({ state: "valid", value: 100 });
  });
});
