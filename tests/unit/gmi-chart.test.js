// GMI content spec GC-01 (D1 / D2 / D5): the exact inverse of the GMI
// definition, the 30-row GMI chart built from it at module load, and the FAQ
// additions whose worked example must agree with the chart. Raw floats are
// compared with tolerances (main Spec §8 T1); display strings with string
// equality (they ARE the display contract).

import { describe, expect, it } from "vitest";
import { gmi, meanGlucoseFromGmi, mgdlToMmol } from "../../src/lib/formulas.js";
import { formatGmi, formatMgdl, formatMmol } from "../../src/lib/display.js";
import { GMI_CHART } from "../../src/data/gmiChart.js";
import { GMI_FAQS } from "../../src/data/gmiFaq.js";

// Spec D2, as integer tenths: 5.5–8.0 every 0.1, then 8.5 / 9.0 / 9.5 / 10.0.
const EXPECTED_TENTHS = [
  55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74,
  75, 76, 77, 78, 79, 80, 85, 90, 95, 100,
];

const ORIGINAL_QUESTIONS = [
  "Why is my GMI different from my lab A1C?",
  "How many days of CGM data do I need for a reliable GMI?",
  "Can GMI replace a lab A1C test?",
  "Which number from my CGM app should I enter?",
];

const NEW_QUESTIONS = [
  "What does GMI mean?",
  "Can I convert my GMI to an A1C?",
  "What average glucose does my GMI correspond to?",
  'Is there a "good" GMI number?',
];

function answerTo(question) {
  return GMI_FAQS.find((faq) => faq.question === question).answer;
}

describe("meanGlucoseFromGmi ((GMI − 3.31) / 0.02392, exact inverse of gmi)", () => {
  // Exact rational values of (GMI − 3.31) / 0.02392, to 12 decimals.
  const GOLDEN = [
    [5.5, 91.555183946488],
    [6.5, 133.361204013378],
    [7.0, 154.264214046823],
    [8.0, 196.070234113712],
    [10.0, 279.682274247492],
  ];

  for (const [gmiPercent, mgdl] of GOLDEN) {
    it(`GMI ${gmiPercent.toFixed(1)}% → ${mgdl} mg/dL within 1e-9 (unrounded)`, () => {
      expect(Math.abs(meanGlucoseFromGmi(gmiPercent) - mgdl)).toBeLessThan(1e-9);
    });
  }

  it("round-trips through gmi() for all 30 chart GMI values within 1e-9", () => {
    for (const tenths of EXPECTED_TENTHS) {
      const gmiPercent = tenths / 10;
      expect(
        Math.abs(gmi(meanGlucoseFromGmi(gmiPercent)) - gmiPercent),
        `GMI ${gmiPercent}`,
      ).toBeLessThan(1e-9);
    }
  });
});

describe("GMI_CHART (30 rows computed at module load)", () => {
  it("holds exactly the 30 spec GMI values, in order", () => {
    expect(GMI_CHART).toHaveLength(30);
    GMI_CHART.forEach((row, i) => {
      expect(Math.abs(row.gmi - EXPECTED_TENTHS[i] / 10), `row ${i}`).toBeLessThan(1e-12);
    });
    expect(GMI_CHART.map((row) => row.gmiDisplay)).toEqual(
      EXPECTED_TENTHS.map((tenths) => `${Math.floor(tenths / 10)}.${tenths % 10}%`),
    );
  });

  it("derives every value from formulas.js and every string from display.js", () => {
    for (const row of GMI_CHART) {
      const label = row.gmiDisplay;
      expect(Math.abs(row.mgdl - meanGlucoseFromGmi(row.gmi)), label).toBeLessThan(1e-9);
      expect(Math.abs(row.mmol - mgdlToMmol(row.mgdl)), label).toBeLessThan(1e-9);
      expect(row.gmiDisplay, label).toBe(`${formatGmi(row.gmi)}%`);
      expect(row.mgdlDisplay, label).toBe(formatMgdl(row.mgdl));
      expect(row.mmolDisplay, label).toBe(formatMmol(row.mmol));
    }
  });

  it("matches the 7 golden display rows", () => {
    const GOLDEN_ROWS = [
      ["5.5%", "92", "5.1"],
      ["6.0%", "112", "6.2"],
      ["6.5%", "133", "7.4"],
      ["7.0%", "154", "8.6"],
      ["7.5%", "175", "9.7"],
      ["8.0%", "196", "10.9"],
      ["10.0%", "280", "15.5"],
    ];
    const byGmi = new Map(GMI_CHART.map((row) => [row.gmiDisplay, row]));
    for (const [gmiDisplay, mgdl, mmol] of GOLDEN_ROWS) {
      const row = byGmi.get(gmiDisplay);
      expect(row, gmiDisplay).toBeTruthy();
      expect(row.mgdlDisplay, gmiDisplay).toBe(mgdl);
      expect(row.mmolDisplay, gmiDisplay).toBe(mmol);
    }
  });

  it("is a pure conversion: strictly increasing, with no band or label field", () => {
    for (let i = 1; i < GMI_CHART.length; i += 1) {
      expect(GMI_CHART[i].mgdl).toBeGreaterThan(GMI_CHART[i - 1].mgdl);
    }
    for (const row of GMI_CHART) {
      expect(Object.keys(row).sort()).toEqual(
        ["gmi", "gmiDisplay", "mgdl", "mgdlDisplay", "mmol", "mmolDisplay"],
      );
    }
  });
});

describe("GMI FAQ additions (GC-01 D5)", () => {
  it("appends the four intent questions after the original four, in order", () => {
    expect(GMI_FAQS.map((faq) => faq.question)).toEqual([
      ...ORIGINAL_QUESTIONS,
      ...NEW_QUESTIONS,
    ]);
  });

  it("the average-glucose answer's worked example equals the chart's 6.5% row", () => {
    const row = GMI_CHART.find((chartRow) => chartRow.gmiDisplay === "6.5%");
    const answer = answerTo("What average glucose does my GMI correspond to?");
    expect(answer).toContain("mean glucose (mg/dL) = (GMI − 3.31) ÷ 0.02392");
    expect(answer).toContain(
      `a GMI of ${row.gmiDisplay} corresponds to a CGM average of about ${row.mgdlDisplay} mg/dL (${row.mmolDisplay} mmol/L)`,
    );
    expect(answer).toContain("about 133 mg/dL (7.4 mmol/L)");
  });

  it("keeps every new answer plain text (no markup, no links)", () => {
    for (const question of NEW_QUESTIONS) {
      expect(answerTo(question), question).not.toMatch(/[<>]|href|https?:|www\./i);
    }
  });

  it('gives no number at all in the "good GMI" answer (no target value)', () => {
    expect(answerTo('Is there a "good" GMI number?')).not.toMatch(/\d/);
  });
});
