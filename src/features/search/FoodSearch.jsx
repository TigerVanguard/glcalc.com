import { useEffect, useRef, useState } from "react";
import workerScript from "../../SearchWorker.js";
import glycemicIndex from "../../data/gi.json";
import { getGiLabel } from "../../lib/gl.js";

function formatResultCount(count) {
  if (!count) {
    return "No matches yet";
  }

  return `${count} match${count === 1 ? "" : "es"}`;
}

function normalizeQuery(value) {
  return value.trim().toLowerCase();
}

// Default result pill — the GL page's historical rendering, byte-for-byte
// (app.spec.js asserts accessible names like "Blueberries GI 45 - Low").
// Ticket 11 made it overridable so the GI lookup page can apply the §6.1
// display rule (giData.giDisplayRule) to its own result list without touching
// this default or the worker. A null return renders no pill.
function defaultResultPill(result) {
  const label = getGiLabel(Number(result.gi));

  return { text: `GI ${result.gi} - ${label}`, tone: label.toLowerCase() };
}

export default function FoodSearch({ onSelectSelection, resultPill = defaultResultPill }) {
  const workerRef = useRef(null);
  const latestRequestIdRef = useRef(0);
  const latestQueryRef = useRef("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const worker = new Worker(workerScript);

    worker.onmessage = ({ data }) => {
      if (data?.requestId !== latestRequestIdRef.current) {
        return;
      }

      if (data?.query !== normalizeQuery(latestQueryRef.current)) {
        return;
      }

      setIsLoading(false);
      setResults(data.results ?? []);
    };

    worker.postMessage({ setGlycemicIndex: glycemicIndex });
    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    latestRequestIdRef.current += 1;
    latestQueryRef.current = query;

    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const requestId = latestRequestIdRef.current;
    const timeoutId = window.setTimeout(() => {
      workerRef.current?.postMessage({ query, requestId });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const handlePick = (result) => {
    setResults([]);
    setIsLoading(false);
    onSelectSelection?.({
      food: result,
      source: "search",
      sourceLabel: "Text search",
    });
  };

  return (
    <section className="panel panel--search" aria-labelledby="search-heading">
      <div className="section-heading">
        <p className="eyebrow">Find a food</p>
        <h2 id="search-heading">Search by food name</h2>
      </div>
      <p className="muted">Start with a common food name, then choose the best match.</p>

      <label className="field-label" htmlFor="food-search">
        Food
      </label>
      <input
        id="food-search"
        className="search-input"
        type="search"
        placeholder="Try blueberries, rice, or bread"
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="search-meta" aria-live="polite">
        {isLoading ? "Searching..." : formatResultCount(results.length)}
      </div>

      {results.length > 0 ? (
        <ul className="search-results" aria-label="Food search results">
          {results.map((result) => {
            const pill = resultPill(result);

            return (
              <li key={result.title}>
                <button
                  type="button"
                  className="search-result"
                  onClick={() => handlePick(result)}
                >
                  <span className="search-result__title">{result.title}</span>
                  {pill ? (
                    <span className={`pill pill--${pill.tone}`}>{pill.text}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
