// Display-layer rounding + input parsing (ticket 07, Spec §5A.1-4/§5A.2).
// These anchor the T4-1 e2e golden values: the display strings asserted in
// tests/e2e/converter.spec.js must be derivable as
// format*(formulas raw value) — verified here without a browser.
//
// String-equality assertions are safe here (unlike raw float comparisons):
// format* output IS the display contract.

import { describe, expect, it } from "vitest";
import { a1cRange, eag, eagMmol, gmi, mgdlToMmol, mmolToMgdl } from "../../src/lib/formulas.js";
import {
  formatA1cRange,
  formatEag,
  formatGmi,
  formatMgdl,
  formatMmol,
  parsePositiveNumber,
} from "../../src/lib/display.js";

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

describe("formatGmi (1 decimal, half-up, float-noise snapped — ticket 10)", () => {
  it("renders gmi(150) = 6.898 as 6.9 (§8 T1 golden value)", () => {
    expect(gmi(150)).toBeCloseTo(6.898, 3);
    expect(formatGmi(gmi(150))).toBe("6.9");
  });

  it("carries gmi(154) = 6.99368 across the integer: 7.0", () => {
    // Raw JS value is 6.9936799999999995 — the 12-significant-digit snap
    // keeps that noise from mattering, and half-up carries .99368 to 7.0.
    expect(formatGmi(gmi(154))).toBe("7.0");
  });

  it("converts 8.3 mmol/L through mmolToMgdl before gmi: 149.5494 → 6.9", () => {
    // 8.3 × 18.018 = 149.5494 mg/dL → 3.31 + 0.02392 × 149.5494 =
    // 6.887221648 → "6.9". Feeding 8.3 straight into gmi would give "3.5" —
    // the discriminator that mmol input really is converted first.
    expect(mmolToMgdl(8.3)).toBeCloseTo(149.5494, 4);
    expect(formatGmi(gmi(mmolToMgdl(8.3)))).toBe("6.9");
    expect(formatGmi(gmi(8.3))).toBe("3.5");
  });

  it("rounds exact halves up: 6.25 → 6.3", () => {
    expect(formatGmi(6.25)).toBe("6.3");
  });

  it("snaps float noise: gmi(125) = 6.300000000000001 → 6.3", () => {
    expect(formatGmi(gmi(125))).toBe("6.3");
  });

  it("keeps exactly one decimal, padding with zero", () => {
    expect(formatGmi(7)).toBe("7.0");
    expect(formatGmi(gmi(700))).toBe("20.1");
  });
});

describe("formatA1cRange (always a range, never a point — ticket 09)", () => {
  it("renders the §8 T1 golden value: a1cRange(126) → ≈ 5.5% – 6.6%", () => {
    // Center (126+46.7)/28.7 = 6.0174, half-width 15.7/28.7 = 0.5470 →
    // [5.4703, 6.5644] → endpoints rounded 0.1% each.
    expect(formatA1cRange(a1cRange(126))).toBe("≈ 5.5% – 6.6%");
  });

  it("renders the mmol/L golden value: 7.0 mmol/L = 126.126 mg/dL → same range", () => {
    // Center (126.126+46.7)/28.7 = 6.0218 → [5.4748, 6.5689] → 5.5 / 6.6.
    expect(formatA1cRange(a1cRange(mmolToMgdl(7.0)))).toBe("≈ 5.5% – 6.6%");
  });

  it("discriminates 10.0 mmol/L (180.18 mg/dL → high 8.5) from plain 180 mg/dL (high 8.4)", () => {
    // Proves mmol input must flow through mmolToMgdl BEFORE a1cRange: if a
    // page display-rounded 10.0 mmol/L to 180 mg/dL first, the high endpoint
    // would come out 8.4 instead of 8.5 (center 7.9052 vs 7.8990).
    expect(formatA1cRange(a1cRange(mmolToMgdl(10.0)))).toBe("≈ 7.4% – 8.5%");
    expect(formatA1cRange(a1cRange(180))).toBe("≈ 7.4% – 8.4%");
  });

  it("still renders a range below the ADAG window (50 mg/dL, outOfRange)", () => {
    // Center (50+46.7)/28.7 = 3.3693 → [2.8223, 3.9164] → 2.8 / 3.9.
    const range = a1cRange(50);
    expect(range.outOfRange).toBe(true);
    expect(formatA1cRange(range)).toBe("≈ 2.8% – 3.9%");
  });

  it("always matches the range shape and pads endpoints to one decimal", () => {
    for (const mgdl of [50, 68.1, 100, 126, 154, 180, 240.3, 300]) {
      expect(formatA1cRange(a1cRange(mgdl))).toMatch(/^≈ \d+\.\d% – \d+\.\d%$/);
    }
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
