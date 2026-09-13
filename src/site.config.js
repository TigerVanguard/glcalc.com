// Site-wide constants. All absolute URLs (canonical/OG/sitemap/schema) must be
// generated from SITE_ORIGIN; switching domains (Spec §4 P5) only changes env vars.
export const SITE_ORIGIN =
  import.meta.env.VITE_SITE_ORIGIN || "https://glcalc.vercel.app";

export const BRAND = import.meta.env.VITE_BRAND || "GL Calc";
