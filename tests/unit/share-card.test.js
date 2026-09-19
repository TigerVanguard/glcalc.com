// buildCardLines contract tests (shareable-assets BL-01, Spec D5/D6).
// Text assembly is a pure function; the golden here locks the exact line
// sequence — including the fixed micro-footer (disclaimer + domain) — that
// drawCard renders and future page tickets (BL-02/03/06) rely on.
// Canvas drawing itself is intentionally untested (Spec BL-01 test plan).

import { describe, expect, it } from "vitest";
import { buildCardLines } from "../../src/lib/shareCard.js";
import { SITE_ORIGIN } from "../../src/site.config.js";

// Derived the same way the library must derive it (never hardcoded), so the
// golden stays correct under a VITE_SITE_ORIGIN override.
const DOMAIN_LINE = new URL(SITE_ORIGIN).host;
const DISCLAIMER_LINE = "Estimate for education — not medical advice.";

describe("buildCardLines (golden line sequences)", () => {
  it("assembles title, label: value rows, footnote, then the fixed tail", () => {
    expect(
      buildCardLines({
        title: "GMI Result",
        rows: [
          { label: "Average glucose", value: "154 mg/dL" },
          { label: "GMI", value: "6.9%" },
        ],
        footnote: "GMI formula: Bergenstal et al., 2018",
      }),
    ).toEqual([
      "GMI Result",
      "Average glucose: 154 mg/dL",
      "GMI: 6.9%",
      "GMI formula: Bergenstal et al., 2018",
      DISCLAIMER_LINE,
      DOMAIN_LINE,
    ]);
  });

  it("always ends with the disclaimer micro-line followed by the site domain", () => {
    const lines = buildCardLines({
      title: "Blood Sugar Conversion",
      rows: [{ label: "mg/dL", value: "126" }],
    });
    expect(lines[lines.length - 2]).toBe(DISCLAIMER_LINE);
    expect(lines[lines.length - 1]).toBe(DOMAIN_LINE);
  });
});

describe("buildCardLines (value passthrough — D5)", () => {
  it("passes range strings through verbatim, never rewriting them", () => {
    const range = "6.2%–6.8%";
    const lines = buildCardLines({
      title: "Estimated A1C Range",
      rows: [{ label: "A1C range", value: range }],
    });
    expect(lines[1]).toBe(`A1C range: ${range}`);
  });

  it("keeps the page's exact display formatting (≈, spaces, units)", () => {
    const lines = buildCardLines({
      title: "Estimated A1C Range",
      rows: [
        { label: "Average glucose", value: "7.0 mmol/L" },
        { label: "A1C range", value: "≈ 5.5% – 6.6%" },
      ],
    });
    expect(lines).toEqual([
      "Estimated A1C Range",
      "Average glucose: 7.0 mmol/L",
      "A1C range: ≈ 5.5% – 6.6%",
      DISCLAIMER_LINE,
      DOMAIN_LINE,
    ]);
  });
});

describe("buildCardLines (edge shapes)", () => {
  it("handles empty rows: title straight into the fixed tail", () => {
    expect(buildCardLines({ title: "GMI Result", rows: [] })).toEqual([
      "GMI Result",
      DISCLAIMER_LINE,
      DOMAIN_LINE,
    ]);
  });

  it("omits the footnote line when footnote is absent", () => {
    const lines = buildCardLines({
      title: "A1C to eAG",
      rows: [{ label: "A1C", value: "7.0%" }],
    });
    expect(lines).toEqual(["A1C to eAG", "A1C: 7.0%", DISCLAIMER_LINE, DOMAIN_LINE]);
  });
});
