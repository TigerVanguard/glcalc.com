# 01: GMI 对照表 + 按查询意图补 FAQ

**Spec**: `docs/2026-09-29-gmi-content-spec-v1.md` §2 D1~D8、§3 红线、§4 GC-01

**What to build:** 用户在 `/gmi-calculator` 上：已经有 GMI 数值的人，能从顶部链接跳到一张 30 行的 GMI 对照表，查到这个 GMI 对应的 CGM 平均血糖（mg/dL 与 mmol/L）；想知道「GMI 是什么」「GMI 怎么换算 A1C」「GMI 对应多少平均血糖」「多少算好」的人，能在 FAQ 里读到直接、诚实、不评判好坏的回答。计算器本身、标题、H1、描述都不变。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**执行要点：**
- `formulas.js` 新增 `meanGlucoseFromGmi`（精确反解、不舍入），现有函数不动。
- `src/data/gmiChart.js` 模块加载时生成 30 行（整数 ×10 生成 GMI 值），显示文本全部来自 display.js。
- 页面新增 `<section id="gmi-chart">`（面板之后、公式节之前）；intro 追加跳转链接。
- `gmiFaq.js` 追加 4 条，例子数字用公式计算后拼接；答案纯文本。
- sitemap-lastmod `/gmi-calculator` → 2026-09-29。

**Test plan:**（详见 Spec §4 GC-01）
- unit：反解 golden（5 个值）+ 30 行往返 + 7 个 golden 显示行 + FAQ 例子与表一致。
- verify-dist：30 行、7 个独立硬编码 golden 行、跳转锚点、节在 `.gmi-panel` 之外、红线负向扫描、4 个新问题进入 FAQPage JSON-LD。
- e2e（static 项目）：禁 JS 可见 30 行与三列表头；390×844 无横向溢出。
- 验收命令：`npm run check` 全绿；现有测试零修改。

- [ ] `meanGlucoseFromGmi` 与 `gmiChart` 单测通过
- [ ] 预渲染 GMI 页含 30 行对照表，golden 行齐全
- [ ] 4 条新 FAQ 可见且进入 JSON-LD（逐字一致）
- [ ] 红线负向扫描通过（无分档词、无目标数值）
- [ ] 手机视口无横向溢出
- [ ] 标题 / H1 / 描述 / `.gmi-panel` 零变化
- [ ] 零新增依赖；`npm run check` 全绿
