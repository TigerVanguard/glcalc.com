// GL page FAQ content — single source of truth (ticket 04, Spec §5B.2-3).
//
// Rendered as the visible FAQ on /glycemic-load-calculator (App.jsx SeoGuide)
// AND serialized into that page's FAQPage JSON-LD (src/seo/pageSeo.js). Keeping
// both consumers on this one array is what guarantees the "schema text verbatim
// equals visible text" rich-result requirement. Never fork this data.
export const GL_FAQS = [
  {
    question: "What is glycemic load?",
    answer:
      "Glycemic load estimates how much a serving of food may raise blood glucose by combining the food's glycemic index with the available carbohydrates in that serving.",
  },
  {
    question: "How is glycemic load calculated?",
    answer:
      "This calculator uses GL = GI x available carbohydrate grams in the serving / 100. It first converts the serving to grams, estimates carbohydrates for that serving, then applies the GI value.",
  },
  {
    question: "Is glycemic load the same as glycemic index?",
    answer:
      "No. Glycemic index describes carbohydrate quality for a food. Glycemic load adds the serving size, which makes it more useful when comparing what you actually plan to eat.",
  },
  {
    question: "Can this replace medical advice?",
    answer:
      "No. GL is an estimate for education and meal planning. If you manage diabetes, pregnancy nutrition, or another medical condition, use professional guidance for personal decisions.",
  },
];
