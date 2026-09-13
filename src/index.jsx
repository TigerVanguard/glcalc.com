import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/app.css";
import App from "./App.jsx";
import GlCalculatorPage from "./pages/GlCalculatorPage.jsx";
import GiLookupPage from "./pages/GiLookupPage.jsx";
import GmiCalculatorPage from "./pages/GmiCalculatorPage.jsx";
import A1cToEagPage from "./pages/A1cToEagPage.jsx";
import BloodSugarConverterPage from "./pages/BloodSugarConverterPage.jsx";
import GlucoseToA1cPage from "./pages/GlucoseToA1cPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";

// React 17: keep ReactDOM.render (NOT hydrate) — the prerendered snapshot is not
// guaranteed to match the runtime tree; render replaces it wholesale (Spec §0A-5).
const rootElement = document.getElementById("root");

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/glycemic-load-calculator" element={<GlCalculatorPage />} />
      <Route path="/glycemic-index-calculator" element={<GiLookupPage />} />
      <Route path="/gmi-calculator" element={<GmiCalculatorPage />} />
      <Route path="/a1c-to-eag-calculator" element={<A1cToEagPage />} />
      <Route path="/blood-sugar-converter" element={<BloodSugarConverterPage />} />
      <Route path="/glucose-to-a1c-estimator" element={<GlucoseToA1cPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  </BrowserRouter>,
  rootElement,
  () => {
    // Marker for scripts/prerender.mjs: the React tree has replaced the static
    // shell, so the DOM is safe to snapshot (the shell's H1 text can collide
    // with route H1 text, making text waits alone racy).
    rootElement.setAttribute("data-render-complete", "true");
  },
);
