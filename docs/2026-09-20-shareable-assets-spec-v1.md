# GlucoMath 可传播资产执行 Spec v1.0（2026-09-20）

> **本文件自包含**：执行 agent 不需要读任何会话历史。与本文件冲突时，以 `docs/2026-09-12-execution-spec-v2.2.md`（主 Spec）的红线为最高优先级。
>
> **背景一句话**：外部 SEO 顾问（哥飞方法论）指出本站外链的正确打法不是发链接，而是把「计算结果」和「独家数据」包装成用户会自己传播、博主会主动引用的实物。本 Spec 把其中 **agent 可执行的代码工作** 拆成 6 张 ticket；**不可由 agent 执行的人工推广**（目录提交、竞品反查、Reddit）放在 §6 站长 Playbook，agent 不得尝试代做。

---

## §0 仓库实况（动手前必读）

- **栈**：Vite 5 + React 17 纯 CSR + 构建后 Playwright 预渲染（`scripts/prerender.mjs`）。**禁止**迁框架、禁止引入 SSR。
- **命令**：`npm run check` = unit(vitest) → build(vite build + prerender) → verify-dist → e2e(Playwright)。这是每张 ticket 的统一验收门。当前基线：unit 74/74、verify-dist 全 PASS、e2e 90/90，全绿。
- **现有 8 路由**（`scripts/prerender.mjs` 的 `ROUTES`）：`/`、`/glycemic-load-calculator`、`/glycemic-index-calculator`、`/gmi-calculator`、`/a1c-to-eag-calculator`、`/blood-sugar-converter`、`/glucose-to-a1c-estimator`、`/about`。
- **关键不变量**（改动会破坏现有断言，必须同步维护）：
  1. `verify-dist` 断言**每页** `.site-nav a[href]` 数量 `=== 8`（`SiteNav.jsx` 的 NAV_ITEMS）。
  2. `tests/e2e/prerender.spec.js` 断言每个路由能从首页**点击真实 `<a>`** 到达（工具页走 `.tool-cards a[href=...]`，/about 走单独选择器）。新路由必须补一条可点击路径 + 对应测试分支。
  3. 所有公式数值必须来自 `src/lib/formulas.js`（纯函数、返回未舍入原始值），显示层舍入必须走 `src/lib/display.js`。**任何组件不得自行计算或舍入。**
  4. 预渲染 context 拦截所有非 `127.0.0.1` 请求（`prerender.mjs`），外部脚本构建时不执行。
  5. 静态 SEO 内容必须禁 JS 可见（e2e static 项目 JS-off 断言）；交互功能（计算器、下载按钮）允许依赖 JS。
  6. `src/sitemap-lastmod.json` 是 sitemap lastmod 唯一来源；新增/实质修改页面必须更新对应条目为当日日期。
  7. `src/seo/pageSeo.js` 是每页 title/description/canonical/JSON-LD 唯一来源，由 `HeadManager.jsx` 注入并烤入预渲染 HTML。
- **任务纪律**（AGENTS.md）：每张 ticket 开工前在根 `tasks.md` 登记 `[~]`，完成后 `[x]` + 验证证据；同一时刻只允许一个 `[~]`；某张 ticket 修复循环 **5 次未过即暂停**，标 `[!]` 并请站长介入。
- **品牌**：`BRAND` / `SITE_ORIGIN` 常量来自 `src/site.config.js`（GlucoMath / https://glucomath.com）。任何新文案禁止出现 glcalc 变体。

## §1 目标与非目标

**目标**（对应哥飞被动外链方式 2「生成用户相关页面，用户传播」+ 方式 4「独家数据，用户只能来你的网页看」）：

1. 让 GMI / A1C / 换算的**计算结果离开屏幕**：一键下载成带品牌的分享卡片（PNG），用户可发到糖尿病社群/社交平台 → 结果图自带域名 = 被动外链入口。
2. 让 27 种食物 GL 数据成为**可被博主引用的独立资产**：一个专门的速查页（chart 页），带「如何引用」块和 CSV 下载 → 博主写文引用时链接指向本站。
3. 让 GMI 结果**可打印**（问诊场景）：打印样式即「PDF 报告」，零依赖。

**非目标**（agent 禁止尝试）：

