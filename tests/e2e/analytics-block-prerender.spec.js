// Analytics blocked in tests e2e (static project, content & UX batch CU-01).
//
// FILENAME NOTE: playwright.config.js routes the static project by
// testMatch /(prerender|seo)\.spec\.js/ — this file deliberately ends in
// "prerender.spec.js" so it runs against the built dist/ without touching the
// config (same convention as route-split-prerender.spec.js). Its twin,
// analytics-block-app.spec.js, runs the same check in the app project, so
// each project proves it inherited the config's launch args. Unlike
// prerender.spec.js, JavaScript is ENABLED here: script loading is what this
// test observes.
//
// Contract under test: the prerendered HTML loads GA4 (gtag.js) and the
// Cloudflare Web Analytics beacon unconditionally, and only the TEST browser
// is cut off from them — playwright.config.js resolves the analytics hosts to
// ~NOTFOUND (--host-resolver-rules). So on a page load:
// ① the served HTML still carries the GA4 loader + config call and the beacon
//   (parsed from the response body, not read from the live DOM);
// ② no analytics host answers anything (zero response events);
// ③ both loader scripts ARE requested and fail with net::ERR_NAME_NOT_RESOLVED:
//   blocked at DNS, not merely never requested.
// No page.route here (unlike route-split-prerender.spec.js): an aborted route
// fails the same requests with a different error and would hide a missing
// launch arg.

import { test, expect } from "@playwright/test";

const GTAG_SRC = "https://www.googletagmanager.com/gtag/js?id=G-PDPYWE3JR5";
const GTAG_CONFIG_CALL = 'gtag("config", "G-PDPYWE3JR5")';
const CF_BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";
const CF_BEACON_TOKEN = "2c05a228f62c487ca3f96597b09174dc";
// Each domain covers the bare host and every subdomain.
const ANALYTICS_DOMAINS = ["googletagmanager.com", "google-analytics.com", "cloudflareinsights.com"];
const BLOCKED_AT_DNS = "net::ERR_NAME_NOT_RESOLVED";

function isAnalyticsUrl(url) {
  const { hostname } = new URL(url);
  return ANALYTICS_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function recordAnalyticsTraffic(context) {
  const requests = [];
  const responses = [];
  const failed = [];
  context.on("request", (request) => {
    if (isAnalyticsUrl(request.url())) requests.push(request);
  });
  context.on("response", (response) => {
    if (isAnalyticsUrl(response.url())) responses.push(response);
  });
  context.on("requestfailed", (request) => {
    if (isAnalyticsUrl(request.url())) failed.push(request);
  });
  return {
    requestedUrls: () => requests.map((request) => request.url()),
    unsettledCount: () =>
      requests.filter(
        (request) =>
          !failed.includes(request) && !responses.some((response) => response.request() === request),
      ).length,
    responses: () => responses.map((response) => `${response.status()} ${response.url()}`),
    failures: () =>
      failed.map((request) => ({ url: request.url(), errorText: request.failure()?.errorText })),
  };
}

// Runs in the page, so the served HTML goes through the browser's own parser.
function describeAnalyticsTags({ html, gtagSrc, gtagConfigCall, beaconSrc }) {
  const { head } = new DOMParser().parseFromString(html, "text/html");
  return {
    gtagLoaders: [...head.querySelectorAll(`script[src="${gtagSrc}"]`)].map((script) => ({
      async: script.hasAttribute("async"),
    })),
    gtagConfigured: [...head.querySelectorAll("script:not([src])")].some((script) =>
      script.textContent.includes(gtagConfigCall),
    ),
    beacons: [...head.querySelectorAll(`script[src="${beaconSrc}"]`)].map((script) => ({
      type: script.getAttribute("type"),
      async: script.hasAttribute("async"),
      token: JSON.parse(script.getAttribute("data-cf-beacon") ?? "null")?.token ?? null,
    })),
  };
}

test.use({ javaScriptEnabled: true });

test("prerendered page keeps the GA4 + Cloudflare tags, but neither analytics host is ever reached", async ({
  page,
  context,
}) => {
  const traffic = recordAnalyticsTraffic(context);

  const response = await page.goto("/");
  expect(response.status()).toBe(200);
  const html = await response.text();

  // ① production markup unchanged
  expect(
    await page.evaluate(describeAnalyticsTags, {
      html,
      gtagSrc: GTAG_SRC,
      gtagConfigCall: GTAG_CONFIG_CALL,
      beaconSrc: CF_BEACON_SRC,
    }),
  ).toEqual({
    gtagLoaders: [{ async: true }],
    gtagConfigured: true,
    beacons: [{ type: "module", async: true, token: CF_BEACON_TOKEN }],
  });

  await expect
    .poll(
      () => ({
        loadersRequested: [GTAG_SRC, CF_BEACON_SRC].every((src) => traffic.requestedUrls().includes(src)),
        unsettled: traffic.unsettledCount(),
      }),
      { message: "both loaders requested, every analytics request answered or failed" },
    )
    .toEqual({ loadersRequested: true, unsettled: 0 });

  // ② no analytics host answered
  expect(traffic.responses(), "responses from analytics hosts").toEqual([]);

  // ③ requested, and failed at DNS
  const failures = traffic.failures();
  expect(failures).toContainEqual({ url: GTAG_SRC, errorText: BLOCKED_AT_DNS });
  expect(failures).toContainEqual({ url: CF_BEACON_SRC, errorText: BLOCKED_AT_DNS });
  expect(failures.filter(({ errorText }) => errorText !== BLOCKED_AT_DNS)).toEqual([]);
});
