import { defineConfig } from "@playwright/test";

// Two projects (Spec §8 T0-2):
// - "static": serves the built dist/ via scripts/serve-dist.mjs (file-system
//   routing + real 404s, no API). Requires `npm run build` to have run first
//   (`npm run check` guarantees the order). Runs prerender.spec.js and
//   seo.spec.js (rewritten per §5B in ticket 04 — it asserts prerendered head
//   output, which only exists in dist/).
// - "app": vite dev server, which carries the barcode/photo API middlewares
//   (Spec §0A-2) — those e2e flows can only run here. Runs app/pwa specs.

const appPort = process.env.E2E_PORT ?? "4183";
const staticPort = process.env.E2E_STATIC_PORT ?? "4184";
const appBaseURL = `http://127.0.0.1:${appPort}/`;
const staticBaseURL = `http://127.0.0.1:${staticPort}/`;

// index.html loads GA4 (gtag.js) and the Cloudflare Web Analytics beacon
// unconditionally, and must keep doing so; a test browser must never reach
// them, or every local run shows up in both as visits to 127.0.0.1. Chromium's
// resolver fails these hosts with net::ERR_NAME_NOT_RESOLVED while the markup
// stays production-identical (analytics-block-*.spec.js asserts both halves).
// "*.host" does not match the bare host, hence both forms. The rules only
// override Chromium's own DNS, and a proxy resolves hosts itself, so the test
// browser must also ignore the OS proxy settings (tests only talk to
// 127.0.0.1). Each build knows only one of the two switches:
// --no-proxy-server is full Chromium's (headed runs), and
// --no-system-proxy-config-service is chrome-headless-shell's (the default
// headless browser). An explicit proxy — Playwright's `proxy` option or a
// --proxy-server arg — is not covered: in chrome-headless-shell it wins over
// these switches and bypasses the rules.
const ANALYTICS_BLOCK_RULES = [
  "MAP www.googletagmanager.com ~NOTFOUND",
  "MAP googletagmanager.com ~NOTFOUND",
  "MAP *.googletagmanager.com ~NOTFOUND",
  "MAP www.google-analytics.com ~NOTFOUND",
  "MAP google-analytics.com ~NOTFOUND",
  "MAP *.google-analytics.com ~NOTFOUND",
  "MAP static.cloudflareinsights.com ~NOTFOUND",
  "MAP cloudflareinsights.com ~NOTFOUND",
  "MAP *.cloudflareinsights.com ~NOTFOUND",
].join(", ");

export default defineConfig({
  testDir: "tests/e2e",
  // Merged into each project's `use` key by key: a project that sets its own
  // launchOptions replaces this one and must repeat the args.
  use: {
    launchOptions: {
      args: [
        `--host-resolver-rules=${ANALYTICS_BLOCK_RULES}`,
        "--no-proxy-server",
        "--no-system-proxy-config-service",
      ],
    },
  },
  projects: [
    {
      name: "static",
      testMatch: /(prerender|seo)\.spec\.js/,
      use: { baseURL: staticBaseURL },
    },
    {
      name: "app",
      testMatch: /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/,
      use: { baseURL: appBaseURL },
    },
  ],
  webServer: [
    {
      command: `node scripts/serve-dist.mjs --port ${staticPort}`,
      url: staticBaseURL,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${appPort}`,
      url: appBaseURL,
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
