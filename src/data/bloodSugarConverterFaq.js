// Blood sugar converter FAQ content — single source of truth (ticket 07,
// Spec §5B.2-3, same pattern as src/data/glFaq.js).
//
// Rendered as the visible FAQ on /blood-sugar-converter AND serialized into
// that page's FAQPage JSON-LD (src/seo/pageSeo.js). Keeping both consumers on
// this one array is what guarantees the "schema text verbatim equals visible
// text" rich-result requirement. Never fork this data.
//
// Reference values here are educational orientation only (Spec red line D4:
// never grade the user's own input) and must stay consistent with formulas.js
// (70 → 3.9, 100 → 5.6, 140 → 7.8 via the 18.018 factor).
export const BLOOD_SUGAR_CONVERTER_FAQS = [
  {
    question: "Why are there two different blood sugar units?",
    answer:
      "Laboratories standardized differently by region. The United States and a few other countries report glucose by weight per volume (mg/dL), while most of Europe, the UK, Canada, Australia, and China report it as a molar concentration (mmol/L). Both units describe exactly the same glucose level in your blood.",
  },
  {
    question: "How do I convert blood sugar from mg/dL to mmol/L?",
    answer:
      "Divide the mg/dL value by 18.018 to get mmol/L, and multiply a mmol/L value by 18.018 to go back to mg/dL. The factor comes from the molar mass of glucose (about 180.18 g/mol): 1 mmol of glucose per liter weighs about 18.018 mg per deciliter.",
  },
  {
    question: "What is a normal blood sugar level in mg/dL and mmol/L?",
    answer:
      "Commonly cited reference points for adults without diabetes are a fasting glucose of roughly 70 to 100 mg/dL (3.9 to 5.6 mmol/L) and below 140 mg/dL (7.8 mmol/L) about two hours after a meal. These numbers are shown for orientation only: this page does not interpret your reading, and only a clinician can evaluate your individual values.",
  },
];
