import {
  calculateCarbs,
  calculateGl,
  getGiLabel,
  getGlLabel,
  normalizeServingToGrams,
} from "../../lib/gl.js";

function formatServing(unit, serving) {
  if (unit === "oz") {
    return `${serving} oz`;
  }

  return `${serving} g`;
}

function formatGrams(value) {
  return `${Math.round(value * 10) / 10} g`;
}

const EMPTY_STEPS = [
  {
    title: "Find a food",
    body: "Choose a result from search, barcode lookup, or photo identification.",
  },
  {
    title: "Set serving",
    body: "Adjust grams or ounces so the estimate matches the portion you expect to eat.",
  },
  {
    title: "Review GL",
    body: "This panel will surface glycemic load first, with GI and carbohydrate context underneath.",
  },
];

export default function CalculatorResult({ food, serving, unit }) {
  if (!food) {
    return (
      <section
        className="panel panel--results panel--results-empty"
        aria-labelledby="results-heading"
      >
        <div className="section-heading">
          <p className="eyebrow">Review GL</p>
          <h2 id="results-heading">Your result will land here</h2>
        </div>
        <p className="results-lead">
          Pick a food first, then adjust the serving. This workspace keeps the
          outcome focused on the exact portion you want to compare.
        </p>

        <ol className="results-empty-steps">
          {EMPTY_STEPS.map((step, index) => (
            <li key={step.title} className="results-empty-step">
              <span className="results-empty-step__index">0{index + 1}</span>
              <div>
                <p className="results-empty-step__title">{step.title}</p>
                <p className="results-empty-step__body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const carbsPer100g = food.carbs_per_100g ?? food.carbsPer100g;
  const carbs = calculateCarbs({
    carbsPer100g,
    serving,
    unit,
  });
  const gl = calculateGl({
    gi: food.gi,
    carbsPer100g,
    serving,
    unit,
  });
  const grams = normalizeServingToGrams(serving, unit);

  return (
    <section className="panel panel--results" aria-labelledby="results-heading">
      <div className="section-heading">
        <p className="eyebrow">Review GL</p>
        <h2 id="results-heading">{food.title}</h2>
      </div>

      <p className="results-lead">
        Estimated for {formatServing(unit, serving)} ({formatGrams(grams)}) of{" "}
        {food.title}.
      </p>

      <dl className="stats">
        <div className="stat stat--gl">
          <dt className="stat__label">Estimated glycemic load</dt>
          <dd className="stat__value stat__value--gl">
            <strong>{gl}</strong>
            <span className={`pill pill--${getGlLabel(gl).toLowerCase()}`}>
              {getGlLabel(gl)}
            </span>
          </dd>
          <p className="stat__note">
            This combines the food&apos;s GI with the carbohydrate grams in your
            chosen serving.
          </p>
        </div>

        <div className="stat">
          <dt className="stat__label">Glycemic index</dt>
          <dd className="stat__value">
            <strong>{food.gi}</strong>
            <span className={`pill pill--${getGiLabel(food.gi).toLowerCase()}`}>
              {getGiLabel(food.gi)}
            </span>
          </dd>
        </div>

        <div className="stat">
          <dt className="stat__label">Carbohydrates in this serving</dt>
          <dd className="stat__value">
            <strong>{formatGrams(carbs)}</strong>
            <span className="muted">for {formatServing(unit, serving)}</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
