import { describe, expect, it } from "vitest";
import { matchFoodCandidates } from "../../src/lib/foodMatch.js";
import { normalizeFood } from "../../src/lib/normalizeFood.js";

describe("normalizeFood", () => {
  it("strips punctuation, accents, and extra whitespace", () => {
    expect(normalizeFood(" Crème fraîche, low-fat! ")).toBe("creme fraiche low fat");
  });
});

describe("matchFoodCandidates", () => {
  const foods = [
    { title: "Blueberries", gi: 45, carbsPer100g: 11 },
    { title: "Dried Blueberries", gi: 70, carbsPer100g: 84 },
    { title: "Brown rice", gi: 55, carbsPer100g: 32.1 },
  ];

  it("returns the exact normalized match first", () => {
    const results = matchFoodCandidates("blueberries", foods);

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      title: "Blueberries",
      gi: 45,
      carbsPer100g: 11,
    });
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it("ranks a partial token match above unrelated foods", () => {
    const results = matchFoodCandidates("brown", foods);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      title: "Brown rice",
      gi: 55,
      carbsPer100g: 32.1,
    });
  });

  it("returns no candidates when the query is too far away", () => {
    expect(matchFoodCandidates("spark plug", foods)).toEqual([]);
  });
});
