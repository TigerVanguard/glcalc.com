import { useState } from "react";
import FoodSearch from "./features/search/FoodSearch.jsx";
import BarcodeLookup from "./features/barcode/BarcodeLookup.jsx";
import PhotoLookup from "./features/photo/PhotoLookup.jsx";
import CalculatorResult from "./features/calculator/CalculatorResult.jsx";
import DisclosureNotice from "./features/common/DisclosureNotice.jsx";
import FinderTabs from "./features/workflow/FinderTabs.jsx";
import SelectedFoodSummary from "./features/workflow/SelectedFoodSummary.jsx";
import { normalizeServingToGrams } from "./lib/gl.js";
import { GL_FAQS } from "./data/glFaq.js";

const DEFAULT_SERVING = 100;
const DEFAULT_UNIT = "g";
const FINDER_OPTIONS = [
  { value: "search", label: "Search" },
  { value: "barcode", label: "Barcode" },
  { value: "photo", label: "Photo" },
];

const WORKFLOW_STAGES = [
  {
    title: "Find a food",
    body: "Use text search, a typed barcode, or a food photo to reach a confirmed match.",
  },
  {
    title: "Set serving",
    body: "Keep the portion realistic in grams or ounces so the estimate reflects what you plan to eat.",
  },
  {
    title: "Review GL",
    body: "Read glycemic load first, then check GI and carbohydrates as supporting context.",
  },
];

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

// FAQ content lives in src/data/glFaq.js so the visible text and the FAQPage
// JSON-LD (src/seo/pageSeo.js) can never drift apart (ticket 04, Spec §5B.2-3).
const FAQS = GL_FAQS;

function SeoGuide() {
  return (
    <section className="seo-guide" aria-label="Glycemic load guide">
      <div className="seo-guide__intro">
        <p className="eyebrow">Learn the method</p>
        <h2>More context for glycemic load decisions</h2>
        <p>
          The calculator stays first. These notes live below it so you can
          sanity-check how GL works without interrupting the workflow.
        </p>
      </div>

      <section className="panel seo-panel" aria-labelledby="how-it-works-heading">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2 id="how-it-works-heading">Calculate glycemic load from GI and serving size</h2>
        </div>
        <p>
          Glycemic load connects a food&apos;s glycemic index with the amount of
          carbohydrate in the serving you plan to eat. That makes it more
          practical than checking GI alone, because a food&apos;s effect depends on
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
    </section>
  );
}

// initialSelection: optional preconfirmed food (same shape the finders emit on
// confirm), used by the /glycemic-load-calculator `?food=` deep link (ticket
// 05). Default null keeps behavior identical to before.
export default function App({ initialSelection = null }) {
  const [selectedFood, setSelectedFood] = useState(initialSelection);
  const [activeFinder, setActiveFinder] = useState("search");
  const [serving, setServing] = useState(DEFAULT_SERVING);
  const [unit, setUnit] = useState(DEFAULT_UNIT);

  const grams = normalizeServingToGrams(serving, unit);
  const handleSelectSelection = (selection) => {
    setSelectedFood(selection);
  };

  return (
    <main className="app-shell">
      <header className="hero panel hero--app" aria-labelledby="app-title">
        <div className="hero__content">
          <div className="hero__intro">
            <p className="eyebrow">Calm nutrition field guide</p>
            <h1 id="app-title">Glycemic Load Calculator</h1>
            <p className="hero__copy">
              Find a food, set a realistic serving, and review estimated GL in a
              phone-friendly workspace built for grocery aisles, meal prep, and
              quick comparisons.
            </p>
            <div className="hero__actions">
              <a className="hero__cta" href="#calculator-workspace">
                Start a quick food check
              </a>
              <p className="hero__install">
                Install it on your home screen for faster reopen-and-check use
                while shopping or planning meals.
              </p>
            </div>
          </div>

          <div className="hero__story" aria-label="Calculator stages">
            <p className="hero__story-label">Three-stage workflow</p>
            <ol className="stage-story">
              {WORKFLOW_STAGES.map((stage, index) => (
                <li key={stage.title} className="stage-story__item">
                  <span className="stage-story__index">0{index + 1}</span>
                  <div>
                    <p className="stage-story__title">{stage.title}</p>
                    <p className="stage-story__body">{stage.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </header>

      <section
        id="calculator-workspace"
        className="calculator-experience"
        aria-labelledby="calculator-heading"
      >
        <div className="calculator-experience__intro">
          <div className="section-heading">
            <p className="eyebrow">Calculator workflow</p>
            <h2 id="calculator-heading">Find a food, set serving, then review GL</h2>
          </div>
          <p className="muted calculator-experience__copy">
            Switch methods without losing draft input. The selected food stays
            active until you clear it yourself.
          </p>
        </div>

        <div className={`layout${selectedFood ? " layout--has-selection" : ""}`}>
          <div className="stack stack--workflow">
            <section className="panel workflow-shell" aria-labelledby="finder-stage-heading">
              <div className="section-heading">
                <p className="eyebrow">Find a food</p>
                <h2 id="finder-stage-heading">Choose one lookup method</h2>
              </div>
              <p className="muted workflow-shell__copy">
                Use one finder at a time, confirm the best match, and keep your
                draft in place while you switch between methods.
              </p>

              <FinderTabs
                options={FINDER_OPTIONS}
                activeValue={activeFinder}
                onChange={setActiveFinder}
              />

              <div className="finder-workspace">
                <div
                  id="finder-panel-search"
                  role="tabpanel"
                  aria-labelledby="finder-tab-search"
                  hidden={activeFinder !== "search"}
                >
                  <FoodSearch onSelectSelection={handleSelectSelection} />
                </div>
                <div
                  id="finder-panel-barcode"
                  role="tabpanel"
                  aria-labelledby="finder-tab-barcode"
                  hidden={activeFinder !== "barcode"}
                >
                  <BarcodeLookup onSelectSelection={handleSelectSelection} />
                </div>
                <div
                  id="finder-panel-photo"
                  role="tabpanel"
                  aria-labelledby="finder-tab-photo"
                  hidden={activeFinder !== "photo"}
                >
                  <PhotoLookup onSelectSelection={handleSelectSelection} />
                </div>
              </div>
            </section>

            <SelectedFoodSummary
              selectedFood={selectedFood}
              onClear={() => setSelectedFood(null)}
            />

            <section className="panel panel--controls" aria-labelledby="controls-heading">
              <div className="section-heading">
                <p className="eyebrow">Set serving</p>
                <h2 id="controls-heading">Adjust the portion you want to compare</h2>
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

              <p className="muted serving-note">
                Current serving basis: {serving} {unit} ={" "}
                {Math.round(grams * 10) / 10} g
              </p>
            </section>
          </div>

          <aside className="result-column" aria-label="Result workspace">
            <div className="result-column__inner">
              <CalculatorResult
                food={selectedFood?.food ?? null}
                serving={serving}
                unit={unit}
              />
              <DisclosureNotice />
            </div>
          </aside>
        </div>
      </section>

      <SeoGuide />
    </main>
  );
}
