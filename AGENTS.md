# GlucoMath（glucomath.com）

免费血糖与升糖计算器站：Vite 5 + React 17 客户端渲染，构建后用 Playwright 预渲染成静态页面。fork 自 [assafmo/glcalc.com](https://github.com/assafmo/glcalc.com)（MIT）。本文件只做索引：与 Spec 冲突时以 Spec 为准，任务状态以 `tasks.md` 为准。

## 当前状态

- 线上 https://glucomath.com ，托管在 Vercel：GitHub `TigerVanguard/glcalc.com` 的 `master` 推送后自动构建部署。本机工作副本中 remote `tiger` 指向该仓库，`origin` 指向上游 assafmo/glcalc.com（不要往 `origin` 推）。
- 旧域 `glcalc.vercel.app` 全路径 308 到新域（`vercel.json` 中按 host 条件的 permanent redirect）。
- 品牌 GlucoMath：`src/site.config.js` 的 `BRAND` / `SITE_ORIGIN`（可用 `VITE_BRAND` / `VITE_SITE_ORIGIN` 覆盖）。
- 9 个预渲染路由（真源：`scripts/prerender.mjs` 的 `ROUTES`）：`/`、`/glycemic-load-calculator`、`/glycemic-load-chart`、`/glycemic-index-calculator`、`/gmi-calculator`、`/a1c-to-eag-calculator`、`/blood-sugar-converter`、`/glucose-to-a1c-estimator`、`/about`。预渲染同时生成 `dist/404.html`、`dist/sitemap.xml`、`dist/robots.txt`。
- 页头导航 `SiteNav` 恰好 8 项，`/glycemic-load-chart` 故意不在导航里（verify-dist 断言每页 8 项）。

## Spec 与 ticket 索引

主 Spec §9 红线在所有批次中优先级最高；各批 Spec 自包含，是该批的执行依据。下表状态写于 2026-09-29，此后以 `tasks.md` 为准。

| Spec | Ticket 目录 | 状态 |
|---|---|---|
| `docs/2026-09-12-execution-spec-v2.2.md`（主 Spec：重构为多页预渲染站 + 更名） | `.scratch/glucomath-rebuild/issues/`（01~17） | 01~16 已关闭（16 按无工具分支跳过）；17 上线后 GSC 跟踪长期进行中 |
| `docs/2026-09-20-shareable-assets-spec-v1.md`（分享卡、GL 速查页、打印） | `.scratch/shareable-assets/issues/`（01~06） | 全部完成 |
| `docs/2026-09-27-perf-spec-v1.md`（字体自托管、拆分 gi.json 页面） | `.scratch/perf/issues/`（01~03） | 全部完成 |
| `docs/2026-09-29-gmi-content-spec-v1.md`（GMI 对照表 + 意图 FAQ） | `.scratch/gmi-content/issues/`（01；GC-02 为编排者部署核对，无 ticket 文件） | GC-01、GC-02 完成 |
| `docs/2026-09-29-content-ux-batch-spec-v1.md`（测试屏蔽统计、换算/估算表、手机溢出、本文件） | `.scratch/content-ux-batch/issues/`（01~06） | CU-01~04 完成；CU-05、CU-06 以 `tasks.md` 为准 |

- 主 Spec §0A「仓库实况」记录的是 2026-09-12 开工前的状态，部分已过时（如 e2e 跑在 dev server、`App.js` 存在）；§1 锁定决策 D1~D6 与 §9 红线仍然有效。
- shareable-assets 的 ticket 在 `tasks.md` 中记为 SA-01~06（按文件编号），与 Spec 里的 BL-01~06 不是一一同号；每个 ticket 文件头写明了对应的 BL 编号。
- 其他文档：`docs/2026-09-09-gsc-baseline.md`（旧域 GSC 基线）、`docs/2026-09-13-delivery/`（重构交付报告、红线自查）；`docs/2026-09-10-seo-spec-v2.md` 已被 v2.2 取代；`docs/superpowers/` 与 `docs/google-analytics-search-console-tutorial.md` 是重构前的历史文档。

## 任务纪律（强制）

每个任务执行之前，先写入根目录 `tasks.md`；完成后立即标记完成。

1. 开始任何任务前，在 `tasks.md` 对应条目把状态改为 `[~]`（进行中）并填「开始时间」；任务不在清单里，先补一行再动手。
2. 任务完成且验证通过后，改为 `[x]` 并填「完成时间 + 验证证据」（命令输出摘要、测试结果）。
3. 任务受阻改为 `[!]`，写明阻塞原因（如需要站长本人完成的操作）。
4. 同一时刻只允许一个 `[~]`。
5. 禁止跳过登记直接改代码；禁止未验证就标 `[x]`。

编排模式下，以上登记由编排者完成（见下节）。

## 编排协议

- **编排者**（主会话）：与站长确定范围，写 Spec（`docs/`）与 ticket（`.scratch/<批次>/issues/`），在 `tasks.md` 登记，依次派执行子代理与验收子代理；验收 ACCEPT 后才提交（提交信息惯例：`<type>: <摘要> (<ticket>, verified)`）；推送部署与线上核对由编排者在批末进行（如 PF-03、GC-02、CU-06）。
- **执行顺序**：ticket 按编号串行，只认领 Blocked by 全部完成的 ticket，后一张以前一张提交后的 HEAD 为基线。
- **执行子代理**：按 ticket 实现并自跑 `npm run check`；**不 commit、不改 `tasks.md`**。执行中若发现 Spec 与既有的精确断言冲突，先停下报告，由编排者批准等价或更严格的替换，并把修订写进对应 Spec（先例：CU-02、GC-01）。
- **验收子代理**：另一个子代理独立验收：自己重跑 `npm run check`，逐条核对 ticket 验收项与仓库事实，不采信执行方的报告；结论为 ACCEPT 或驳回。
- **循环上限**：同一 ticket 执行 → 验收循环 5 次仍未通过，即暂停，在 `tasks.md` 标 `[!]` 并请站长介入。
- 日志写在 `.scratch/`（`<ticket>-exec-check.log`、`<ticket>-verify.log`，第 N 轮加 `-rN`），`tasks.md` 按路径引用；`.scratch/` 下受版本控制的主要是各批 `issues/`，日志、截图、临时构建一般不提交。

## 常用命令（以 `package.json` 为准）

```
npm run dev          # Vite 开发服务器，含 /api/barcode、/api/photo-identify 本地中间件
npm run build        # vite build + node scripts/prerender.mjs
npm run verify-dist  # node scripts/verify-dist.mjs：对 dist/ 做 DOM 级断言（需先 build）
npm run test:unit    # vitest run（tests/unit/**/*.test.js）
npm run test:e2e     # playwright test（static 项目要求 dist/ 已构建）
npm run check        # 统一验收门：test:unit → build → verify-dist → test:e2e
```

- 2026-09-29（CU-05）基线：unit 113、verify-dist 779 PASS、e2e 205，全绿。之后以 `tasks.md` 最近的记录为准。
- 单测配置在 `vitest.config.js`（`include: ["tests/unit/**/*.test.js"]`，另有 `@` → `src` 别名）；存在该文件时 vitest 不读 `vite.config.js`，所以 `json.stringify` 等构建选项在单测里不生效。
- 跑 `npm run check` / `npm run test:e2e` 前，4183 与 4184 端口必须空闲：两个 webServer 都是 `reuseExistingServer: false`，端口被占会直接失败。
- 页脚 "Last updated" 取构建当天的 UTC 日期（`vite.config.js` 注入 `VITE_BUILD_DATE`，`ToolFooter.jsx` 使用）。跨 UTC 日构建的 dist 不会逐字节相同；做前后逐字节比对时，两次构建要在同一 UTC 日内。
- `node scripts/serve-dist.mjs --port <端口>`：按 Vercel 规则服务 `dist/`（真实 404，`/route/` 308 到 `/route`）；`node scripts/generate-og-cover.mjs`：重新生成 `public/og-cover.png`。
- Windows + PowerShell：用 `npm run check *> .scratch\<名>.log` 留日志。Vite 写到 stderr 的警告（`Mixed async and defer script modules…`）会被包成 `NativeCommandError` 文本，不代表失败，以退出码与结果行为准。

## Playwright

- `playwright.config.js` 有两个项目，按文件名分配：
  - `static`：`scripts/serve-dist.mjs` 服务 `dist/`（端口 4184，`E2E_STATIC_PORT`），`testMatch: /(prerender|seo)\.spec\.js/`；
  - `app`：`npm run dev`（端口 4183，`E2E_PORT`；条码/拍照 API 只在这里可用），`testMatch: /(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/`。
- 新测试文件按惯例命名为 `<主题>-prerender.spec.js`（static）或 `<主题>-app.spec.js`（app）。两个正则都不匹配的文件不会被任何项目运行。
- 测试屏蔽统计：顶层 `use.launchOptions.args` 含 `--host-resolver-rules`（把 GA4 与 Cloudflare 统计的 9 种主机写法解析为 `~NOTFOUND`），以及忽略系统代理的 `--no-proxy-server`、`--no-system-proxy-config-service`。项目级 `launchOptions` 会整体覆盖顶层的，必须重复这三个参数；显式配置代理会绕过屏蔽。由 `analytics-block-app.spec.js` 与 `analytics-block-prerender.spec.js` 守护。

## 关键不变量与坑点

- **渲染**：`src/index.jsx` 用 React 17 的 `ReactDOM.render`（不是 hydrate），整树替换预渲染 DOM；render 回调给 `#root` 设 `data-render-complete="true"`，`prerender.mjs` 等它出现再快照。依赖 gi.json 的三个页面（GL 计算器、GI 查询、GL 速查）拆成独立 chunk：直接打开时先 await 模块再首次 render，站内导航走 `lazy` + `Suspense`（fallback 含 SiteNav）。
- **包体**：入口 JS ≤ 260 KB 且不含 gi.json 数据（verify-dist PF-02 断言）。`vite.config.js` 的 `chunkFileNames` 把 `GlCalculatorPage` 的 chunk 改名为 `gl-calculator-[hash].js`，否则默认名含 "GlCalc"，过不了 verify-dist 对 dist 文件名与资源路径的 `/glcalc/i` 检查；新增名字里含类似字样的模块时同样要改 chunk 名。
- **数据**：`gi.json` 唯一位置是 `src/data/gi.json`（`{食物名: {gi, carbs_per_100g}}`，4893 条；`api/` 的两个函数也在运行时读它）。`vite.config.js` 开了 `json.stringify: true`，JSON 只能 default import。`data/` 是上游 DiOGenes 原始数据与转换脚本，应用不读取。
- **字体**：站内托管于 `public/fonts/`（Fraunces、Manrope 的 latin / latin-ext woff2 + OFL 许可）；`index.html` 两个 preload 的 href 必须与 `src/styles/fonts.css` 中 `@font-face` 的 src 完全一致；不得再引用 Google Fonts。
- **样式**：全局样式只有 `src/styles/fonts.css` 与 `src/styles/app.css`（由 `src/index.jsx` 引入）。`src/App.css` 是上游遗留的零引用文件，不要往里写。
- **公式与显示**（适用于新增代码）：公式只来自 `src/lib/formulas.js`（纯函数，返回未舍入值）；显示舍入只用 `src/lib/display.js`；新组件不得自行计算或舍入。既有例外（上游 GL 流程）：`src/lib/gl.js` 的 `calculateCarbs` 把碳水舍入到 0.1 g、`calculateGl` 把 GL 舍入到 0.01；`src/App.jsx`、`src/features/calculator/CalculatorResult.jsx`、`src/features/confirm/FoodCandidateList.jsx` 在组件内把克数舍入到 0.1；`display.js` 没有 GL 格式化函数。**不要为了统一而改动这些文件，尤其 `App.jsx` 历批都要求零改动。**
- **数值内容**（适用于新增内容中由公式换算得到的数字）：对照表、FAQ 例子里的这类数字必须在模块加载时由 formulas + display 生成（如 `src/data/converterTables.js`、`estimatorChart.js`、`gmiChart.js`、`gmiFaq.js`），禁止手写；verify-dist 对 golden 值独立硬编码，不 import `src/`。既有例外：`glChartTable.js`、`glStaticTable.js` 的 GL 用 `formulas.gl` 计算，但显示用文件内的本地 `formatGl`（半入到 1 位小数）；`src/data/bloodSugarConverterFaq.js` 手写了 3.9、5.6、7.8 mmol/L（当前数值正确，但无测试守护）；/a1c-to-eag-calculator 的 ADA 参考表（`A1cToEagPage.jsx` 的 `ADA_REFERENCE_ROWS`）是引用的常量阈值，属合理例外。
- **SEO**：每页 title / description / canonical / JSON-LD 只来自 `src/seo/pageSeo.js`（`HeadManager.jsx` 注入并烤进预渲染 HTML，`index.html` 不放页面级 head 标签）；`src/data/*Faq.js` 同时生成可见 FAQ 与 FAQPage JSON-LD，二者须逐字一致；sitemap lastmod 只来自 `src/sitemap-lastmod.json`（页面内容实际变化时手工改为当天，不用构建日期）。verify-dist 对每页 title 与 description 独立硬编码、逐字断言。`public/sitemap.xml`、`public/robots.txt` 构建时会被 prerender 重写，改它们无效。
- **宽表格**：超过两列的表必须包在 `src/features/common/TableScroll.jsx` 里（`role="region"`、`tabIndex={0}`、非空 `aria-label`）；`tests/e2e/mobile-overflow-prerender.spec.js` 在 390 / 360 / 320 px 下强制检查，并精确断言每页的滚动框数量（GL 计算器、GL 速查、GI、GMI、估算页各 1 个，其余 0 个）。
- **Vercel 构建**：依赖 `vercel.json` 的 `installCommand`（先 `yum install` Chromium 所需系统库，再 `npm install` 与 `npx playwright install chromium --only-shell`；构建时预渲染要启动 Chromium，勿删）和 `.npmrc` 的 `legacy-peer-deps=true`；只用 npm（仓库里没有 yarn.lock）。`vercel.json` 另有 `cleanUrls`、`trailingSlash: false`，不加 catch-all rewrite（未知路由要返回真实 404）。
- **统计**：GA4 与 Cloudflare Web Analytics beacon 写在 `index.html` 里无条件加载（verify-dist 断言 GA4 无 hostname 条件、beacon 为 async module）；屏蔽由预渲染（`prerender.mjs` 中止所有非 127.0.0.1 请求）与 e2e（见上节）负责，生产代码不做环境判断。
- **反馈表单**：/about 用 Web3Forms 原生 POST（禁用 JS 也能提交）；其 access key 按设计公开，不是密钥。
- **GSC**：周报原始数据存 `.gsc-export/<日期>-glucomath/`（如 `2026-09-25-glucomath/`）；`.gsc-export/coverage/`、`performance/` 是旧域 2026-09-09 的基线导出。GSC 需要资源所有者账号登录才能读取（由站长登录）；请求编入索引等操作需站长授权。验收禁用 `site:`。
- **其他**：没有 Service Worker（PWA 只指 manifest），禁止写「离线可用」；`api/` 是真实的 Vercel 无服务器函数（条码、拍照识别），本地由 `vite.config.js` 中间件模拟；`package.json` 里的 `semantic-ui-react` / `semantic-ui-css` 零引用。

## 新增或改名路由时要同步的地方

- `scripts/prerender.mjs` 的 `ROUTES`（path、label、h1；404 页链接与 sitemap 由它生成）；
- `src/index.jsx` 的 `<Route>`（依赖 gi.json 的页面还要进 `SPLIT_PAGES`）；
- `src/seo/pageSeo.js` 的页面条目（有 FAQ 时配对应的 `src/data/*Faq.js`）；
- `src/sitemap-lastmod.json`（与 `ROUTES` 不一致时 prerender 直接报错）；
- `scripts/verify-dist.mjs` 的 `PAGES`（title、description、JSON-LD 类型、是否在导航）；
- `tests/e2e/prerender.spec.js` 的 `ROUTES` 与「从首页点击可达」分支；`tests/e2e/seo.spec.js` 的 `ALL_ROUTES` 与 sitemap `<url>` 数量（当前 9）；`tests/e2e/mobile-overflow-prerender.spec.js` 的 `ROUTES`（有宽表时还有 `FRAMED_ROUTES`）；
- 进导航才改 `src/features/common/SiteNav.jsx` 的 `NAV_ITEMS`（verify-dist 要求恰好 8 项，改数量需 Spec 批准）；并按内链规则在首页或相关页加入口。

## 红线（详见主 Spec §9）

- 主 Spec §9 八条：禁迁 Next/Astro 或重写应用；禁用 `site:` 验收；禁字数或标题长度硬阈值与注水内容；禁对用户输入的 A1c / eAG / GMI 给出诊断判定（A1C 反向估算只出区间，不出现 normal / prediabetes / diabetes 分档）；禁把反解式标成 ADAG、禁把 DiOGenes 写成权威源或写「哈佛」；禁 glcalc 品牌变体；禁把单一口径数字标为「已验证」；禁删上游 LICENSE 或遗漏 MIT 署名。
- 品牌：产品文案、资源文件名与资源路径禁任何 glcalc 变体（verify-dist 检查 dist 文件名与资源路径不匹配 `/glcalc/i`、全部产物不含 `glcalc.vercel.app`）；GitHub 仓库名 glcalc.com 与上游 MIT 署名（assafmo/glcalc.com，见 `README.md`、`LICENSE`、/about）保留不动。
- 各批 Spec 常见的红线（以各 Spec 为准）：`npm run check` 全绿；不删除、不放松现有断言；不新增 npm 依赖、不加第三方请求；标题、H1、meta description 未经 Spec 批准不改；新增文案不引入页面上原本没有的统计数字。

## 目录速览

```
api/                      Vercel 无服务器函数：barcode.js、photo-identify.js
data/                     上游 DiOGenes 原始压缩包与转换脚本（应用不读取）
docs/                     各批 Spec、GSC 基线、2026-09-13 交付报告
public/                   fonts/、icons/、manifest.webmanifest、og-cover.png 等静态资源
scripts/                  prerender.mjs、verify-dist.mjs、serve-dist.mjs、generate-og-cover.mjs
src/index.jsx             入口：路由、三页拆分加载、ReactDOM.render
src/App.jsx               GL 计算器主流程（由 pages/GlCalculatorPage.jsx 渲染）
src/SearchWorker.js       食物搜索 Web Worker
src/pages/                9 个路由页面
src/features/             common（布局、导航、页脚、TableScroll、分享卡与打印按钮等）/ search / barcode / photo / calculator / confirm / workflow
src/lib/                  formulas.js、display.js、giData.js、gl.js、foodMatch.js、normalizeFood.js、shareCard.js
src/data/                 gi.json + 各页表格与 FAQ 数据模块
src/seo/                  pageSeo.js、HeadManager.jsx
src/styles/               fonts.css、app.css
src/site.config.js        BRAND、SITE_ORIGIN
src/sitemap-lastmod.json  sitemap lastmod 真源
tests/unit/               vitest
tests/e2e/                Playwright（文件名决定所属项目）
tests/fixtures/           拍照识别 e2e 用图
.scratch/                 各批 ticket（*/issues/）与本地日志、临时构建
.gsc-export/              GSC 原始导出
.harness/                 2026-04 MVP 阶段的验证 harness，之后未更新
tasks.md                  任务总账
```
