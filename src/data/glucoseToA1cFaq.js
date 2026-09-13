// Glucose→A1C estimator FAQ content — single source of truth (ticket 09,
// Spec §5B.2-3, same pattern as src/data/a1cToEagFaq.js).
//
// Rendered as the visible FAQ on /glucose-to-a1c-estimator AND serialized into
// that page's FAQPage JSON-LD (src/seo/pageSeo.js). Keeping both consumers on
// this one array guarantees the "schema text verbatim equals visible text"
// rich-result requirement. Never fork this data.
//
// Copy discipline (red lines, Spec §1 D4 / §9):
// - the first entry is the mandated "why a range, not one number" explanation;
// - the phrase "ADAG formula" must NEVER appear here — on this page that name
//   is reserved for prose pointing at the forward-direction page
//   (/a1c-to-eag-calculator), and verify-dist scans for stray uses;
// - no normal/prediabetes/diabetes wording anywhere in this page's copy: this
//   page carries no educational band table at all, so the words never appear.
export const GLUCOSE_TO_A1C_FAQS = [
  {
    question: "Why does this estimator show a range instead of one A1C number?",
    answer:
      "Because the underlying data cannot support a single number in this direction. The ADAG regression that links A1C and average glucose has real scatter around it — the reported standard deviation is about 15.7 mg/dL — and when you divide that scatter by the slope of 28.7, it propagates into roughly ±0.5 percentage points of A1C. Printing one value would fake a precision the study never measured, so this page computes the center, applies the half-width of 15.7 ÷ 28.7 without pre-rounding, and only then rounds each endpoint to 0.1%.",
  },
  {
    question: "How is this different from the A1C to eAG calculator?",
    answer:
      "The two pages run in opposite directions. The A1C to eAG calculator applies the regression exactly as the ADAG study published it: A1C in, estimated average glucose out. This page rearranges that equation algebraically to run backwards, from average glucose to A1C — a direction the study never validated as its own equation. Regression lines are not symmetric, so the backwards estimate inherits extra uncertainty, which grows near clinically important cut-offs. That is also why this page reports a range while the forward page can report a value.",
  },
  {
    question: "My lab A1C is different from this estimate. Which one should I trust?",
    answer:
      "The laboratory result. This estimator starts from a meter or CGM average, which covers a different time window than A1C, weights every reading equally where A1C weights recent weeks more heavily, and misses readings you never took. On top of that, red blood cell lifespan differs between people, and pregnancy, hemoglobin variants, anemia, and kidney disease can all move A1C independently of average glucose. Treat the range here as orientation for understanding your numbers, and treat the NGSP-certified laboratory value as the real measurement.",
  },
];
