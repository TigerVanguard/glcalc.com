import { afterEach, describe, expect, it, vi } from "vitest";
import handlePhotoIdentifyRequest from "../../api/photo-identify.js";

function toDataUrl(svgText) {
  return `data:image/svg+xml;base64,${Buffer.from(svgText, "utf8").toString("base64")}`;
}

async function readJson(response) {
  return JSON.parse(await response.text());
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("handlePhotoIdentifyRequest", () => {
  it("returns demo candidates for a recognized uploaded image", async () => {
    const request = new Request("http://localhost/api/photo-identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: "blueberries.svg",
        imageDataUrl: toDataUrl("<svg xmlns='http://www.w3.org/2000/svg'><title>Blueberries</title></svg>"),
      }),
    });

    const response = await handlePhotoIdentifyRequest(request);
    const payload = await readJson(response);

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      provider: "mock",
      analysis: {
        label: "blueberries",
        confidence: 1,
      },
    });
    expect(payload.candidates[0]).toMatchObject({
      title: "Blueberries",
      gi: 45,
    });
  });

  it("returns a recoverable error when the image is unrecognized", async () => {
    const request = new Request("http://localhost/api/photo-identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: "unknown.svg",
        imageDataUrl: toDataUrl("<svg xmlns='http://www.w3.org/2000/svg'><title>Mystery object</title></svg>"),
      }),
    });

    const response = await handlePhotoIdentifyRequest(request);
    const payload = await readJson(response);

    expect(response.status).toBe(422);
    expect(payload).toMatchObject({
      ok: false,
      error: {
        code: "unrecognized_image",
      },
    });
  });

  it("returns a recoverable error when the provider fails", async () => {
    vi.stubEnv("GLCALC_PHOTO_PROVIDER", "openai");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      })),
    );

    const request = new Request("http://localhost/api/photo-identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: "blueberries.svg",
        imageDataUrl: toDataUrl("<svg xmlns='http://www.w3.org/2000/svg'><title>Blueberries</title></svg>"),
      }),
    });

    const response = await handlePhotoIdentifyRequest(request);
    const payload = await readJson(response);

    expect(response.status).toBe(502);
    expect(payload).toMatchObject({
      ok: false,
      error: {
        code: "provider_failure",
      },
    });
  });
});