- 不做目录站/导航站提交、不注册任何第三方平台账号（§6 站长手动）。
- 不做 Ahrefs 竞品反查（需要人工浏览器操作，§6）。
- 不发任何社区帖子/评论（§6）。
- 不做邮箱收集、不加第三方分享 SDK（AddThis 之类）、不加任何新的外部 `<script>`。
- 不改 6 个计算器的既有计算逻辑与医学措辞。

## §2 锁定决策（不得重开）

| # | 决策 | 理由 |
|---|---|---|
| D1 | 分享卡片用**原生 Canvas API** 绘制（1200×630），`canvas.toBlob` → `<a download>` 触发 PNG 下载。**零新依赖**（禁 html2canvas / dom-to-image） | 依赖最小化；卡片内容是结构化文本，Canvas 足够 |
| D2 | 「PDF 报告」= **打印样式表 + `window.print()`**。禁引入 jsPDF 等 PDF 库 | 浏览器"另存为 PDF"原生可用，零依赖零风险 |
| D3 | GL 速查页为**新路由 `/glycemic-load-chart`**。现有 `/glycemic-load-calculator` 页面的 27 行表格**原样保留、零改动**。新页是**扩展数据集**：每种食物给 50 g / 100 g / 典型份量三档 GL（现有表只有典型份量一档），另加引用块与 CSV 下载 | 目标词 "glycemic load chart" 与 "calculator" 意图不同；两页列结构不同、正文不同，不构成重复内容；不动旧页 = 不碰 ticket 12 的既有断言 |
| D4 | 导航保持 **8 项不变**（不把 chart 页加进 SiteNav）。chart 页入口：①首页 "What these tools help with" GL 段落加内链；②GL 计算器页表格节尾部加显式链接；③GL 与 GI 页的 RelatedTools 各加一条 | 避免改 `.site-nav === 8` 断言波及全站；三处内链足够爬虫发现与权重传递 |
| D5 | 医学红线延续主 Spec §9：卡片上的数值与措辞**必须与页面显示完全一致**；glucose→A1C 估算卡**只出区间**；禁任何诊断分档词（normal/prediabetes/diabetes）；每张卡片底部固定微字："Estimate for education — not medical advice. glucomath.com" | YMYL 红线在传播物上同样成立，卡片会脱离页面语境传播，风险更高 |
| D6 | 卡片/CSV 的数值一律取自 `formulas.js` + `display.js` 现有函数；卡片文案组装写成**纯函数**（输入结果对象 → 输出文本行数组），单测锁 golden values | 单一真源；纯函数可测 |
| D7 | CSV 由 `GL_STATIC_TABLE`（`src/data/glStaticTable.js`）客户端生成（Blob + download），**不落静态 CSV 文件** | 单一数据源，防止双份数据漂移 |
| D8 | 每个下载/打印按钮发一个 GA4 事件：`gtag('event', <name>, { page: location.pathname })`，事件名固定：`share_card_download` / `gl_csv_download` / `print_report`。`gtag` 不存在时静默跳过（本地/预渲染环境） | 度量传播功能使用率，为 §6 站长决策提供数据 |

## §3 红线（违反即 ticket 失败）

1. 主 Spec §9 八条红线全部继承（禁迁框架、禁 site:、禁诊断分档、禁 glcalc 变体、MIT 署名不动等）。
2. `npm run check` 必须全绿才算完成；**不得删除或放松任何现有断言**来让测试通过（因新路由需要**扩展**断言清单除外，如 verify-dist 的页面遍历列表）。
3. 不新增任何 npm 依赖、不加任何第三方 `<script>`。
4. 现有 8 页的静态 SEO 内容（禁 JS 可见部分）零回退。
5. 分享卡片是 JS-on 功能，但 chart 页的表格/引用块/正文必须禁 JS 可见（预渲染烤入）。
6. 不修改 `src/App.jsx` 主计算流程（分享按钮加在各工具页自己的结果组件层）。

## §4 Tickets（依赖序；BL-02/03/06 阻塞于 BL-01；BL-04/05 无阻塞可并行）

### BL-01 分享卡片基建

**What**：
- `src/lib/shareCard.js`：
  - `buildCardLines(spec)` 纯函数：输入 `{ title, rows: [{label, value}], footnote }`，输出规范化文本行数组（含 D5 固定微字与 `SITE_ORIGIN` 域名行）。不做任何数值计算。
  - `drawCard(canvas, lines)`：Canvas 绘制。1200×630，底色 `#f4f0e5`（现有 theme-color），深色文字，顶部品牌行（`BRAND`），布局简洁即可（参考 `scripts/generate-og-cover.mjs` 的现有画风）。
  - `downloadCard(lines, filename)`：离屏 canvas → `toBlob("image/png")` → 临时 `<a download>` 点击 → `URL.revokeObjectURL`；成功后发 `share_card_download` 事件（D8）。
