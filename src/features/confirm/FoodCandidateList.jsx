import { getGiLabel } from "../../lib/gl.js";

function formatMatchType(matchType) {
  if (matchType === "exact") {
    return "Exact match";
  }

  if (matchType === "close") {
    return "Close match";
  }

  return "Partial match";
}

function formatNutrimentValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return `${Math.round(numeric * 10) / 10} g`;
}

export default function FoodCandidateList({
  product,
  candidates,
  onConfirm,
  summary = null,
  emptyMessage,
  stepLabel = "Step 2",
  heading = "Confirm the matching food",
}) {
  const imageUrl = summary?.imageUrl ?? product?.image_url ?? product?.image_front_small_url ?? null;
  const carbsPer100g = formatNutrimentValue(product?.nutriments?.carbohydrates_100g);
  const imageAlt =
    summary?.imageAlt ?? (product?.product_name ? `${product.product_name} package` : "Product image");
  const title = summary?.title ?? product?.product_name ?? "Unknown product";
  const meta = summary?.meta ?? `Barcode ${product?.code ?? "unknown"}`;
  const body = summary?.body ?? (carbsPer100g ? `Label carbs: ${carbsPer100g} per 100 g` : null);

  return (
    <section className="panel panel--candidates" aria-labelledby="candidates-heading">
      <div className="section-heading">
        <p className="eyebrow">{stepLabel}</p>
        <h2 id="candidates-heading">{heading}</h2>
      </div>

      <div className="barcode-product">
        {imageUrl ? (
          <img
            className="barcode-product__image"
            src={imageUrl}
            alt={imageAlt}
          />
        ) : (
          <div className="barcode-product__image barcode-product__image--placeholder" aria-hidden="true">
            No image
          </div>
        )}

        <div className="barcode-product__meta">
          <p className="barcode-product__name">{title}</p>
          <p className="muted">{meta}</p>
          {body ? <p className="muted">{body}</p> : null}
        </div>
      </div>

      {candidates.length > 0 ? (
        <ul className="search-results" aria-label="Barcode food candidates">
          {candidates.map((candidate) => (
            <li key={candidate.title}>
              <button
                type="button"
                className="search-result"
                onClick={() => onConfirm(candidate)}
              >
                <span className="search-result__title">{candidate.title}</span>
                <span className={`pill pill--${getGiLabel(Number(candidate.gi)).toLowerCase()}`}>
                  GI {candidate.gi} {formatMatchType(candidate.matchType)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">
          {emptyMessage ?? "No strong match yet. Try another barcode or switch to text search."}
        </p>
      )}
    </section>
  );
}
