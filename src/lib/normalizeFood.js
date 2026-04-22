const DIACRITIC_MARKS = /[\u0300-\u036f]/g;
const NON_ALNUM = /[^a-z0-9]+/g;
const MULTI_SPACE = /\s+/g;
const MEASURE_TOKENS = new Set([
  "g",
  "gram",
  "grams",
  "kg",
  "lb",
  "lbs",
  "oz",
  "ml",
  "l",
  "liter",
  "litre",
  "pack",
  "packs",
  "packet",
  "packets",
  "serving",
  "servings",
  "item",
  "items",
  "count",
  "ct",
  "x",
]);

function simplifyToken(token) {
  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }

  return token;
}

export function normalizeFood(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .normalize("NFKD")
    .replace(DIACRITIC_MARKS, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(NON_ALNUM, " ")
    .replace(MULTI_SPACE, " ")
    .trim();
}

export function tokenizeFood(value) {
  return normalizeFood(value)
    .split(" ")
    .filter(Boolean)
    .map(simplifyToken)
    .filter((token) => !MEASURE_TOKENS.has(token));
}
