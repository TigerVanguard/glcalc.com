# GlucoMath 内容与体验批次执行 Spec v1.0（2026-09-29）

> **本文件自包含**：执行 agent 不需要读会话历史。与本文件冲突时，以 `docs/2026-09-12-execution-spec-v2.2.md`（主 Spec）§9 红线为最高优先级。
>
> **范围**：站长 2026-09-29 选定的 5 项，拆为 CU-01~05 五张 ticket（执行子代理 + 独立验收子代理），外加 CU-06 部署核对（编排者）。**按编号串行执行**，后一张以前一张提交后的 HEAD 为基线。

---

## §0 背景数据

- GSC（2026-09-14 ~ 09-23，`.gsc-export/2026-09-25-glucomath/queries.tsv`）：单位换算词簇 145 个查询、212 次展示，占已列出展示的 62%，加权排名 71.6。其中大量是具体数值查询：`180 mg/dl to mmol/l`、`140 mg/dl to mmol/l`、`70 mg dl to mmol/l`、`100 mg/dl to mmol/l`、`120 mg/dl to mmol/l`、`200 mg/dl to mmol/l`、`300 mg dl to mmol l`、`600 mg dl to mmol l`、`60 mg/dl to mmol/l`、`130 mg dl to mmol l`、`160 mg dl to mmol l`、`11 mmol l to mg dl` 等。换算页现有对照表只有 70、100、126、140、180、200 六个值。
- 估算页相关查询：`160 glucose to a1c`、`150 average glucose to a1c`、`131 / 134 / 142 / 143 glucose to a1c`、`117 average glucose to a1c`。
- 2026-09-27 PF-02 验收发现：390 px 视口下 `/glycemic-load-calculator`、`/glycemic-index-calculator`、`/glycemic-load-chart` 页宽分别为 597 / 420 / 728 px（横向溢出，改动前即存在）。
- Cloudflare Web Analytics 中有约 60 次（1:10 抽样折算）来自 `127.0.0.1` 的页面加载，是本机跑 e2e 时加载了统计脚本；GA4 中也有对应的 `(not set)` 噪音。
- 根目录 `AGENTS.md` 最后修改于 2026-09-12，内容停留在重构开工前（详见 CU-05）。

## §1 仓库实况（动手前必读）

- 栈：Vite 5 + React 17 CSR + 构建后 Playwright 预渲染（`scripts/prerender.mjs`，9 个路由）。`src/index.jsx` 用 `ReactDOM.render`；三个依赖 `src/data/gi.json` 的页面（GL 计算器、GI 查询、GL 速查）在首次渲染前先 await 模块。
- 统一验收门：`npm run check` = unit → build(+prerender) → verify-dist → e2e。本批开始时基线：unit 99、verify-dist 721 PASS、e2e 122，全绿。
- Playwright 两个项目共用 `playwright.config.js`：`static`（对 dist 静态服务）匹配 `/(prerender|seo)\.spec\.js/`；`app`（对 dev server）匹配 `/(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/`。新测试文件名必须被对应项目匹配。
- 公式只能来自 `src/lib/formulas.js`（纯函数、不舍入）：`mgdlToMmol` / `mmolToMgdl`（18.018）、`a1cRange(mgdl)`（返回区间对象）。显示只能用 `src/lib/display.js`：`formatMgdl`（整数）、`formatMmol`（1 位小数）、`formatA1cRange`（`≈ X.X% – Y.Y%`）。
- `verify-dist` 对每页 meta description 与若干 golden 值做**独立硬编码**的断言（例如换算页 6 个现有对照对）。
- 全局样式：`src/styles/fonts.css` + `src/styles/app.css`。`src/index.css` 是零引用死文件。
- 任务纪律：执行子代理不 commit、不改 `tasks.md`；单个 ticket 循环 5 次未过即暂停请站长介入。

## §2 各 ticket 锁定决策

### CU-01 测试时屏蔽统计脚本

- 只改 `playwright.config.js`：在顶层 `use.launchOptions.args` 加 Chromium 参数 `--host-resolver-rules`，把以下主机解析为 `~NOTFOUND`：`www.googletagmanager.com`、`googletagmanager.com`、`*.googletagmanager.com`、`www.google-analytics.com`、`google-analytics.com`、`*.google-analytics.com`、`static.cloudflareinsights.com`、`cloudflareinsights.com`、`*.cloudflareinsights.com`。两个项目都生效。
- （2026-09-29 执行中追加，编排者决定）同时加 `--no-proxy-server`：`--host-resolver-rules` 只作用于 Chromium 自己的 DNS 解析，开启系统代理时会被绕过（执行方已用本机 7897 端口代理实测复现）。测试只访问本机服务器，不需要代理。另加 `--no-system-proxy-config-service`：默认的 `chrome-headless-shell` 不识别 `--no-proxy-server`，需靠它忽略系统代理（执行方已对两种二进制实测）。
- **生产代码零改动**：`index.html` 里的 GA4 与 Cloudflare 片段保持无条件加载（verify-dist 既有断言要求 GA4 无 hostname 条件）。
- 现有测试零修改。

