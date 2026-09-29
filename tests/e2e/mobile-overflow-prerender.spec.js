// Mobile horizontal overflow e2e (static project, content-ux batch CU-04).
//
// FILENAME NOTE: playwright.config.js routes the static project by
// testMatch /(prerender|seo)\.spec\.js/ — this file ends in
// "prerender.spec.js" so it runs against the built dist/ without touching the
// config, and does not match the app project's pattern.
//
// All 9 pages at 390×844, 360×740 and 320×568, JavaScript off (what crawlers get) and
// on (measured after React's first render has committed):
// - the page never scrolls sideways (documentElement.scrollWidth <= innerWidth);
// - every table frame (.table-scroll) is a focusable, named region —
//   tabindex="0", role="region", non-empty aria-label (axe rule
//   scrollable-region-focusable) — every table with more than two columns
//   sits in one, and nothing else on the page can scroll sideways;
// - a keyboard user can Tab to each frame and scroll it with the arrow keys
//   until the table's last column is fully in view: the table keeps its full
//   width inside the frame instead of being squeezed or cut off.

import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/glycemic-load-calculator",
  "/glycemic-load-chart",
  "/glycemic-index-calculator",
  "/gmi-calculator",
  "/a1c-to-eag-calculator",
  "/blood-sugar-converter",
  "/glucose-to-a1c-estimator",
  "/about",
];
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 360, height: 740 },
  { width: 320, height: 568 },
];
// Pages whose table frame must really scroll at every phone size: these
// tables are 385–694 px wide against 252–322 px of panel.
const WIDE_TABLE_ROUTES = ["/glycemic-load-calculator", "/glycemic-load-chart", "/glycemic-index-calculator"];
const FRAMED_ROUTES = [...WIDE_TABLE_ROUTES, "/gmi-calculator", "/glucose-to-a1c-estimator"];
// Chromium scrolls a focused box 40 px per arrow key press.
const ARROW_STEP_PX = 40;

// The prerendered snapshot already carries data-render-complete="true", so
// only an attribute mutation on #root (the setAttribute in the
// ReactDOM.render callback) proves React has committed over the snapshot.
function installRenderProbe() {
  window.__renderCommitted = false;
  new MutationObserver((records) => {
    if (records.some((record) => record.target.id === "root")) {
      window.__renderCommitted = true;
    }
  }).observe(document, { attributes: true, subtree: true, attributeFilter: ["data-render-complete"] });
}

async function open(page, path, javaScriptEnabled) {
  await page.goto(path);
  if (javaScriptEnabled) {
    await page.waitForFunction(() => window.__renderCommitted === true);
  }
  await page.evaluate(() => document.fonts.ready);
}

// Text boxes of the first and last column (header + every body row) — the
// content that must never be cut off, independent of cell padding.
function columnTextEdges(frame) {
  return frame.evaluate((el) => {
    const edges = (cells) =>
      cells.map((cell) => {
        const range = document.createRange();
        range.selectNodeContents(cell);
        const rect = range.getBoundingClientRect();
        return { text: cell.textContent.trim(), left: rect.left, right: rect.right };
      });
    const rows = [...el.querySelectorAll("table tr")];
    const box = el.getBoundingClientRect();
    return {
      frameLeft: box.left + el.clientLeft,
      frameRight: box.left + el.clientLeft + el.clientWidth,
      first: edges(rows.map((row) => row.firstElementChild)),
      last: edges(rows.map((row) => row.lastElementChild)),
    };
  });
}

function expectInside(cells, { frameLeft, frameRight }, where) {
  for (const cell of cells) {
    expect(cell.left, `${where}: "${cell.text}" starts inside the frame`).toBeGreaterThanOrEqual(frameLeft - 0.5);
    expect(cell.right, `${where}: "${cell.text}" ends inside the frame`).toBeLessThanOrEqual(frameRight + 0.5);
  }
}

