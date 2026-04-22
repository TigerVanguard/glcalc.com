import { describe, it, expect } from "vitest";
import {
  calculateCarbs,
  calculateGl,
  getGiLabel,
  getGlLabel,
  normalizeServingToGrams,
} from "../../src/lib/gl.js";

describe("gl calculations", () => {
  it("normalizes ounces to grams", () => {
    expect(normalizeServingToGrams(2, "oz")).toBeCloseTo(56.69904625, 10);
  });

  it("calculates carbohydrates from a gram serving", () => {
    expect(calculateCarbs({ carbsPer100g: 20, serving: 50, unit: "g" })).toBe(10);
  });

  it("calculates carbohydrates from an ounce serving on the same basis as GL", () => {
    expect(calculateCarbs({ carbsPer100g: 11, serving: 2, unit: "oz" })).toBe(6.2);
  });

  it("labels GI thresholds", () => {
    expect(getGiLabel(55)).toBe("Low");
    expect(getGiLabel(69)).toBe("Medium");
    expect(getGiLabel(70)).toBe("High");
  });

  it("labels GL thresholds", () => {
    expect(getGlLabel(10)).toBe("Low");
    expect(getGlLabel(19)).toBe("Medium");
    expect(getGlLabel(20)).toBe("High");
  });

  it("calculates glycemic load from GI, carbs, and serving", () => {
    expect(calculateGl({ gi: 50, carbsPer100g: 20, serving: 50, unit: "g" })).toBe(5);
  });
});