### CU-02 换算页对照表扩充

- `src/pages/BloodSugarConverterPage.jsx`：
  - 正向表 mg/dL → mmol/L 的取值改为以下 29 个：`40, 50, 60, 70, 80, 90, 100, 110, 120, 126, 130, 140, 150, 160, 170, 180, 190, 200, 220, 240, 250, 270, 300, 350, 400, 450, 500, 550, 600`（包含现有 6 个值，verify-dist 既有的 6 个对照对必须仍然通过）。
  - 新增反向表 mmol/L → mg/dL，取值为以下 27 个：`2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 18.0, 20.0, 25.0, 30.0`。mg/dL 用 `formatMgdl(mmolToMgdl(x))`，左列用 `formatMmol(x)`。
  - 两张表都在模块加载时由 formulas + display 生成，**禁止手写数值**；复用 `conversion-table` class；反向表紧跟正向表，用一个 H3 标题（如 `mmol/L to mg/dL`），正向表标题改为 `mg/dL to mmol/L` 形式亦可，但须保留「两个单位的常见值」这一语义。
  - 表下现有说明段（「表只帮你读懂单位，不解读或评价读数」）保留，对两张表都适用。
  - 在 intro 或计算器之后加一个跳转锚点链接（如 `Jump to the conversion charts`），指向对照表所在区块的 id。
- 标题、H1、meta description 不改；`src/sitemap-lastmod.json` 中 `/blood-sugar-converter` 改为执行当天日期。
- golden 值（已用独立脚本验算）：正向 40→2.2、60→3.3、126→7.0、250→13.9、300→16.7、600→33.3；反向 2.0→36、4.0→72、5.5→99、7.0→126、10.0→180、11.0→198、30.0→541。

### CU-03 估算页区间参考表

- `src/pages/GlucoseToA1cPage.jsx` 新增静态节「常见平均血糖的估算 A1C 区间」，位于 `.estimator-panel` 之后、公式节之前，`id` 自定（如 `estimator-chart`）。
- 行：平均血糖 **70~240 mg/dL，每 10 一档，共 18 行**（全部落在 ADAG 数据可靠范围约 68~240 mg/dL 内，不外推）。三列：Average glucose (mg/dL)、Average glucose (mmol/L)（`formatMmol(mgdlToMmol(x))`）、Estimated A1C range（`formatA1cRange(a1cRange(x))`，与计算器完全同一路径）。模块加载时生成，禁止手写数值。
- 红线：**只给区间**，不得出现单点 A1C；不加任何分类、颜色或高亮；不出现 normal / prediabetes / diabetes 等分档词。页面文件头 RED LINES 注释中「not even an educational band table」保持有效：本表不是分档表，注释需补一句说明二者区别。
- 表前说明段：这些区间与上方估算器用的是同一个计算；它们是基于 ADAG 数据的代数近似，所以是区间而不是单个数；只覆盖 ADAG 数据可靠的范围。表后 muted 段：真实 A1C 需要 NGSP 认证的化验；与页面现有表述一致，不引入新统计数字。
- 在 intro 追加一个跳转锚点链接指向本节。
- 标题、H1、meta description、`.estimator-panel` 零改动；`/glucose-to-a1c-estimator` 的 sitemap lastmod 改为执行当天。
- golden 值（已验算）：70 → 3.9 mmol/L → `≈ 3.5% – 4.6%`；100 → 5.6 → `≈ 4.6% – 5.7%`；150 → 8.3 → `≈ 6.3% – 7.4%`；160 → 8.9 → `≈ 6.7% – 7.7%`；200 → 11.1 → `≈ 8.0% – 9.1%`；240 → 13.3 → `≈ 9.4% – 10.5%`。

### CU-04 手机横向溢出

