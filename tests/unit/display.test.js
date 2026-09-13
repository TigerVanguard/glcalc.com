// Display-layer rounding + input parsing (ticket 07, Spec §5A.1-4/§5A.2).
// These anchor the T4-1 e2e golden values: the display strings asserted in
// tests/e2e/converter.spec.js must be derivable as
// format*(formulas raw value) — verified here without a browser.
//
// String-equality assertions are safe here (unlike raw float comparisons):
// format* output IS the display contract.

import { describe, expect, it } from "vitest";
import { eag, eagMmol, mgdlToMmol, mmolToMgdl } from "../../src/lib/formulas.js";
import { formatEag, formatMgdl, formatMmol, parsePositiveNumber } from "../../src/lib/display.js";

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

describe("formatEag (1 decimal, half-up, float-noise snapped — ticket 08)", () => {
  it("renders eag(7.0) = 154.2 as 154.2 (T1 golden value)", () => {
    expect(formatEag(eag(7.0))).toBe("154.2");
  });

  it("renders eag(6.5) = 139.85 as 139.9 despite the raw float being 139.84999…", () => {
    // The §8 T1 float trap: raw eag(6.5) is 139.84999999999997, so a naive
    // Math.round(x*10)/10 (and (139.85).toFixed(1)) both yield "139.8".
    // formatEag's 12-significant-digit snap recovers the half-up "139.9".
    expect(eag(6.5)).toBeCloseTo(139.85, 2);
    expect(formatEag(eag(6.5))).toBe("139.9");
  });

  it("renders eagMmol(7.0) = 8.54 as 8.5", () => {
    expect(formatEag(eagMmol(7.0))).toBe("8.5");
  });

  it("rounds exact halves up: eag(3.5) = 53.75 → 53.8, eagMmol(3.5) = 2.975 → 3.0", () => {
    expect(formatEag(eag(3.5))).toBe("53.8");
    expect(formatEag(eagMmol(3.5))).toBe("3.0");
  });

  it("keeps exactly one decimal, padding with zero", () => {
    expect(formatEag(eag(6.0))).toBe("125.5");
    expect(formatEag(eagMmol(6.0))).toBe("7.0");
    expect(formatEag(154)).toBe("154.0");
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
