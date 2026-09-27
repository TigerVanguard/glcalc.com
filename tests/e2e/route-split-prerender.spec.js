// Direct-open no-flash e2e (static project, perf spec PF-02 / D6).
//
// FILENAME NOTE: playwright.config.js routes the static project by
// testMatch /(prerender|seo)\.spec\.js/ — this file deliberately ends in
// "prerender.spec.js" so it runs against the built dist/ without touching the
// config. Unlike prerender.spec.js, JavaScript is ENABLED here: the contract
// is about what the app code does to the prerendered DOM.
//
// Contract under test: opening a split page directly (/glycemic-load-
// calculator, /glycemic-index-calculator, /glycemic-load-chart) awaits the
// page chunk before ReactDOM.render, so from the moment the prerendered <h1>
// is parsed until React's first render has committed, #root never lacks an
// <h1> and the Suspense fallback ([data-route-fallback]) never enters the DOM.
//
// How the window is observed (an init script, before any page script runs):
// - A MutationObserver on the whole document re-inspects #root after every
//   batch of mutations. Callbacks run at the microtask checkpoint that follows
//   each task, before the browser can paint, so every state that could ever
//   reach the screen is inspected. React's own container swap (clear + append
//   inside one ReactDOM.render call) is a single batch and is correctly NOT a
//   flash; a fallback commit followed by a later retry is two batches.
// - Fallback detection also scans every added node, so even a fallback that
//   was inserted and removed within one task is caught.
// - The check arms when #root first holds an <h1> (parser-inserted) and, at
//   the latest, on readystatechange → "interactive", which fires after
//   parsing and before any deferred/module script executes.
// - "Render complete" cannot be read from data-render-complete="true": the
//   prerender snapshot already carries it. Two signals are required instead:
//   (1) a MutationObserver "attributes" record for data-render-complete on
//   #root — only the ReactDOM.render callback's setAttribute produces one
//   (the parser never emits attribute records; per the DOM spec a same-value
//   setAttribute still queues a record); and (2) #root's <h1> is no longer
//   the parser-created node (legacy render replaces the container's children
//   wholesale). Together they prove the window spans React's commit.

import { test, expect } from "@playwright/test";

const SPLIT_ROUTES = [
  { path: "/glycemic-load-calculator", h1: "Glycemic Load Calculator" },
  { path: "/glycemic-index-calculator", h1: "Glycemic Index Calculator" },
  { path: "/glycemic-load-chart", h1: "Glycemic Load Chart: 27 Common Foods" },
];

function installRenderProbe() {
  const probe = {
    armed: false,
    armedReadyState: null,
    initialH1Text: null,
    renderCallbackFired: false,
    h1Replaced: false,
    sawNoH1: false,
    sawFallback: false,
    h1Texts: [],
    states: [],
  };
  let parsedH1 = null;
  window.__routeSplitProbe = probe;

  const containsFallback = (node) =>
    node.nodeType === Node.ELEMENT_NODE &&
    (node.matches("[data-route-fallback]") || node.querySelector("[data-route-fallback]") !== null);

  function inspect(records) {
    const root = document.getElementById("root");
    for (const record of records) {
      if (record.type === "attributes" && record.target === root) {
        probe.renderCallbackFired = true;
      }
      if ([...record.addedNodes].some(containsFallback)) {
        probe.sawFallback = true;
      }
    }
    if (!root) return;
    if (containsFallback(root)) probe.sawFallback = true;

    const h1 = root.querySelector("h1");
    if (!probe.armed) {
      if (!h1) return;
      probe.armed = true;
      probe.armedReadyState = document.readyState;
      probe.initialH1Text = h1.textContent.trim();
      parsedH1 = h1;
    }
    probe.states.push(`${document.readyState}:${h1 ? "h1" : "NO-H1"}`);
    if (!h1) {
      probe.sawNoH1 = true;
      return;
    }
    const text = h1.textContent.trim();
    if (!probe.h1Texts.includes(text)) probe.h1Texts.push(text);
    if (h1 !== parsedH1) probe.h1Replaced = true;
  }

  new MutationObserver(inspect).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-render-complete"],
  });
  document.addEventListener("readystatechange", () => inspect([]));
}

test.use({ javaScriptEnabled: true });

test.beforeEach(async ({ page }) => {
  // Hermetic, same policy as scripts/prerender.mjs: only the local dist/
  // server; the analytics hosts in <head> are aborted.
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  await page.addInitScript(installRenderProbe);
});

for (const { path, h1 } of SPLIT_ROUTES) {
  test(`direct open of ${path} keeps the prerendered H1 until React renders, no fallback`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect
      .poll(
        () =>
          page.evaluate(
            () => window.__routeSplitProbe.renderCallbackFired && window.__routeSplitProbe.h1Replaced,
          ),
        { message: "React's first render committed over the prerendered DOM", timeout: 15000 },
      )
      .toBe(true);

    const probe = await page.evaluate(() => window.__routeSplitProbe);
    const trace = `armed at readyState "${probe.armedReadyState}"; observed states: ${probe.states.join(" → ")}`;
    expect(probe.armed, "prerendered <h1> observed").toBe(true);
    expect(probe.initialH1Text).toBe(h1);
    expect(probe.renderCallbackFired, trace).toBe(true);
    expect(probe.h1Replaced, trace).toBe(true);
    expect(probe.sawNoH1, `#root lost its <h1> — ${trace}`).toBe(false);
    expect(probe.sawFallback, `Suspense fallback entered the DOM — ${trace}`).toBe(false);
    expect(probe.h1Texts).toEqual([h1]);
  });
}
