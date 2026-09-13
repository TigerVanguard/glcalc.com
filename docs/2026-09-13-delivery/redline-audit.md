# Spec §9 八条红线自查表（ticket 14 交付）

日期：2026-09-13 ｜ 审计对象：`dist/`（`npm run check` 同一次构建产物，commit 6b9199e + 无未提交代码改动）
执行环境：Windows PowerShell ｜ DOM 断言脚本：`.scratch/redline-dom-audit.mjs`（node-html-parser，与 verify-dist 同解析器）

**判定词红线（红线 4）自查范围口径**：按 Spec §5 原文——「ADA 参考区间仅作教育展示，**禁止对用户输入值输出 normal/prediabetes/diabetes 判定**」（§5 a1c-to-eag 行）与 D4「A1c 相关输出禁止落诊断分档」。即自查在 **panel 级**（交互结果面板 `.a1c-calculator-panel` / `.estimator-panel` / `.gmi-panel` 内零判定词）；**静态教育内容豁免**（a1c 页 ADA 参考区间表允许出现分档词，但须纯静态、无高亮/选中态钩子，不得随用户输入变化——e2e a1c.spec.js 有输入前后表 innerHTML 逐字节相等断言）。

| # | 红线原文（§9 逐字） | 自查方法 | 证据输出 | 结论 |
|---|---|---|---|---|
| 1 | 禁迁移 Next/Astro/重写应用 | `rg -in "next\|astro\|nuxt\|sveltejs" package.json`；对照 git log 确认无重写 | 零命中（rg exit=1）；依赖仍为 react 17.0.1 + vite 5.4.8 + react-router-dom 6；13 个 commit 全部为增量改造，`App.jsx` 主流程保留（仅迁路由），删除的 `App.js` 是 Spec §0A-4 认定的死代码 | ✅ PASS |
| 2 | 禁 `site:` 做任何验收 | `rg -n "site:" scripts tests playwright.config.js package.json` | 零命中（exit=1）。验收链 = `npm run check`（unit → build → verify-dist → e2e），上线后口径 = GSC 报告（T6，ticket 17）；全程无 `site:` 算子 | ✅ PASS |
| 3 | 禁字数/Title 长度硬阈值与注水内容 | `rg -n "(title\|description)[^\n]*\.length\s*[<>]" scripts/verify-dist.mjs tests` | 零命中（exit=1）。verify-dist T3-①② 断言 title/description **逐字等于 §5B.1 定稿文案**（verbatim equals），非长度阈值；页面内容逐页对照 §5/§5A 规格实现，无注水段落 | ✅ PASS |
| 4 | 禁对用户输入的 A1c/eAG/GMI 值输出诊断判定 | `node .scratch/redline-dom-audit.mjs`（panel 级 DOM 断言）+ verify-dist T3-④ D4 行 + e2e a1c.spec.js D4 用例 | 3 个交互面板各恰 1 个、面板文本内 normal/prediabetes/diabetes 全部零命中；estimator 面板无预渲染百分比（只出区间卡）；ADA 参考区间表恰 1 个、无 aria-current/highlight/active/selected 钩子（教育豁免区静态性成立）；脚本输出 `[redline-dom-audit] ALL PASS`（27/27） | ✅ PASS |
| 5 | 禁把反解式标注为 ADAG、禁把 DiOGenes 写成权威源或写「哈佛」 | 同上 DOM 脚本：8 页逐页 `Harvard\|哈佛` 零命中；estimator 页 body 剔除 related-tools 容器后 "ADAG formula" 零命中、容器内该串仅指向正向式页面链接；/about 含 "category-level" 诚实口径 + Atkinson 2021 升级路径 | 全部 PASS（见脚本输出 R5 段 10 条）；verify-dist T3-⑨ 同口径双保险（check-output.txt 内 8 页 `no "Harvard"` 全 PASS） | ✅ PASS |
| 6 | 禁 glcalc 品牌变体 | `rg -n "BRAND\|SITE_ORIGIN" src/site.config.js`；verify-dist ⑩（全产物 glcalc.vercel.app 零命中扫描） | 品牌收敛为单一常量 `BRAND = VITE_BRAND \|\| "GL Calc"`、`SITE_ORIGIN = VITE_SITE_ORIGIN \|\| "https://glcalc.vercel.app"`——P5 前沿用现部署域与现品牌名属 Spec §4 P5 设计（域名购买阻塞于 P0），**未新造任何 glcalc 变体品牌**（无 glcalcpro/glcalc2 之类）；换名只改环境变量。verify-dist ⑩ 零命中扫描已就位，P5 后启用（当前输出 `SKIPPED (P5 前)`） | ✅ PASS（⑩ 按 Spec 于 P5 启用） |
| 7 | 禁把哥飞 KD/linkBudget 或任何单一口径数字标注为「已验证」 | `rg -in "linkBudget\|哥飞\|已验证" dist --glob "*.html"` | 零命中（exit=1）——站点产物不含任何选词口径数字。交付文档侧：`delivery-report.md` §3 声明将全部搜索量数字标注为「2026-09 快照，未重验」，未出现「已验证」标签 | ✅ PASS |
| 8 | 禁删除上游 LICENSE 或遗漏 MIT 署名 | `git log --oneline --diff-filter=D -- LICENSE`（查删除历史）；`rg -n "Assaf Morami" LICENSE README.md`；`rg -c "Assaf Morami\|MIT License" dist/about/index.html` | LICENSE 无任何删除提交（diff-filter=D 输出为空）且首行版权 `Copyright (c) 2018 Assaf Morami` 在位；README 首行含上游署名 + LICENSE 指引；dist/about 页含 MIT 署名（rg 计数 ≥1）；verify-dist T3-⑨ 另有 4 条 /about MIT/Assaf Morami/上游仓库链接正向断言全 PASS | ✅ PASS |

## 结论

八条红线全部自查通过。DOM 级证据脚本保留于 `.scratch/redline-dom-audit.mjs`（可重跑：`node .scratch/redline-dom-audit.mjs`，exit 0 = 全过）；机器可重放的完整产物断言见 `docs/2026-09-13-delivery/verify-dist-output.txt`。
