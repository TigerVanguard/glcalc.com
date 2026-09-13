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

export default defineConfig({
  testDir: "tests/e2e",
  projects: [
    {
      name: "static",
      testMatch: /(prerender|seo)\.spec\.js/,
      use: { baseURL: staticBaseURL },
    },
    {
      name: "app",
      testMatch: /(app|pwa)\.spec\.js/,
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
