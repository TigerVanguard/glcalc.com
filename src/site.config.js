// Site-wide constants. All absolute URLs (canonical/OG/sitemap/schema) must be
// generated from SITE_ORIGIN; switching domains (Spec §4 P5) only changes env vars.
//
// Env source: Vite contexts (app/dev/build/vitest) provide import.meta.env;
// plain Node contexts (Playwright specs importing these constants, e.g.
// tests/e2e/pwa.spec.js) fall back to process.env — same VITE_* variable
// names, same defaults, so a build-time override stays consistent everywhere.
const env = import.meta.env ?? process.env ?? {};

export const SITE_ORIGIN = env.VITE_SITE_ORIGIN || "https://glucomath.com";

export const BRAND = env.VITE_BRAND || "GlucoMath";
