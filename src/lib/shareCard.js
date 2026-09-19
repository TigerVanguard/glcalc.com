// Share-card infrastructure (shareable-assets BL-01, Spec §4 / D1 / D5 / D6 / D8).
//
// Three layers, deliberately separated so the text contract is unit-testable
// without a browser:
//   buildCardLines — pure text assembly (no math, no rounding; values arrive
//                    as the page's already-formatted display strings)
//   drawCard       — native Canvas 2D rendering at 1200×630 (D1: zero deps)
//   downloadCard   — offscreen canvas → PNG blob → <a download> + GA4 event
import { BRAND, SITE_ORIGIN } from "../site.config.js";

// D5 fixed micro-copy: every card ends with the disclaimer plus the site
// domain. The domain is derived from SITE_ORIGIN so a domain switch (main
// Spec §4 P5) propagates automatically — never hardcode it.
const DISCLAIMER_LINE = "Estimate for education — not medical advice.";
const DOMAIN_LINE = new URL(SITE_ORIGIN).host;

// Pure function: { title, rows: [{label, value}], footnote } → text lines.
// Row values are passed through verbatim (D5: range strings like
// "≈ 6.2% – 6.8%" must survive untouched); no numeric work happens here.
export function buildCardLines({ title, rows = [], footnote } = {}) {
  const lines = [title];
  for (const { label, value } of rows) {
    lines.push(`${label}: ${value}`);
  }
  if (footnote) {
    lines.push(footnote);
  }
  lines.push(DISCLAIMER_LINE);
  lines.push(DOMAIN_LINE);
  return lines;
}

// Palette mirrors scripts/generate-og-cover.mjs / the site theme.
const CARD = {
  width: 1200,
  height: 630,
  background: "#f4f0e5",
  ink: "#2f3e2f",
  muted: "#4a5a4a",
  serif: 'Georgia, "Times New Roman", serif',
};

// Draws the card onto the given canvas. Layout by position within `lines`
// (the buildCardLines contract): first line is the title, the last two are
// the fixed micro-footer, everything between is body copy.
export function drawCard(canvas, lines) {
  canvas.width = CARD.width;
  canvas.height = CARD.height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = CARD.background;
  ctx.fillRect(0, 0, CARD.width, CARD.height);
  ctx.strokeStyle = CARD.ink;
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, CARD.width - 12, CARD.height - 12);

  const left = 80;

  // Brand line (top).
  ctx.fillStyle = CARD.ink;
  ctx.font = `700 36px ${CARD.serif}`;
  ctx.fillText(BRAND, left, 96);

  // Title.
  const [title, ...rest] = lines;
  const body = rest.slice(0, -2);
  const footer = rest.slice(-2);
  ctx.font = `700 60px ${CARD.serif}`;
  ctx.fillText(title, left, 208);

  // Body rows / footnote.
  ctx.font = `400 40px ${CARD.serif}`;
  let y = 296;
  for (const line of body) {
    ctx.fillText(line, left, y);
    y += 64;
  }

  // Fixed micro-footer: disclaimer + domain.
  ctx.fillStyle = CARD.muted;
  ctx.font = `400 26px ${CARD.serif}`;
  ctx.fillText(footer[0], left, CARD.height - 96);
  ctx.fillText(footer[1], left, CARD.height - 56);
}

// Renders offscreen, downloads as PNG, then reports the GA4 event (D8) —
// silently skipped when gtag is absent (local dev / prerender).
export function downloadCard(lines, filename) {
  const canvas = document.createElement("canvas");
  drawCard(canvas, lines);
  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    if (typeof window.gtag === "function") {
      window.gtag("event", "share_card_download", { page: window.location.pathname });
    }
  }, "image/png");
}
