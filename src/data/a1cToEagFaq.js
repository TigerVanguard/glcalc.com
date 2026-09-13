// A1C→eAG FAQ content — single source of truth (ticket 08, Spec §5B.2-3,
// same pattern as src/data/bloodSugarConverterFaq.js).
//
// Rendered as the visible FAQ on /a1c-to-eag-calculator AND serialized into
// that page's FAQPage JSON-LD (src/seo/pageSeo.js). Keeping both consumers on
// this one array is what guarantees the "schema text verbatim equals visible
// text" rich-result requirement. Never fork this data.
//
// The second entry deliberately explains red line D4 (Spec §1): the words
// normal / prediabetes / diabetes may appear HERE as educational prose, but
// the calculator itself never attaches them to the user's input.
export const A1C_TO_EAG_FAQS = [
  {
    question: "What does eAG actually represent?",
    answer:
      "Estimated average glucose (eAG) translates an A1C percentage into the mg/dL or mmol/L units that meters and CGMs report, using the regression from the ADAG study (Nathan et al., Diabetes Care 2008). It is a statistical estimate of your average glucose over roughly the past three months — not a replacement for the averages your own meter or CGM computes, which can differ because A1C weights recent weeks more heavily and red blood cell lifespan varies between people.",
  },
  {
    question: "Why doesn't this page tell me whether my A1C is normal, prediabetes, or diabetes?",
    answer:
      "Attaching one of those labels to your number would be a diagnostic judgment, and the American Diabetes Association requires diagnosis to be based on laboratory testing with an NGSP-certified method, interpreted by a clinician — not on a value typed into a web calculator. The ADA reference table on this page is educational background only: the calculator never compares your input against it and never highlights which row your value would fall in.",
  },
  {
    question: "How accurate is the eAG estimate?",
    answer:
      "The ADAG study derived the formula from about 2,700 glucose measurements per participant across 507 people, and the scatter around the regression line is meaningful: the reported standard deviation is roughly 15.7 mg/dL. The relationship is most reliable for A1C values between 4% and 10%, and it does not hold well during pregnancy, with hemoglobin variants, or with anemia and other conditions that change red blood cell turnover.",
  },
];
