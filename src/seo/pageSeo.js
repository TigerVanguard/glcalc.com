// Per-route SEO source of truth (ticket 04, Spec §5B.1 / §5B.2 / §5B.4).
//
// - pageTitle / description: the FINAL copy from Spec §5B.1, verbatim — do not
//   edit without updating the spec. Full <title> = `${pageTitle} | ${BRAND}`.
// - canonical: SITE_ORIGIN + path, no trailing slash; root is exempt and uses
//   SITE_ORIGIN + "/" (§5B.4).
// - jsonLd: §5B.2 distribution — home: WebSite + WebApplication; each tool
//   page: one WebApplication (name = page H1, description = meta description);
//   FAQPage ONLY where the page shows a visible FAQ (currently just the GL
//   page, sourced verbatim from src/data/glFaq.js); /about: AboutPage +
//   Organization. MedicalWebPage / MedicalRiskCalculator are forbidden
//   site-wide (§5B.2-5).
//
// scripts/verify-dist.mjs intentionally re-hardcodes the §5B.1 copy instead of
// importing this module, so a typo here cannot self-certify.

import { SITE_ORIGIN, BRAND } from "../site.config.js";
import { GL_FAQS } from "../data/glFaq.js";
import { BLOOD_SUGAR_CONVERTER_FAQS } from "../data/bloodSugarConverterFaq.js";
import { A1C_TO_EAG_FAQS } from "../data/a1cToEagFaq.js";
import { GLUCOSE_TO_A1C_FAQS } from "../data/glucoseToA1cFaq.js";
import { GMI_FAQS } from "../data/gmiFaq.js";
import { GI_FAQS } from "../data/giFaq.js";

export const OG_IMAGE_URL = `${SITE_ORIGIN}/og-cover.png`;

// P0 fallback contact entry point (Spec §4 P0-3): GitHub repository issues
// until the maintainer provides a real contact channel.
export const CONTACT_URL = "https://github.com/TigerVanguard/glcalc.com/issues";

export function canonicalFor(path) {
  return path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

function webApplication(path, name, description) {
  return {
    "@type": "WebApplication",
    name,
    url: canonicalFor(path),
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
    description,
  };
}

function faqPage(faqs) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

// { path: { pageTitle, description, jsonLd } } — a plain tool page needs only
// its WebApplication; home / GL / about get extra nodes below.
function toolPage(path, pageTitle, h1, description) {
  return { pageTitle, description, jsonLd: [webApplication(path, h1, description)] };
}

const HOME_DESCRIPTION =
  "Free calculators for glycemic load, glycemic index, GMI, A1C to eAG, and blood sugar unit conversion. No sign-up, no ads walls, every formula source cited.";

const ABOUT_DESCRIPTION =
  "Where our GI data and formulas come from: DiOGenes GI database, ADAG (Nathan 2008), GMI (Bergenstal 2018). Open-source attribution and medical disclaimer.";

const glPage = toolPage(
  "/glycemic-load-calculator",
  "Glycemic Load Calculator – GL by Food & Serving",
  "Glycemic Load Calculator",
  "Calculate glycemic load from real serving sizes. Search foods, scan barcodes, or use a photo, then see GI, carbs, and GL together. GL = GI × carbs ÷ 100.",
);
// FAQPage only where the page shows a visible FAQ (§5B.2-3): the GL page
// (src/data/glFaq.js — the old index.html @graph FAQPage semantics converge
// here), since ticket 07 the converter page
// (src/data/bloodSugarConverterFaq.js), and since ticket 08 the a1c-to-eag
// page (src/data/a1cToEagFaq.js).
glPage.jsonLd.push(faqPage(GL_FAQS));

const converterPage = toolPage(
  "/blood-sugar-converter",
  "Blood Sugar Converter – mg/dL ⇄ mmol/L",
  "Blood Sugar Converter (mg/dL ⇄ mmol/L)",
  "Convert blood sugar between mg/dL and mmol/L instantly in both directions. Includes a reference table of common values and why the two units exist.",
);
converterPage.jsonLd.push(faqPage(BLOOD_SUGAR_CONVERTER_FAQS));

const a1cToEagPage = toolPage(
  "/a1c-to-eag-calculator",
  "A1C Calculator – Convert A1C to eAG",
  "A1C to eAG Calculator",
  "Convert A1C to estimated average glucose (eAG) in mg/dL and mmol/L using the ADAG formula (28.7 × A1C − 46.7). Includes accuracy limits and reference info.",
);
a1cToEagPage.jsonLd.push(faqPage(A1C_TO_EAG_FAQS));

const glucoseToA1cPage = toolPage(
  "/glucose-to-a1c-estimator",
  "Average Glucose to A1C Estimator",
  "Average Glucose to A1C Estimator",
  "Estimate an A1C range from your average blood glucose. Shows a range, not a single number, and explains why reverse estimation has built-in uncertainty.",
);
// Visible FAQ added by ticket 09 (src/data/glucoseToA1cFaq.js) → FAQPage
// allowed per §5B.2-3.
glucoseToA1cPage.jsonLd.push(faqPage(GLUCOSE_TO_A1C_FAQS));

const giPage = toolPage(
  "/glycemic-index-calculator",
  "Glycemic Index Calculator – Look Up Food GI",
  "Glycemic Index Calculator",
  "Look up the glycemic index of common foods and see low, medium, or high GI at a glance. Includes carbs per 100 g and a direct link to calculate glycemic load.",
);
// Visible FAQ added by ticket 11 (src/data/giFaq.js) → FAQPage allowed per
// §5B.2-3.
giPage.jsonLd.push(faqPage(GI_FAQS));

const gmiPage = toolPage(
  "/gmi-calculator",
  "GMI Calculator – Glucose Management Indicator",
  "GMI Calculator (Glucose Management Indicator)",
  "Convert your CGM average glucose into a Glucose Management Indicator (GMI). Uses the published Bergenstal 2018 formula and explains how GMI differs from lab A1C.",
);
// Visible FAQ added by ticket 10 (src/data/gmiFaq.js) → FAQPage allowed per
// §5B.2-3.
gmiPage.jsonLd.push(faqPage(GMI_FAQS));

export const PAGE_SEO = {
  "/": {
    pageTitle: "Free Blood Sugar & Glycemic Calculators",
    description: HOME_DESCRIPTION,
    jsonLd: [
      { "@type": "WebSite", name: BRAND, url: `${SITE_ORIGIN}/`, inLanguage: "en" },
      webApplication("/", "Free Blood Sugar & Glycemic Calculators", HOME_DESCRIPTION),
    ],
  },
  "/glycemic-load-calculator": glPage,
  "/glycemic-index-calculator": giPage,
  "/gmi-calculator": gmiPage,
  "/a1c-to-eag-calculator": a1cToEagPage,
  "/blood-sugar-converter": converterPage,
  "/glucose-to-a1c-estimator": glucoseToA1cPage,
  "/about": {
    pageTitle: "About – Data Sources, Formulas & Disclaimer",
    description: ABOUT_DESCRIPTION,
    jsonLd: [
      {
        "@type": "AboutPage",
        name: `About ${BRAND}`,
        url: canonicalFor("/about"),
        description: ABOUT_DESCRIPTION,
      },
      {
        "@type": "Organization",
        name: BRAND,
        url: `${SITE_ORIGIN}/`,
        contactPoint: { "@type": "ContactPoint", contactType: "support", url: CONTACT_URL },
      },
    ],
  },
};
