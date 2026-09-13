// GI lookup page FAQ content — single source of truth (ticket 11, Spec
// §5B.2-3, same pattern as src/data/gmiFaq.js).
//
// Rendered as the visible FAQ on /glycemic-index-calculator AND serialized
// into that page's FAQPage JSON-LD (src/seo/pageSeo.js). Keeping both
// consumers on this one array guarantees the "schema text verbatim equals
// visible text" rich-result requirement. Never fork this data.
//
// Copy discipline (Spec §6 / §9):
// - the ticket-mandated N/A question comes first and explains the §6.1 rule
//   (carbs below 2.5 g per 100 g → GI not measurable → "GI: N/A", GL ≈ 0);
// - the GI-vs-GL answer is written independently of the GL page's FAQ (the
//   two pages must not share copy);
// - DiOGenes is described honestly as a category-assignment source, never as
//   an authoritative reference (red line 5).
export const GI_FAQS = [
  {
    question: "Why do some foods show GI: N/A instead of a number?",
    answer:
      "Because their glycemic index cannot actually be measured. The standard GI test feeds volunteers a portion of the food containing 50 grams of available carbohydrate and tracks their blood glucose. For foods with less than 2.5 grams of carbohydrate per 100 grams — egg whites, most meats and oils — that test portion would be absurdly large, so no real measurement exists. Any number attached to such a food in a GI database is a category placeholder, not a result, which is why this page shows GI: N/A for them instead of repeating a misleading value. Their glycemic load is effectively zero at any normal serving.",
  },
  {
    question: "How is the glycemic index different from the glycemic load?",
    answer:
      "The glycemic index grades carbohydrate quality: it compares fixed 50-gram carbohydrate portions, so it says nothing about how much of the food you actually eat. The glycemic load multiplies that quality grade by the carbohydrate in your real serving, which is why a high-GI food eaten in a small or watery portion can still produce a small overall glucose effect. Use this page to check a food's GI, and use the glycemic load calculator when you want the number that reflects your actual portion.",
  },
  {
    question: "Where do these GI values come from?",
    answer:
      "From an archived copy of the DiOGenes GI database, a European research project dataset. Many of its values are category-level assignments — one reference number shared by a whole group of similar foods — rather than individual laboratory measurements of each specific item. That makes them useful for orientation and comparison, but you should not read a difference of a few points between two foods as a precise, measured distinction.",
  },
  {
    question: "Is a low-GI food automatically a good choice?",
    answer:
      "No. GI describes only how quickly a food's carbohydrate raises blood glucose relative to pure glucose — it ignores portion size, calories, fat, protein, fiber quality, and everything else about the food. Some low-GI items are energy-dense desserts; some high-GI items, like watermelon, carry very little carbohydrate per serving. GI works best as one input alongside serving size (that is what glycemic load adds) and the rest of the food's nutrition, not as a standalone verdict.",
  },
];
