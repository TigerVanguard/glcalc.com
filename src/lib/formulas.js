// Centralized medical formula library (Spec §5A.1-1, golden values in §8 T1).
// Every function returns the raw, unrounded value; rounding happens only in the
// display layer. The single exception is a1cRange, whose endpoint rounding to
// 0.1% is part of the spec itself.

const MGDL_PER_MMOL = 18.018;

// ADAG study validity range: A1C 4%~10% mapped to eAG (≈68.1~240.3 mg/dL).
const ADAG_MIN_A1C = 4;
const ADAG_MAX_A1C = 10;

/**
 * Glycemic load: GI × carbs (grams) ÷ 100. Unrounded.
 */
export function gl(gi, carbsGrams) {
  return (Number(gi) * Number(carbsGrams)) / 100;
}

/**
 * GL band, continuous intervals with no gaps:
 * ≤10 Low, 10 < x < 20 Medium, ≥20 High.
 */
export function glBand(glValue) {
  if (glValue <= 10) {
    return "Low";
  }

  if (glValue < 20) {
    return "Medium";
  }

  return "High";
}

/**
 * GI band, continuous intervals with no gaps:
 * ≤55 Low, 55 < x < 70 Medium, ≥70 High.
 */
export function giBand(giValue) {
  if (giValue <= 55) {
    return "Low";
  }

  if (giValue < 70) {
    return "Medium";
  }

  return "High";
}

/**
 * mg/dL → mmol/L (divide by 18.018). Unrounded.
 */
export function mgdlToMmol(mgdl) {
  return Number(mgdl) / MGDL_PER_MMOL;
}

/**
 * mmol/L → mg/dL (multiply by 18.018). Unrounded.
 */
export function mmolToMgdl(mmol) {
  return Number(mmol) * MGDL_PER_MMOL;
}

/**
 * A1C (%) → estimated average glucose in mg/dL (ADAG): 28.7 × A1C − 46.7.
 * Unrounded (eag(6.5) must be 139.85, not 139.9).
 */
export function eag(a1c) {
  return 28.7 * Number(a1c) - 46.7;
}

/**
 * A1C (%) → estimated average glucose in mmol/L: 1.59 × A1C − 2.59. Unrounded.
 */
export function eagMmol(a1c) {
  return 1.59 * Number(a1c) - 2.59;
}

/**
 * Average glucose (mg/dL) → estimated A1C interval (never a single point).
 * Center = (eAG + 46.7) / 28.7, half-width = 15.7 / 28.7 (both kept unrounded
 * internally); each endpoint is then rounded to 0.1% per spec.
 * outOfRange is true when the input falls outside the glucose range implied by
 * ADAG A1C 4%~10% (≈68.1~240.3 mg/dL).
 */
export function a1cRange(mgdl) {
  const glucose = Number(mgdl);
  const center = (glucose + 46.7) / 28.7;
  const halfWidth = 15.7 / 28.7;

  const roundToTenth = (x) => Math.round(x * 10) / 10;

  return {
    low: roundToTenth(center - halfWidth),
    high: roundToTenth(center + halfWidth),
    outOfRange: glucose < eag(ADAG_MIN_A1C) || glucose > eag(ADAG_MAX_A1C),
  };
}

/**
 * Glucose Management Indicator: 3.31 + 0.02392 × mean glucose (mg/dL). Unrounded.
 */
export function gmi(mgdl) {
  return 3.31 + 0.02392 * Number(mgdl);
}
