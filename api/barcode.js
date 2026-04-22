import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildFoodCatalog, matchFoodCandidates } from "../src/lib/foodMatch.js";

const OFF_BASE_URL = "https://world.openfoodfacts.net/api/v2/product";
const OFF_FIELDS = [
  "product_name",
  "code",
  "nutriments",
  "image_front_small_url",
  "image_front_url",
  "image_url",
  "brands",
].join(",");

const glycemicIndex = JSON.parse(
  readFileSync(fileURLToPath(new URL("../src/data/gi.json", import.meta.url)), "utf8"),
);
const FOOD_CATALOG = buildFoodCatalog(glycemicIndex);

const MOCK_PRODUCTS = {
  "1234567890123": {
    code: "1234567890123",
    product_name: "Blueberries",
    nutriments: {
      carbohydrates_100g: 11,
      carbohydrates: 11,
    },
    image_url: null,
    image_front_small_url: null,
  },
  "4000000000002": {
    code: "4000000000002",
    product_name: "Brown rice",
    nutriments: {
      carbohydrates_100g: 32.1,
      carbohydrates: 32.1,
    },
    image_url: null,
    image_front_small_url: null,
  },
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isBarcodeValid(barcode) {
  return /^\d{8,14}$/.test(barcode);
}

function normalizeProviderMode() {
  const configured = String(process.env.GLCALC_BARCODE_PROVIDER ?? "").trim().toLowerCase();

  if (configured === "openfoodfacts" || configured === "off" || configured === "live") {
    return "openfoodfacts";
  }

  return "mock";
}

function buildApiProduct(product) {
  return {
    code: product.code,
    product_name: product.product_name ?? "",
    nutriments: product.nutriments ?? {},
    image_url:
      product.image_front_small_url ??
      product.image_front_url ??
      product.image_url ??
      null,
  };
}

function buildMatchSummary(candidates) {
  return {
    hasStrongMatch: candidates.length > 0 && candidates[0].score >= 85,
    bestScore: candidates[0]?.score ?? 0,
  };
}

async function lookupOpenFoodFactsProduct(barcode) {
  const url = new URL(`${OFF_BASE_URL}/${encodeURIComponent(barcode)}`);
  url.searchParams.set("fields", OFF_FIELDS);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (payload?.status !== 1 || !payload.product) {
    return null;
  }

  return payload.product;
}

function lookupMockProduct(barcode) {
  return MOCK_PRODUCTS[barcode] ?? null;
}

function buildCandidatePayload(query) {
  return matchFoodCandidates(query, FOOD_CATALOG, {
    limit: 5,
    minScore: 35,
  });
}

export async function handleBarcodeRequest(request) {
  if (request.method !== "GET") {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "method_not_allowed",
          message: "Only GET requests are supported.",
        },
      },
      405,
    );
  }

  const url = new URL(request.url);
  const barcode = (url.searchParams.get("barcode") ?? url.searchParams.get("code") ?? "").trim();

  if (!barcode) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "missing_barcode",
          message: "Enter a barcode to look up.",
        },
      },
      400,
    );
  }

  if (!isBarcodeValid(barcode)) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "invalid_barcode",
          message: "Barcode values must contain 8 to 14 digits.",
        },
      },
      400,
    );
  }

  const providerMode = normalizeProviderMode();
  const product =
    providerMode === "openfoodfacts"
      ? await lookupOpenFoodFactsProduct(barcode)
      : lookupMockProduct(barcode);

  if (!product) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "unknown_barcode",
          message: "No product was found for that barcode.",
        },
      },
      404,
    );
  }

  const apiProduct = buildApiProduct(product);
  const candidateQuery = [apiProduct.product_name, product.brands].filter(Boolean).join(" ");
  const candidates = buildCandidatePayload(candidateQuery);

  return jsonResponse({
    ok: true,
    provider: providerMode,
    product: apiProduct,
    candidates,
    matchSummary: buildMatchSummary(candidates),
  });
}

export default handleBarcodeRequest;
