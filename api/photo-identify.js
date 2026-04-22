import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildFoodCatalog, matchFoodCandidates } from "../src/lib/foodMatch.js";
import { normalizeFood } from "../src/lib/normalizeFood.js";

const glycemicIndex = JSON.parse(
  readFileSync(fileURLToPath(new URL("../src/data/gi.json", import.meta.url)), "utf8"),
);
const FOOD_CATALOG = buildFoodCatalog(glycemicIndex);

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function buildMatchSummary(candidates) {
  return {
    hasStrongMatch: candidates.length > 0 && candidates[0].score >= 85,
    bestScore: candidates[0]?.score ?? 0,
  };
}

function buildCandidatePayload(query) {
  return matchFoodCandidates(query, FOOD_CATALOG, {
    limit: 5,
    minScore: 35,
  });
}

function getOpenAIModel() {
  return process.env.GLCALC_OPENAI_MODEL ?? "gpt-4.1-mini";
}

function getPhotoProviderMode() {
  return String(process.env.GLCALC_PHOTO_PROVIDER ?? "").trim().toLowerCase();
}

function parseImageDataUrl(imageDataUrl) {
  if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:")) {
    return null;
  }

  const commaIndex = imageDataUrl.indexOf(",");
  if (commaIndex === -1) {
    return null;
  }

  const header = imageDataUrl.slice(5, commaIndex);
  const payload = imageDataUrl.slice(commaIndex + 1);
  const mimeType = header.split(";")[0] || "application/octet-stream";

  try {
    const buffer = Buffer.from(payload, "base64");

    return {
      mimeType,
      buffer,
      text: mimeType.includes("svg") ? buffer.toString("utf8") : "",
    };
  } catch {
    return null;
  }
}

function findDemoQuery(sourceText) {
  const normalizedSource = normalizeFood(sourceText);

  if (!normalizedSource) {
    return null;
  }

  const directMatches = ["blueberries", "brown rice"];
  for (const title of directMatches) {
    if (normalizedSource.includes(normalizeFood(title))) {
      return title;
    }
  }

  const catalogMatch = FOOD_CATALOG.find((food) =>
    normalizedSource.includes(normalizeFood(food.title)),
  );

  return catalogMatch?.title ?? null;
}

function buildSuccessResponse({ provider, fileName, mimeType, label, confidence }) {
  const candidates = buildCandidatePayload(label);

  if (candidates.length === 0) {
    return null;
  }

  return jsonResponse({
    ok: true,
    provider,
    image: {
      fileName,
      mimeType,
    },
    analysis: {
      label,
      confidence,
    },
    candidates,
    matchSummary: buildMatchSummary(candidates),
  });
}

async function identifyWithOpenAI(imageDataUrl) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAIModel(),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                'Identify the most likely food in the image. Return only JSON with keys label and confidence. If no food is visible, return {"label":null,"confidence":0}. Do not give medical advice.',
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
              detail: "low",
            },
          ],
        },
      ],
      temperature: 0,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI vision request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const outputText = String(payload.output_text ?? "").trim();

  if (!outputText) {
    return null;
  }

  try {
    const parsed = JSON.parse(outputText);
    const label = typeof parsed.label === "string" ? parsed.label.trim() : "";
    const confidence = Number(parsed.confidence);

    return {
      label: label || null,
      confidence: Number.isFinite(confidence) ? confidence : 0,
    };
  } catch {
    return null;
  }
}

function buildDemoResponse(image, fileName) {
  const sourceText = `${fileName ?? ""} ${image.text ?? ""}`;
  const label = findDemoQuery(sourceText);

  if (!label) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "unrecognized_image",
          message: "We could not recognize a food in that image.",
        },
      },
      422,
    );
  }

  const success = buildSuccessResponse({
    provider: "mock",
    fileName,
    mimeType: image.mimeType,
    label,
    confidence: 1,
  });

  if (!success) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "unrecognized_image",
          message: "We could not find a confident food match in that image.",
        },
      },
      422,
    );
  }

  return success;
}

export async function handlePhotoIdentifyRequest(request) {
  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "method_not_allowed",
          message: "Only POST requests are supported.",
        },
      },
      405,
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "invalid_image",
          message: "Upload an image file before asking for a match.",
        },
      },
      400,
    );
  }

  const fileName = String(payload?.fileName ?? "").trim();
  const imageDataUrl = String(payload?.imageDataUrl ?? "").trim();
  const image = parseImageDataUrl(imageDataUrl);

  if (!image) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "invalid_image",
          message: "Upload a supported image file before asking for a match.",
        },
      },
      400,
    );
  }

  const providerEnabled = getPhotoProviderMode() === "openai" && Boolean(process.env.OPENAI_API_KEY);

  if (!providerEnabled) {
    return buildDemoResponse(image, fileName);
  }

  try {
    const analysis = await identifyWithOpenAI(imageDataUrl);

    if (!analysis?.label) {
      return jsonResponse(
        {
          ok: false,
          error: {
            code: "unrecognized_image",
            message: "The vision provider did not identify a food in that image.",
          },
        },
        422,
      );
    }

    const success = buildSuccessResponse({
      provider: "openai",
      fileName,
      mimeType: image.mimeType,
      label: analysis.label,
      confidence: analysis.confidence,
    });

    if (!success) {
      return jsonResponse(
        {
          ok: false,
          error: {
            code: "unrecognized_image",
            message: "No candidate foods matched the provider response.",
          },
        },
        422,
      );
    }

    return success;
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: {
          code: "provider_failure",
          message:
            error instanceof Error
              ? `Photo provider failed: ${error.message}`
              : "Photo provider failed.",
        },
      },
      502,
    );
  }
}

export default handlePhotoIdentifyRequest;
