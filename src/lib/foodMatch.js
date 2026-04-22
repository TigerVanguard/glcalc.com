import { normalizeFood, tokenizeFood } from "./normalizeFood.js";

function toTitleCandidate(food) {
  if (!food) {
    return "";
  }

  return String(food.title ?? food.product_name ?? food.name ?? "");
}

function getNumericFoodValues(food) {
  return {
    gi: Number(food.gi),
    carbsPer100g: Number(food.carbsPer100g ?? food.carbs_per_100g),
  };
}

function getScoreDetails(query, food) {
  const queryTitle = normalizeFood(query);
  const candidateTitle = normalizeFood(toTitleCandidate(food));

  if (!queryTitle || !candidateTitle) {
    return { score: 0, matchType: "none" };
  }

  if (queryTitle === candidateTitle) {
    return { score: 100, matchType: "exact" };
  }

  const queryTokens = tokenizeFood(query);
  const candidateTokens = tokenizeFood(toTitleCandidate(food));

  let score = 0;
  let matchType = "none";

  if (candidateTitle.includes(queryTitle) || queryTitle.includes(candidateTitle)) {
    score = 90;
    matchType = "close";
  }

  const overlap = queryTokens.filter((token) => candidateTokens.includes(token)).length;
  if (overlap > 0) {
    const coverage = overlap / Math.max(queryTokens.length, candidateTokens.length);
    const tokenScore = Math.round(40 + coverage * 50);

    if (tokenScore > score) {
      score = tokenScore;
      matchType = coverage === 1 ? "close" : "partial";
    }
  }

  return { score, matchType };
}

export function scoreFoodCandidate(query, food) {
  return getScoreDetails(query, food);
}

export function matchFoodCandidates(query, foods, options = {}) {
  const limit = options.limit ?? 5;
  const minScore = options.minScore ?? 35;

  return foods
    .map((food) => {
      const { score, matchType } = getScoreDetails(query, food);

      return {
        ...getNumericFoodValues(food),
        title: toTitleCandidate(food),
        score,
        matchType,
      };
    })
    .filter((food) => food.score >= minScore)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.title.localeCompare(b.title);
    })
    .slice(0, limit);
}

export function buildFoodCatalog(glycemicIndexData) {
  return Object.entries(glycemicIndexData).map(([title, details]) => ({
    title,
    gi: details.gi,
    carbsPer100g: details.carbs_per_100g,
  }));
}
