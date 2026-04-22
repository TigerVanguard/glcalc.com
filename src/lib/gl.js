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
  const gl = (Number(gi) * carbs) / 100;

  return Math.round(gl * 100) / 100;
}

export function getGiLabel(gi) {
  if (gi <= 55) {
    return "Low";
  }

  if (gi < 70) {
    return "Medium";
  }

  return "High";
}

export function getGlLabel(gl) {
  if (gl <= 10) {
    return "Low";
  }

  if (gl < 20) {
    return "Medium";
  }

  return "High";
}
