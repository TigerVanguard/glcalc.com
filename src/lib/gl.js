import { gl, glBand, giBand } from "./formulas.js";

const OZ_TO_GRAMS = 28.349523125;

export function normalizeServingToGrams(serving, unit = "g") {
  const amount = Number(serving);

  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return unit === "oz" ? amount * OZ_TO_GRAMS : amount;
}

export function calculateCarbs({ carbsPer100g, serving, unit = "g" }) {
  const grams = normalizeServingToGrams(serving, unit);
  const carbs = (Number(carbsPer100g) * grams) / 100;

  return Math.round(carbs * 10) / 10;
}

export function calculateGl({ gi, carbsPer100g, serving, unit = "g" }) {
  const carbs = calculateCarbs({ carbsPer100g, serving, unit });

  // Formula lives in formulas.js (single source of truth); display rounding
  // to 2 decimals is this module's existing behavior and is preserved.
  return Math.round(gl(gi, carbs) * 100) / 100;
}

export function getGiLabel(gi) {
  return giBand(gi);
}

export function getGlLabel(glValue) {
  return glBand(glValue);
}
