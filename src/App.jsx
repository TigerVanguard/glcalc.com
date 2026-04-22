import { useState } from "react";
import FoodSearch from "./features/search/FoodSearch.jsx";
import BarcodeLookup from "./features/barcode/BarcodeLookup.jsx";
import PhotoLookup from "./features/photo/PhotoLookup.jsx";
import CalculatorResult from "./features/calculator/CalculatorResult.jsx";
import DisclosureNotice from "./features/common/DisclosureNotice.jsx";
import { normalizeServingToGrams } from "./lib/gl.js";

const DEFAULT_SERVING = 100;
const DEFAULT_UNIT = "g";

export default function App() {
  const [selectedFood, setSelectedFood] = useState(null);
  const [serving, setServing] = useState(DEFAULT_SERVING);
  const [unit, setUnit] = useState(DEFAULT_UNIT);

  const grams = normalizeServingToGrams(serving, unit);

  return (
    <main className="app-shell">
      <header className="hero panel hero--app" aria-labelledby="app-title">
        <div className="hero__topline">
          <p className="eyebrow">Nutrition-life utility</p>
          <span className="hero__badge">Installable PWA</span>
        </div>
        <h1 id="app-title">Glycemic Load Guide</h1>
        <p className="hero__copy">
          A calm mobile guide for checking glycemic load with food search,
          barcode lookup, or photo identification, then comparing the result on
          one serving basis.
        </p>
        <ul className="hero__chips" aria-label="Available app flows">
          <li>Search foods</li>
          <li>Scan barcodes</li>
          <li>Identify photos</li>
        </ul>
      </header>

      <div className="layout">
        <div className="stack">
          <FoodSearch
            onSelect={setSelectedFood}
          />
          <BarcodeLookup onConfirmCandidate={setSelectedFood} />
          <PhotoLookup onConfirmCandidate={setSelectedFood} />

          <section className="panel panel--controls" aria-labelledby="controls-heading">
            <div className="section-heading">
              <p className="eyebrow">Step 2</p>
              <h2 id="controls-heading">Set the serving size</h2>
            </div>

            <div className="controls">
              <div className="field">
                <label className="field-label" htmlFor="serving-size">
                  Serving size
                </label>
                <input
                  id="serving-size"
                  className="search-input"
                  type="number"
                  min="0"
                  step="0.1"
                  value={serving}
                  onChange={(event) => setServing(Number(event.target.value))}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="unit">
                  Unit
                </label>
                <select
                  id="unit"
                  className="search-input"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                >
                  <option value="g">g</option>
                  <option value="oz">oz</option>
                </select>
              </div>
            </div>

            <p className="muted">
              Serving basis: {serving} {unit} = {Math.round(grams * 10) / 10} g
            </p>
          </section>
        </div>

        <div className="stack">
          <CalculatorResult food={selectedFood} serving={serving} unit={unit} />
          <DisclosureNotice />
        </div>
      </div>
    </main>
  );
}