- `src/features/common/ShareCardButton.jsx`：接收 `cardSpec`（或其工厂函数）与 `filename`，渲染 `secondary-button` 样式按钮 "Download result card"。无结果时不渲染（由调用方控制）。
**验收**：
- 新增 `tests/unit/share-card.test.js`：`buildCardLines` golden（含微字行、域名行、区间措辞透传）；不测 Canvas 绘制本身。
- `npm run check` 全绿（此 ticket 不接线任何页面，e2e 不变）。

### BL-02 GMI 页分享卡 + 打印钩子

**What**：在 GMI 页结果卡（`GmiCalculatorPage.jsx` 的结果区）有有效结果时渲染 ShareCardButton。卡片内容（全部取自页面已算好的显示值）：标题 "GMI Result"，行：Average glucose（含单位）、GMI %；脚注引 Bergenstal 2018（与页面现有引文一致）。文件名 `glucomath-gmi-result.png`。
**验收**：e2e app 项目新增测试：输入合法均值 → 断言按钮可见 → `page.waitForEvent('download')` 断言文件名；无结果时按钮不存在。`npm run check` 全绿。

### BL-03 A1C→eAG 页 + glucose→A1C 估算页分享卡

**What**：同 BL-02 模式。
- `/a1c-to-eag-calculator`：标题 "A1C to eAG"，行：A1C %、eAG mg/dL、eAG mmol/L；脚注 Nathan 2008（ADAG）。文件名 `glucomath-a1c-eag.png`。
- `/glucose-to-a1c-estimator`：标题 "Estimated A1C Range"，行：Average glucose（含单位）、A1C range（**必须原样使用页面的区间字符串**，D5）。文件名 `glucomath-a1c-estimate.png`。
**验收**：两页各一条 e2e download 测试 + 估算卡断言内容含区间连接符（与页面一致）且不含单点值措辞。`npm run check` 全绿。

### BL-04 `/glycemic-load-chart` 可引用速查页（本 Spec 最大 ticket）

**What**：
1. **数据**：`src/data/glStaticTable.js` 不动；新增 `src/data/glChartTable.js`：基于同一底层数据（`GL_STATIC_TABLE` 引用的食物 + `gi.json`），在模块加载时用 `formulas.gl` 计算每种食物 50 g / 100 g / 典型份量三档 GL + `glBand`（禁止硬编码数值）。
2. **页面** `src/pages/GlChartPage.jsx`：H1 "Glycemic Load Chart: 27 Common Foods"；正文结构：引言段（chart 与 calculator 的分工：查表 vs 算自己份量，链回 `/glycemic-load-calculator`）→ 27 行 × 三档 GL 大表（禁 JS 可见）→ band 判读说明（与 `formulas.glBand` 口径一致：≤10 Low / 10~20 Medium / ≥20 High）→ **"How to cite this table"块**（给出建议引用格式：站名 + 页面 URL + 数据出处 DiOGenes 类别级赋值声明 + 访问日期；明确欢迎转载引用并链接本页）→ CSV 下载按钮（D7，事件 `gl_csv_download`）→ 打印按钮（D2，事件 `print_report`）。数据诚实口径与 `/about` 一致：类别级赋值、非逐食物实测。
3. **SEO 接线**：`pageSeo.js` 新增条目（title 建议 `Glycemic Load Chart — GL of 27 Common Foods at Real Servings | ${BRAND}`；description 含 printable / CSV 卖点；JSON-LD：WebPage + `Dataset`（name/description/url/isBasedOn: DiOGenes、creator: Organization {BRAND}），FAQ 不强制）；`src/sitemap-lastmod.json` 加 `"/glycemic-load-chart": <当日>`。
4. **路由接线**：`src/index.jsx` 加 Route；`scripts/prerender.mjs` ROUTES 加行（label "Glycemic Load Chart"，h1 同上）。
5. **内链（D4）**：①首页 "What these tools help with" 第一段加一句带 `<Link to="/glycemic-load-chart">glycemic load chart</Link>` 的自然句子；②GL 计算器页表格节末尾加链接段（"need all foods at multiple serving sizes → chart"）；③GL 页与 GI 页 RelatedTools 各加一条指向 chart 页。
6. **测试接线**：verify-dist 页面遍历列表加新路由（H1/canonical/描述/nav===8 自动覆盖）；`prerender.spec.js` ROUTES 加行 + "home reaches" 补选择器分支（走首页正文 `<a href="/glycemic-load-chart">`）；e2e static 新增断言：JS-off 时表格 27 行、三档列头、cite 块可见。
**验收**：`npm run check` 全绿；`dist/glycemic-load-chart/index.html` 存在且含 27 `<tbody>` 行与 "How to cite"；sitemap 含新 URL；首页/GL/GI 三处内链在 dist 中可查得。