for (const javaScriptEnabled of [false, true]) {
  test.describe(`JavaScript ${javaScriptEnabled ? "on" : "off"}`, () => {
    test.use({ javaScriptEnabled });

    test.beforeEach(async ({ page }) => {
      // Hermetic, same policy as scripts/prerender.mjs: only the local dist/
      // server; the analytics hosts in <head> are aborted.
      await page.route("**/*", (route) =>
        new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
      );
      if (javaScriptEnabled) {
        await page.addInitScript(installRenderProbe);
      }
    });

    for (const viewport of VIEWPORTS) {
      test.describe(`at ${viewport.width}×${viewport.height}`, () => {
        test.use({ viewport });

        for (const path of ROUTES) {
          test(`${path} never scrolls sideways`, async ({ page }) => {
            await open(page, path, javaScriptEnabled);
            const metrics = await page.evaluate(() => ({
              innerWidth: window.innerWidth,
              scrollWidth: document.documentElement.scrollWidth,
            }));
            expect(metrics.innerWidth).toBe(viewport.width);
            expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
          });
        }

        test("every table frame is a focusable, named region, and nothing else scrolls sideways", async ({
          page,
        }) => {
          for (const path of ROUTES) {
            await open(page, path, javaScriptEnabled);
            const report = await page.evaluate(() => ({
              frames: [...document.querySelectorAll(".table-scroll")].map((el) => ({
                tabindex: el.getAttribute("tabindex"),
                role: el.getAttribute("role"),
                label: el.getAttribute("aria-label"),
                overflowX: getComputedStyle(el).overflowX,
                tables: el.querySelectorAll("table").length,
              })),
              unframedWideTables: [...document.querySelectorAll("table")]
                .filter((table) => table.querySelectorAll("thead th").length > 2 && !table.closest(".table-scroll"))
                .map((table) => table.className || "(no class)"),
              otherSideScrollers: [...document.body.querySelectorAll("*")]
                .filter((el) => {
                  const { overflowX } = getComputedStyle(el);
                  return (
                    (overflowX === "auto" || overflowX === "scroll") &&
                    el.scrollWidth > el.clientWidth &&
                    !el.classList.contains("table-scroll")
                  );
                })
                .map((el) => el.outerHTML.slice(0, 80)),
            }));

            expect(report.frames, `${path}: table frames`).toHaveLength(FRAMED_ROUTES.includes(path) ? 1 : 0);
            for (const frame of report.frames) {
              expect(frame.tabindex, `${path}: frame tabindex`).toBe("0");
              expect(frame.role, `${path}: frame role`).toBe("region");
              expect((frame.label ?? "").trim(), `${path}: frame aria-label`).not.toBe("");
              expect(["auto", "scroll"], `${path}: frame overflow-x`).toContain(frame.overflowX);
              expect(frame.tables, `${path}: tables per frame`).toBe(1);
            }
            expect(report.unframedWideTables, `${path}: tables over two columns outside a frame`).toEqual([]);
            expect(report.otherSideScrollers, `${path}: other sideways-scrollable boxes`).toEqual([]);
          }
        });

        test("Tab reaches each table frame and the arrow keys scroll it to the last column", async ({
          page,
        }) => {
          for (const path of FRAMED_ROUTES) {
            await open(page, path, javaScriptEnabled);
            const frame = page.locator(".table-scroll");
            await expect(frame, `${path}: one table frame`).toHaveCount(1);

            let reached = false;
            for (let presses = 0; presses < 60 && !reached; presses += 1) {
              await page.keyboard.press("Tab");
              reached = await frame.evaluate((el) => el === document.activeElement);
            }
            expect(reached, `${path}: the frame is in the Tab order`).toBe(true);

            const size = await frame.evaluate((el) => ({
              clientWidth: el.clientWidth,
              scrollWidth: el.scrollWidth,
              clientHeight: el.clientHeight,
              scrollHeight: el.scrollHeight,
              tableWidth: el.querySelector("table").getBoundingClientRect().width,
            }));
            expect(size.scrollHeight, `${path}: no vertical clipping`).toBeLessThanOrEqual(size.clientHeight);
            expect(size.scrollWidth, `${path}: the whole table is scrollable into view`).toBeGreaterThanOrEqual(
              Math.floor(size.tableWidth),
            );
            if (WIDE_TABLE_ROUTES.includes(path)) {
              expect(size.scrollWidth, `${path}: the wide table keeps its width and scrolls`).toBeGreaterThan(
                size.clientWidth,
              );
            }

            const start = await columnTextEdges(frame);
            expectInside(start.first, start, `${path} before scrolling`);

            const maxScroll = size.scrollWidth - size.clientWidth;
            for (let i = 0; i <= Math.ceil(maxScroll / ARROW_STEP_PX); i += 1) {
              await page.keyboard.press("ArrowRight");
            }
            await expect
              .poll(() => frame.evaluate((el) => el.scrollLeft), { message: `${path}: scrolled to the end` })
              .toBe(maxScroll);
            const end = await columnTextEdges(frame);
            expectInside(end.last, end, `${path} scrolled to the end`);
          }
        });
      });
    }
  });
}
