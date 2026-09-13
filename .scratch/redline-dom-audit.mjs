// Redline audit (Spec v2.2 §9) — ticket 14 delivery evidence.
// Panel-level DOM assertions against dist/ prerendered HTML.
// 口径：红线 4（判定词）按 panel 级自查——交互结果面板内禁 normal/prediabetes/diabetes；
// 静态教育内容（如 a1c 页 ADA 参考区间表，Spec §5 原文「仅作教育展示」）豁免。
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "node-html-parser";

const dist = join(process.cwd(), "dist");
const verdicts = ["normal", "prediabetes", "diabetes"];
let failures = 0;

function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

function loadPage(rel) {
  return parse(readFileSync(join(dist, rel), "utf8"));
}

// ── 红线 4：panel 级判定词零命中（A1c/eAG/GMI 交互输出面板）──
const panels = [
  ["a1c-to-eag-calculator/index.html", ".a1c-calculator-panel"],
  ["glucose-to-a1c-estimator/index.html", ".estimator-panel"],
  ["gmi-calculator/index.html", ".gmi-panel"],
];
for (const [file, sel] of panels) {
  const root = loadPage(file);
  const nodes = root.querySelectorAll(sel);
  check(`R4 ${file} :: exactly one ${sel}`, nodes.length === 1, `found ${nodes.length}`);
  const text = (nodes[0]?.text || "").toLowerCase();
  for (const w of verdicts) {
    check(`R4 ${file} :: ${sel} contains no "${w}"`, !text.includes(w));
  }
}
// a1c 页 ADA 参考区间表：教育豁免区，但须为纯静态（无高亮/选中态钩子）
{
  const root = loadPage("a1c-to-eag-calculator/index.html");
  const table = root.querySelectorAll(".a1c-reference-table");
  check("R4 a1c ADA reference table exists once (educational, exempt)", table.length === 1);
  const html = table[0]?.innerHTML || "";
  check(
    "R4 ADA table has no highlight/selection hooks (aria-current / highlight class)",
    !/aria-current|highlight|active|selected/i.test(html)
  );
}
// estimator 面板只出区间卡，无单点百分比
{
  const root = loadPage("glucose-to-a1c-estimator/index.html");
  const panel = root.querySelector(".estimator-panel");
  check("R4 estimator panel prerenders no percentage value", !/\d+(\.\d+)?\s*%/.test(panel?.text || ""));
}

// ── 红线 5：反解式不得标 ADAG；全站无 Harvard/哈佛 ──
{
  const root = loadPage("glucose-to-a1c-estimator/index.html");
  const body = root.querySelector("body");
  const related = root.querySelector(".related-tools");
  const bodyHtml = body?.innerHTML || "";
  const relatedHtml = related?.innerHTML || "";
  const outside = bodyHtml.replace(relatedHtml, "");
  check(
    'R5 "ADAG formula" label absent outside related-tools on estimator page',
    !/ADAG formula/i.test(outside)
  );
  check(
    'R5 related-tools "ADAG formula" context links to forward-direction page',
    !relatedHtml.includes("ADAG formula") || relatedHtml.includes("/a1c-to-eag-calculator")
  );
}
const pages = [
  "index.html",
  "glycemic-load-calculator/index.html",
  "glycemic-index-calculator/index.html",
  "gmi-calculator/index.html",
  "a1c-to-eag-calculator/index.html",
  "blood-sugar-converter/index.html",
  "glucose-to-a1c-estimator/index.html",
  "about/index.html",
];
for (const p of pages) {
  const html = readFileSync(join(dist, p), "utf8");
  check(`R5 ${p} :: no "Harvard"/「哈佛」`, !/harvard|哈佛/i.test(html));
}
// DiOGenes 诚实口径（非权威源表述）
{
  const about = readFileSync(join(dist, "about/index.html"), "utf8");
  check('R5 /about carries honest DiOGenes copy ("category-level")', /category-level/i.test(about));
  check('R5 /about names Atkinson 2021 upgrade path', /Atkinson/.test(about));
}

console.log(failures === 0 ? "\n[redline-dom-audit] ALL PASS" : `\n[redline-dom-audit] ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
