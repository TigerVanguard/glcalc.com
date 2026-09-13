import { describe, it, expect } from "vitest";
import {
  gl,
  glBand,
  giBand,
  mgdlToMmol,
  mmolToMgdl,
  eag,
  eagMmol,
  a1cRange,
  gmi,
} from "../../src/lib/formulas.js";

// All numeric assertions use tolerances (Spec §8 T1 forbids strict float equality).

describe("gl (glycemic load)", () => {
  it("gl(50, 30) ≈ 15 within 0.001 and bands as Medium", () => {
    const value = gl(50, 30);
    expect(Math.abs(value - 15)).toBeLessThan(0.001);
    expect(glBand(value)).toBe("Medium");
  });
});

describe("glBand boundaries (continuous, no gaps)", () => {
  it("10 → Low", () => {
    expect(glBand(10)).toBe("Low");
  });

  it("10.5 → Medium", () => {
    expect(glBand(10.5)).toBe("Medium");
  });

  it("19.99 → Medium", () => {
    expect(glBand(19.99)).toBe("Medium");
  });

  it("20 → High", () => {
    expect(glBand(20)).toBe("High");
  });
});

describe("giBand boundaries (continuous, no gaps)", () => {
  it("55 → Low", () => {
    expect(giBand(55)).toBe("Low");
  });

  it("56 → Medium", () => {
    expect(giBand(56)).toBe("Medium");
  });

  it("69.5 → Medium", () => {
    expect(giBand(69.5)).toBe("Medium");
  });

  it("70 → High", () => {
    expect(giBand(70)).toBe("High");
  });
});

describe("mg/dL ⇄ mmol/L conversion (÷ 18.018)", () => {
  it("mgdlToMmol(100) ≈ 5.55 within 0.01", () => {
    expect(Math.abs(mgdlToMmol(100) - 5.55)).toBeLessThan(0.01);
  });

  it("mmolToMgdl(5.55) ≈ 100 within 0.1", () => {
    expect(Math.abs(mmolToMgdl(5.55) - 100)).toBeLessThan(0.1);
  });

  it("round-trips both directions with error < 0.01", () => {
    expect(Math.abs(mmolToMgdl(mgdlToMmol(100)) - 100)).toBeLessThan(0.01);
    expect(Math.abs(mgdlToMmol(mmolToMgdl(5.55)) - 5.55)).toBeLessThan(0.01);
  });
});

describe("eag (A1C → mg/dL, 28.7×A1C − 46.7)", () => {
  it("eag(7.0) ≈ 154.2 within 0.01", () => {
    expect(Math.abs(eag(7.0) - 154.2)).toBeLessThan(0.01);
  });

  it("eag(6.5) ≈ 139.85 within 0.01 (not the legacy 139.9 — no internal rounding)", () => {
    expect(Math.abs(eag(6.5) - 139.85)).toBeLessThan(0.01);
  });
});

describe("eagMmol (A1C → mmol/L, 1.59×A1C − 2.59)", () => {
  it("eagMmol(7.0) ≈ 8.54 within 0.01", () => {
    expect(Math.abs(eagMmol(7.0) - 8.54)).toBeLessThan(0.01);
  });
});

describe("a1cRange (mg/dL → A1C interval)", () => {
  it("a1cRange(126) endpoints ≈ [5.5, 6.6] within 0.01", () => {
    const range = a1cRange(126);
    expect(Math.abs(range.low - 5.5)).toBeLessThan(0.01);
    expect(Math.abs(range.high - 6.6)).toBeLessThan(0.01);
  });

  it("a1cRange(126) is a genuine interval (not a single point) containing 6.0", () => {
    const range = a1cRange(126);
    expect(range.high - range.low).toBeGreaterThan(0.01);
    expect(range.low).toBeLessThan(6.0);
    expect(range.high).toBeGreaterThan(6.0);
  });

  it("a1cRange(126) is within the ADAG range (outOfRange false)", () => {
    expect(a1cRange(126).outOfRange).toBe(false);
  });

  it("flags inputs outside the ADAG A1C 4~10% glucose range (≈68~240 mg/dL)", () => {
    expect(a1cRange(50).outOfRange).toBe(true);
    expect(a1cRange(300).outOfRange).toBe(true);
  });
});

describe("gmi (3.31 + 0.02392 × mg/dL)", () => {
  it("gmi(150) ≈ 6.898 within 0.001 (unrounded; display layer shows 6.9%)", () => {
    expect(Math.abs(gmi(150) - 6.898)).toBeLessThan(0.001);
  });
});