- 目标：9 个页面在 **390×844 与 360×740** 视口下，JS 开启与关闭两种情况都满足 `document.documentElement.scrollWidth <= window.innerWidth`。
- 做法：先逐页定位所有溢出源（不只是表格）。宽表格统一包进可横向滚动的容器，容器必须满足无障碍要求：`tabindex="0"`、`role="region"`、非空 `aria-label`（对应 axe 规则 scrollable-region-focusable）。建议抽一个共用组件或统一的 class。CSS 只能新增、且限定在该容器或具体溢出源上；不改 `src/App.jsx` 的逻辑与结构（必要时只能通过 CSS 修其溢出）。
- **桌面视觉零变化**：1440×900 下 9 个页面的全页截图与本 ticket 开始时的构建逐字节相同（注意：`overflow-x: auto` 会建立新的块格式化上下文，可能改变外边距折叠，必须处理）。
- 手机截图允许变化（这正是修复目标），但表格内容不得被截断，只能在容器内滚动。

### CU-05 AGENTS.md 更新与去重

- 删除 `src/gi.json`（与 `src/data/gi.json` 逐字节相同的副本）；`tests/unit/gi-data.test.js` 的 import 改指 `src/data/gi.json`（等价修改）；`src/lib/giData.js` 等处注释里的 `src/gi.json` 同步改为 `src/data/gi.json`。
- 删除零引用的 `src/index.css`。
- 两项删除后，`dist/` 构建产物必须与删除前逐字节相同。
- 重写根目录 `AGENTS.md`（保持「只做索引」的定位，中文），必须准确覆盖：当前状态（线上 glucomath.com、旧域 308、9 个预渲染路由）；各份 Spec 与 ticket 目录的索引（主 Spec v2.2 红线仍然有效）；`tasks.md` 任务纪律；**编排协议**（编排者写 spec/ticket；执行子代理实现、不 commit、不改 tasks.md；另一个子代理独立验收，ACCEPT 后才提交；同一 ticket 循环 5 次未过即暂停请站长介入）；常用命令；Playwright 文件名规则；关键不变量（见 CU-05 ticket 的事实清单）；目录速览（与仓库实际一致）。
- **仓库是公开的**：不得写入任何个人信息（邮箱、账号）或密钥。

## §3 红线（全批适用，违反即失败）

1. 主 Spec §9 全部继承：禁迁框架、禁诊断分档、A1C 反向只出区间、公式只来自 formulas.js、禁 glcalc 变体（含资源文件名）、MIT 上游署名不动等。
2. `npm run check` 必须全绿；不删除、不放松任何现有断言；现有测试零修改（CU-05 中 `gi-data.test.js` 的 import 路径等价修改除外）。
3. 不新增 npm 依赖；不引入新的第三方请求。
4. 各页标题、H1、meta description 不改；除本批明确要求的页面外，其余页面的预渲染 HTML 不得有内容变化。
5. 新增文案不得引入页面上原本没有的统计数字。

## §4 Tickets 与 Test plan

| Ticket | 依赖 | Test plan 要点 |
|---|---|---|
| CU-01 | 无 | 新增 app 项目与 static 项目各一个 e2e（文件名分别匹配两个项目）：加载页面时，统计主机**没有任何成功响应**，且对应请求以 `net::ERR_NAME_NOT_RESOLVED` 失败（证明是被屏蔽而不是没请求）；verify-dist 既有 GA4 / beacon 断言照常通过（证明生产代码未变）。 |
| CU-02 | CU-01 | unit：两张表的行数（29 / 27）与上面 13 个 golden 值；verify-dist：独立硬编码 golden 值、行数、跳转锚点与目标 id、既有 6 个对照对仍通过；e2e（static）：禁 JS 时两张表可见、行数正确。 |
| CU-03 | CU-02 | unit：18 行、6 个 golden 行、每行都是区间且与 `formatA1cRange(a1cRange(x))` 一致；verify-dist：独立硬编码 golden、18 行、节在 `.estimator-panel` 之外、表中无单点百分数与分档词、跳转锚点；e2e（static）：禁 JS 时可见。 |
| CU-04 | CU-03 | e2e（static，JS 开 / 关）：9 页 × 2 个手机视口无横向溢出；所有滚动容器具备 `tabindex="0"`、`role="region"`、非空 `aria-label`；验收方另做桌面 1440 截图与基线逐字节比对。 |
| CU-05 | CU-04 | `src/gi.json`、`src/index.css` 已删除且无任何引用；构建产物与删除前逐字节相同；`npm run check` 全绿；验收方逐条核对 `AGENTS.md` 中每一项事实与仓库一致，且不含个人信息。 |
| CU-06 | CU-01~05 | 编排者：推送部署后抽查线上换算页两张表、估算页区间表、三个页面手机视口无溢出、sitemap lastmod。 |
