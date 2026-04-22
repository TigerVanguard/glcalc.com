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

export default function CalculatorResult({ food, serving, unit }) {
  if (!food) {
    return (
      <section className="panel panel--results">
        <div className="section-heading">
          <p className="eyebrow">Step 3</p>
          <h2>Pick a food to see the calculation</h2>
        </div>
        <p className="muted">
          Search for a food above, then choose the matching result to calculate
          glycemic index, carbohydrates, and glycemic load.
        </p>
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
        <p className="eyebrow">Step 3</p>
        <h2 id="results-heading">{food.title}</h2>
      </div>

      <dl className="stats">
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
          <dt className="stat__label">Carbohydrates</dt>
          <dd className="stat__value">
            <strong>{formatGrams(carbs)}</strong>
            <span className="muted">
              for {formatServing(unit, serving)} ({formatGrams(grams)})
            </span>
          </dd>
        </div>

        <div className="stat">
          <dt className="stat__label">Glycemic load</dt>
          <dd className="stat__value">
            <strong>{gl}</strong>
            <span className={`pill pill--${getGlLabel(gl).toLowerCase()}`}>
              {getGlLabel(gl)}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