### BL-05 GMI 打印报告（可与 BL-04 并行）

**What**：GMI 页加 "Print report" 按钮（有结果时显示）：`onClick={() => { gtagSafe("print_report"); window.print(); }}`。新增打印样式（`@media print`，加在现有全局样式文件）：隐藏 `.site-header`、footer、表单区、RelatedTools；保留 H1、结果卡、公式引文、免责段；纸面顶部显示 `BRAND — glucomath.com`（可用 CSS `::before` 或打印专用元素）。chart 页（BL-04）的打印按钮复用同一套 `@media print` 规则（隐藏导航/页脚、保留表格）。
**验收**：e2e app 项目：stub `window.print`（`page.addInitScript`）断言点击后被调用；`npm run check` 全绿。打印视觉效果由站长人工抽查（登记 tasks.md 时注明）。

### BL-06 换算速查卡（最低优先级）

**What**：`/blood-sugar-converter` 页有有效换算结果时渲染 ShareCardButton：标题 "Blood Sugar Conversion"，行：mg/dL 值、mmol/L 值、换算规则行 "mmol/L = mg/dL ÷ 18.018"；文件名 `glucomath-conversion.png`。
**验收**：一条 e2e download 测试；`npm run check` 全绿。

## §5 测试计划增量汇总

| 层 | 新增 |
|---|---|
| unit | `share-card.test.js`（BL-01）；`gl-chart-table.test.js`（BL-04：三档 GL 与 `formulas.gl` 手算 golden 一致、band 口径一致、行数 === GL_STATIC_TABLE 行数） |
| verify-dist | 页面清单 + sitemap 断言覆盖 `/glycemic-load-chart`；Dataset JSON-LD 存在性断言（type === "Dataset"） |
| e2e static | chart 页 JS-off：27 行、三档列头、cite 块、H1 |
| e2e app | 4 个 download 测试（GMI/A1C/estimator/converter）+ 1 个 print stub 测试 + chart 页 CSV download 测试 |

## §6 站长手动 Playbook（agent 禁止执行，仅供站长照做）

> 以下需要真人账号、浏览器登录或社区身份，agent 不得代做、不得注册账号。完成情况由站长口头告知编排 agent 后登记 tasks.md。

1. **竞品外链反查**（一恒方法）：用 Ahrefs 免费 backlink checker（无需登录）依次查 `a1c-calculator.net`、`glycemicloadcalculator.com`、`glycify.app`；把它们获得外链的博客/论坛/目录逐条记入表格；对每个来源页再看评论区里其他站的链接（链轮挖掘）。产出：可提交渠道清单。
2. **目录/导航站提交**：Product Hunt、AlternativeTo、Toolify 等 + liusha.com/backlinks 免费资源列表，每站提交一条（用新做好的 chart 页或首页作为提交 URL）。
3. **Reddit 自然参与**：r/diabetes、r/diabetes_t1、r/nutrition；只回答真实问题（单位换算、GMI 含义），链接只放帖末且仅当直接相关；每周固定几条，不硬广。
4. **PBN 避坑**（哥飞红线）：不买/不换批量评论外链；不在无内容纯攒链站留链接；将来做站群时每站必须有真实价值与流量。
5. **传播效果观察**：GA4 看 `share_card_download` / `gl_csv_download` / `print_report` 事件量；GSC 看 chart 页的展示与外链报告（Links 报告，禁 site:）。

## §7 交付与登记

- 每张 ticket 完成 = `npm run check` 全绿 + 该票专属验收断言通过 + `tasks.md` 登记证据（命令输出摘要、commit hash）。
- 全部完成后：更新 `docs/` 交付说明（新增文件清单 + 新路由说明），并提醒站长把 `/glycemic-load-chart` 用 GSC URL 检查工具请求编入索引。
