import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, matchPath } from "react-router-dom";
import "./styles/fonts.css";
import "./styles/app.css";
import HomePage from "./pages/HomePage.jsx";
import GmiCalculatorPage from "./pages/GmiCalculatorPage.jsx";
import A1cToEagPage from "./pages/A1cToEagPage.jsx";
import BloodSugarConverterPage from "./pages/BloodSugarConverterPage.jsx";
import GlucoseToA1cPage from "./pages/GlucoseToA1cPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import SiteNav from "./features/common/SiteNav.jsx";
import HeadManager from "./seo/HeadManager.jsx";

// The only three pages that pull in src/data/gi.json (~280 KB, 4893 foods).
// They load from their own chunks so the other six pages never download or
// parse the dataset (perf spec PF-02, D5).
const SPLIT_PAGES = {
  "/glycemic-load-calculator": () => import("./pages/GlCalculatorPage.jsx"),
  "/glycemic-load-chart": () => import("./pages/GlChartPage.jsx"),
  "/glycemic-index-calculator": () => import("./pages/GiLookupPage.jsx"),
};

// Shown while a split page's chunk loads during client-side navigation (D7):
// the site header stays on screen, so the page is never blank.
function RouteFallback() {
  return (
    <div data-route-fallback="true">
      <SiteNav />
      <main className="app-shell">
        <p className="muted" role="status">
          Loading…
        </p>
      </main>
    </div>
  );
}

const loadedPathname = window.location.pathname;

// There is no error boundary: a chunk that fails to load would throw during
// render, and React 17 then unmounts the whole tree (blank page). The URL
// already points at the target route, so reload it to get its prerendered
// HTML; the never-settling promise keeps the fallback up in the meantime.
// Only reload when the failing route was reached by in-app navigation: if it
// is the path this document was loaded at, a reload would fail the same way
// again, forever.
function lazyPage(load) {
  return lazy(() =>
    load().catch(() => {
      if (window.location.pathname !== loadedPathname) window.location.reload();
      return new Promise(() => {});
    }),
  );
}

// React 17: keep ReactDOM.render (NOT hydrate) — the prerendered snapshot is not
// guaranteed to match the runtime tree; render replaces it wholesale (Spec §0A-5).
const rootElement = document.getElementById("root");

async function start() {
  // D6: a split page opened directly is awaited BEFORE the first render and
  // mounted as the resolved component. A lazy() element suspends on its first
  // render even when its module is already loaded, and legacy ReactDOM.render
  // would commit the Suspense fallback over the prerendered DOM. The resolved
  // component keeps serving that route afterwards, so navigating back to it
  // never shows the fallback. The other split pages stay lazy until visited
  // (no idle prefetch). matchPath must agree with <Routes> (trailing slash,
  // case-insensitive), or a URL the router accepts would first render lazy.
  const openedPath = Object.keys(SPLIT_PAGES).find((path) =>
    matchPath(path, window.location.pathname),
  );
  const openedPage = openedPath ? (await SPLIT_PAGES[openedPath]()).default : null;
  const splitPage = (path) => (path === openedPath ? openedPage : lazyPage(SPLIT_PAGES[path]));
  const GlCalculatorPage = splitPage("/glycemic-load-calculator");
  const GlChartPage = splitPage("/glycemic-load-chart");
  const GiLookupPage = splitPage("/glycemic-index-calculator");

  ReactDOM.render(
    <BrowserRouter>
      {/* Single integration point for per-route head tags (ticket 04): keyed on
          useLocation().pathname, covers all 8 routes without per-page wiring. */}
      <HeadManager />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/glycemic-load-calculator" element={<GlCalculatorPage />} />
          <Route path="/glycemic-load-chart" element={<GlChartPage />} />
          <Route path="/glycemic-index-calculator" element={<GiLookupPage />} />
          <Route path="/gmi-calculator" element={<GmiCalculatorPage />} />
          <Route path="/a1c-to-eag-calculator" element={<A1cToEagPage />} />
          <Route path="/blood-sugar-converter" element={<BloodSugarConverterPage />} />
          <Route path="/glucose-to-a1c-estimator" element={<GlucoseToA1cPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>,
    rootElement,
    () => {
      // Marker for scripts/prerender.mjs: the React tree has replaced the static
      // shell, so the DOM is safe to snapshot (the shell's H1 text can collide
      // with route H1 text, making text waits alone racy).
      rootElement.setAttribute("data-render-complete", "true");
    },
  );
}

// Async entry rather than top-level await, which Vite 5's default build
// target does not support.
start();
