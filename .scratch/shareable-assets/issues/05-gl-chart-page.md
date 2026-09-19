# 05: /glycemic-load-chart 可引用速查页（全接线，不含打印按钮）

**Spec**: `docs/2026-09-20-shareable-assets-spec-v1.md` §4 BL-04（锁定决策 D3/D4/D7 适用）。打印按钮不在本票（见 06）。

**What to build:** 站点新增第 9 个预渲染页面 `/glycemic-load-chart`：禁 JS 也完整可读的「27 种常见食物 GL 速查表」，每种食物给 50 g / 100 g / 典型份量三档 GL 与 band；带「How to cite this table」引用块（欢迎引用+建议格式+数据诚实口径）与 CSV 下载按钮（客户端从单一数据源生成，事件 `gl_csv_download`）。页面从首页正文、GL 计算器页表格节、GL/GI 两页 RelatedTools 可达；现有 `/glycemic-load-calculator` 的 27 行表格零改动。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**执行要点**（细节以 Spec BL-04 六个小节为准）：
- 三档 GL 在模块加载时用 formulas 层现有纯函数计算，禁止硬编码数值（D6）。
- SEO 接线：pageSeo 新条目（title/description/canonical + WebPage + Dataset JSON-LD）、sitemap-lastmod 新键（当日日期）。
- 路由接线：SPA Route + prerender ROUTES 行。导航 SiteNav **保持 8 项不动**（D4）。
- 内链三处：首页 GL 段落、GL 页表格节尾、GL/GI RelatedTools 各一条。
- 数据口径：类别级赋值声明与 /about 一致；band 阈值与 formulas.glBand 一致。

**Test plan:**
- unit：新增 chart 数据模块测试——行数 === 现有 GL 表行数（27）；抽 3 行三档 GL 与 formulas.gl 手算 golden 一致；band 口径一致。
- verify-dist：页面遍历清单加新路由（H1/canonical/nav===8 自动覆盖）；新增 Dataset JSON-LD 存在性断言；sitemap 含新 URL。
- e2e static：JS-off 断言 27 行、三档列头、"How to cite" 块、H1。
- e2e app：CSV download 测试（`page.waitForEvent('download')`）；"home reaches /glycemic-load-chart by clicking a real link" 补进 prerender.spec 路由清单（选择器走首页正文链接）。
- 既有 8 页所有断言零回退。
- 验收命令：`npm run check` 全绿 + `dist/glycemic-load-chart/index.html` 存在。

- [ ] dist 新页存在：27 行、三档列头、cite 块（禁 JS 可见）
- [ ] Dataset JSON-LD + canonical + sitemap 断言通过
- [ ] 三处内链在 dist 可查得，home-reaches 测试通过
- [ ] CSV download e2e 通过
- [ ] SiteNav 仍为 8 项，既有 8 页断言零回退
- [ ] `npm run check` 全绿
