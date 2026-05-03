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

export default function FoodSearch({ onSelect }) {
  const workerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const worker = new Worker(workerScript);

    worker.onmessage = ({ data }) => {
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
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      onSelect?.(null);
      return;
    }

    setIsLoading(true);
    const timeoutId = window.setTimeout(() => {
      workerRef.current?.postMessage({ query });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [query, onSelect]);

  const handlePick = (result) => {
    setResults([]);
    setIsLoading(false);
    onSelect?.(result);
  };

  return (
    <section className="panel panel--search" aria-labelledby="search-heading">
      <div className="section-heading">
        <p className="eyebrow">Step 1</p>
        <h2 id="search-heading">Search a food by text</h2>
      </div>

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
          {results.map((result) => (
            <li key={result.title}>
              <button
                type="button"
                className="search-result"
                onClick={() => handlePick(result)}
              >
                <span className="search-result__title">{result.title}</span>
                <span className={`pill pill--${getGiLabel(Number(result.gi)).toLowerCase()}`}>
                  GI {result.gi} - {getGiLabel(Number(result.gi))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
