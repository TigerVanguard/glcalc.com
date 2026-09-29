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
//   touches treatment repeats that GMI is not a lab A1C and not diagnostic;
// - the four search-intent questions (GMI content spec D5) follow the
//   original four: plain text only (no links — the JSON-LD must equal the
//   visible text), never a target GMI value, and the worked example is
//   computed at module load from the chart row (formulas + display), never
//   hand-typed.
import { gmiChartRow } from "./gmiChart.js";

const EXAMPLE = gmiChartRow(6.5);

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
  {
    question: "What does GMI mean?",
    answer:
      "GMI stands for Glucose Management Indicator. It is calculated from continuous glucose monitor (CGM) data rather than measured by a blood test, and it uses the same percentage scale as A1C to estimate the laboratory A1C that corresponds to your sensor's average glucose. Many CGM apps and reports show it right next to your average glucose.",
  },
  {
    question: "Can I convert my GMI to an A1C?",
    answer:
      `There is nothing to convert: GMI is already on the A1C scale. A GMI of ${EXAMPLE.gmiDisplay} is the formula's estimate of a laboratory A1C of about ${EXAMPLE.gmiDisplay}. What the formula cannot tell you is your actual lab result — a same-period laboratory A1C commonly differs from GMI by around half a percentage point in either direction, and only an A1C blood test measures A1C itself.`,
  },
  {
    question: "What average glucose does my GMI correspond to?",
    answer:
      `GMI is defined by a straight-line formula, so it can be solved exactly for the CGM average that produces it: mean glucose (mg/dL) = (GMI − 3.31) ÷ 0.02392, and dividing the result by 18.018 gives mmol/L. For example, a GMI of ${EXAMPLE.gmiDisplay} corresponds to a CGM average of about ${EXAMPLE.mgdlDisplay} mg/dL (${EXAMPLE.mmolDisplay} mmol/L). The GMI chart on this page applies the same calculation row by row, so you can look up your GMI without doing the math. This only works backwards from GMI — it does not turn a laboratory A1C into an average glucose; for that, use the A1C to eAG calculator.`,
  },
  {
    question: 'Is there a "good" GMI number?',
    answer:
      "Not one that applies to everyone. Glucose targets are set individually and depend on factors such as age, pregnancy, how often someone experiences low glucose, and other health conditions, so this site does not label any GMI value as good or bad — the chart on this page only converts numbers. Clinicians usually read GMI together with time in range and the frequency of lows rather than on its own, and your care team can tell you what your own numbers mean.",
  },
];
