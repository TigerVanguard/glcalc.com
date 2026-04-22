import { useState } from "react";
import ErrorNotice from "../common/ErrorNotice.jsx";
import FoodCandidateList from "../confirm/FoodCandidateList.jsx";

function parseErrorMessage(payload) {
  return payload?.error?.message ?? "Barcode lookup failed.";
}

export default function BarcodeLookup({ onConfirmCandidate }) {
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const value = barcode.trim();
    if (!value) {
      setError({
        title: "Enter a barcode",
        message: "Type a barcode before starting the lookup.",
      });
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/barcode?barcode=${encodeURIComponent(value)}`);
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setResult(null);
        setError({
          title:
            payload?.error?.code === "invalid_barcode"
              ? "Invalid barcode"
              : payload?.error?.code === "unknown_barcode"
                ? "Barcode not found"
                : "Barcode lookup failed",
          message: parseErrorMessage(payload),
        });
        return;
      }

      setResult(payload);
    } catch (fetchError) {
      setResult(null);
      setError({
        title: "Barcode lookup failed",
        message: fetchError instanceof Error ? fetchError.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="panel panel--barcode" aria-labelledby="barcode-heading">
      <div className="section-heading">
        <p className="eyebrow">Step 1b</p>
        <h2 id="barcode-heading">Look up a packaged food by barcode</h2>
      </div>

      <form className="barcode-form" onSubmit={handleSubmit}>
        <label className="field" htmlFor="barcode-input">
          <span className="field-label">Barcode</span>
          <input
            id="barcode-input"
            className="search-input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Try 1234567890123"
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
          />
        </label>

        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Looking up..." : "Look up barcode"}
        </button>
      </form>

      {error ? (
        <ErrorNotice
          title={error.title}
          message={error.message}
          actionLabel="Try another barcode"
          onAction={() => setError(null)}
        />
      ) : null}

      {result ? (
        <FoodCandidateList
          product={result.product}
          candidates={result.candidates}
          onConfirm={onConfirmCandidate}
        />
      ) : null}
    </section>
  );
}
