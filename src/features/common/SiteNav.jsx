import React from "react";
import { NavLink } from "react-router-dom";
import { BRAND } from "../../site.config.js";

// Site-wide header navigation (ticket 06, Spec §5B.3-1): Home + 6 tools +
// About, exactly 8 items, rendered identically on all 8 pages so that any
// crawled page can discover the whole site. NavLink renders a real <a href>
// (verify-dist asserts `.site-nav a[href]` count === 8 per page).
const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/glycemic-load-calculator", label: "Glycemic Load" },
  { href: "/glycemic-index-calculator", label: "Glycemic Index" },
  { href: "/gmi-calculator", label: "GMI" },
  { href: "/a1c-to-eag-calculator", label: "A1C to eAG" },
  { href: "/blood-sugar-converter", label: "Unit Converter" },
  { href: "/glucose-to-a1c-estimator", label: "Glucose to A1C" },
  { href: "/about", label: "About" },
];

export default function SiteNav() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <span className="site-header__brand">{BRAND}</span>
        <nav className="site-nav" aria-label="Site">
          {NAV_ITEMS.map(({ href, label }) => (
            <NavLink key={href} to={href} end={href === "/"}>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
