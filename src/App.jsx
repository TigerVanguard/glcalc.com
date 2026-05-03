import { useState } from "react";
import FoodSearch from "./features/search/FoodSearch.jsx";
import BarcodeLookup from "./features/barcode/BarcodeLookup.jsx";
import PhotoLookup from "./features/photo/PhotoLookup.jsx";
import CalculatorResult from "./features/calculator/CalculatorResult.jsx";
import DisclosureNotice from "./features/common/DisclosureNotice.jsx";
import { normalizeServingToGrams } from "./lib/gl.js";

const DEFAULT_SERVING = 100;
const DEFAULT_UNIT = "g";

const USE_CASES = [
  {
    title: "Compare realistic servings",
    body: "GL changes with portion size. A high-GI food can have a modest load in a small serving, while a larger serving can move the same food into a higher range.",
  },
  {
    title: "Check foods three ways",
    body: "Start with text search for common foods, use barcode lookup for packaged products, or upload a food photo when you need a quick candidate match.",
  },
  {
    title: "Read the result in context",
    body: "The calculator shows GI, estimated carbohydrates, and GL together so the number is tied to the actual serving rather than a generic food label.",
  },
];

const FAQS = [
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

function SeoGuide() {
  return (
    <div className="seo-guide" aria-label="Glycemic load guide">
      <section className="panel seo-panel" aria-labelledby="how-it-works-heading">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2 id="how-it-works-heading">Calculate glycemic load from GI and serving size</h2>
        </div>
        <p>
          Glycemic load connects a food's glycemic index with the amount of
          carbohydrate in the serving you plan to eat. That makes it more
          practical than checking GI alone, because a food's effect depends on
          both carbohydrate quality and portion size.
        </p>
        <div className="formula-box" aria-label="Glycemic load formula">
          <span>GL</span>
          <strong>=</strong>
          <span>GI x carbohydrate grams per serving / 100</span>
        </div>
      </section>

      <section className="seo-grid" aria-label="Ways to use the calculator">
        {USE_CASES.map((item) => (
          <article className="panel seo-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="panel seo-panel" aria-labelledby="faq-heading">
        <div className="section-heading">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-heading">Glycemic load calculator questions</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [selectedFood, setSelectedFood] = useState(null);
  const [serving, setServing] = useState(DEFAULT_SERVING);
  const [unit, setUnit] = useState(DEFAULT_UNIT);

  const grams = normalizeServingToGrams(serving, unit);

  return (
    <main className="app-shell">
      <header className="hero panel hero--app" aria-labelledby="app-title">
        <div className="hero__topline">
          <p className="eyebrow">GI and GL nutrition calculator</p>
          <span className="hero__badge">Free installable PWA</span>
        </div>
        <h1 id="app-title">Glycemic Load Calculator</h1>
        <p className="hero__copy">
          Search foods by name, barcode, or photo, then calculate glycemic load
          from glycemic index, carbohydrates, and your serving size.
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

      <SeoGuide />
    </main>
  );
}
