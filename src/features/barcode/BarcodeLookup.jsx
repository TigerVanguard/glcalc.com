import { useRef, useState } from "react";
import ErrorNotice from "../common/ErrorNotice.jsx";
import FoodCandidateList from "../confirm/FoodCandidateList.jsx";

function parseErrorMessage(payload) {
  return payload?.error?.message ?? "Barcode lookup failed.";
}

export default function BarcodeLookup({ onSelectSelection }) {
  const requestIdRef = useRef(0);
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearBarcodeState = () => {
    requestIdRef.current += 1;
    setBarcode("");
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

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
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      const response = await fetch(`/api/barcode?barcode=${encodeURIComponent(value)}`);
      const payload = await response.json();

      if (requestId !== requestIdRef.current) {
        return;
      }

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
      if (requestId !== requestIdRef.current) {
        return;
      }

      setResult(null);
      setError({
        title: "Barcode lookup failed",
        message: fetchError instanceof Error ? fetchError.message : "Please try again.",
      });
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleConfirmCandidate = (candidate) => {
    onSelectSelection?.({
      food: candidate,
      source: "barcode",
      sourceLabel: "Barcode lookup",
    });
  };

  return (
    <section className="panel panel--barcode" aria-labelledby="barcode-heading">
      <div className="section-heading">
        <p className="eyebrow">Find a food</p>
        <h2 id="barcode-heading">Type a barcode</h2>
      </div>
      <p className="muted">Use the package barcode to get likely food matches, then confirm the closest one.</p>

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

        <div className="barcode-form__actions">
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Looking up..." : "Look up barcode"}
          </button>
          {barcode || result || error ? (
            <button type="button" className="secondary-button" onClick={clearBarcodeState}>
              Clear barcode
            </button>
          ) : null}
        </div>
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
          onConfirm={handleConfirmCandidate}
        />
      ) : null}
    </section>
  );
}
