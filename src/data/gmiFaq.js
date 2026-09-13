// GMI calculator FAQ content — single source of truth (ticket 10, Spec
// §5B.2-3, same pattern as src/data/glucoseToA1cFaq.js).
//
// Rendered as the visible FAQ on /gmi-calculator AND serialized into that
// page's FAQPage JSON-LD (src/seo/pageSeo.js). Keeping both consumers on this
// one array guarantees the "schema text verbatim equals visible text"
// rich-result requirement. Never fork this data.
//
// Copy discipline (red lines, Spec §1 D4 / §5 gmi row / §9):
// - the ticket-mandated questions come first: why GMI and lab A1C disagree,
//   and how many days of CGM data a GMI needs;
// - "diabetes" may appear here only inside the journal name "Diabetes Care"
//   or as static education about who uses CGM — never as a verdict bound to
//   the user's input (the calculator panel itself is scanned by verify-dist);
// - the audience is CGM users making real decisions, so every answer that
//   touches treatment repeats that GMI is not a lab A1C and not diagnostic.
export const GMI_FAQS = [
  {
    question: "Why is my GMI different from my lab A1C?",
    answer:
      "Because they measure different things over different windows. GMI is arithmetic on your sensor's mean glucose from the last few weeks; a laboratory A1C measures how much glucose has attached to hemoglobin over the whole lifespan of your red blood cells, roughly three months. Red cell lifespan itself varies from person to person, and anemia, kidney disease, pregnancy, recent blood loss, and hemoglobin variants all shift A1C without changing your actual glucose. On top of that, CGM sensors carry some bias of their own and only see the days you wore them. Gaps of around half a percentage point in either direction are common and expected — a mismatch does not mean your sensor data or your lab result is wrong.",
  },
  {
    question: "How many days of CGM data do I need for a reliable GMI?",
    answer:
      "Use at least 14 days. The international consensus on CGM metrics recommends a 14-day window with the sensor active about 70% of the time or more, because two weeks of reasonably complete data correlate well with a full three months of glucose exposure. A GMI computed from just a few days — or from a stretch with long sensor gaps, illness, travel, or a medication change — describes that unusual stretch, not your usual glucose. Most CGM apps show the mean glucose for a selectable date range; pick 14, 30, or 90 days and enter that mean here.",
  },
  {
    question: "Can GMI replace a lab A1C test?",
    answer:
      "No. GMI is an estimate of where a laboratory A1C might land if your recent sensor average continued — it is not a measurement of anything in your blood. Diagnosis and formal monitoring rely on an NGSP-certified laboratory A1C, and treatment changes should be decided with your care team using the full CGM picture (time in range, variability, lows), not a single derived number. GMI is best used the way sensor reports use it: as context for understanding your data between lab visits.",
  },
  {
    question: "Which number from my CGM app should I enter?",
    answer:
      "Enter the average (mean) glucose, not the median and not the GMI the app already shows. Apps like Dexcom Clarity, LibreView, and CareLink display mean glucose on their summary or AGP report pages — that is the input this formula expects, in mg/dL or mmol/L. If your app already reports a GMI for the same date range, this calculator should reproduce it almost exactly; a small difference usually means the two are looking at different date ranges.",
  },
];
