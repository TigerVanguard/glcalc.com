# GlucoMath 重构执行 Spec v2.2（独立 Agent 单独执行版）

版本 v2.2 ｜ 2026-09-12 ｜ 取代 v1.0 / v1.1 / v2.0 / v2.1（v2.0 见 `docs/2026-09-10-seo-spec-v2.md`，本版是其可执行细化；v2.2 修复对抗性审查发现的 4 Critical + 15 Important 问题）
本文档自包含：执行本 Spec 不需要读任何会话历史。所有背景结论已内嵌；所有验收可用命令复现。

---

## 0. 任务一句话

把本仓库（Vite + React 17 纯 CSR 单页应用，部署于 glcalc.vercel.app）重构为 **8 个可独立索引页面（/ + 6 工具页 + /about）的预渲染多页站**，品牌更名 **GlucoMath**（域名 glucomath.com），修复全部已知医学/署名/SEO 错误，通过本文 §8 测试计划后交付。

## 0A. 仓库实况备忘（Agent 执行前必读，全部已核实）

1. **没有 Service Worker**：全仓库无 SW 注册代码、无 PWA 插件；「PWA」仅指 manifest 可安装元数据。本次交付**不引入 SW**，任何「离线可用」表述都是禁止的虚假声明。
2. **条码/拍照有真实后端**：`api/barcode.js` 与 `api/photo-identify.js` 是 Vercel 无服务器函数；本地 dev 由 `vite.config.js` 里的 `barcodeApiPlugin`/`photoApiPlugin` 中间件模拟。此后端保留不动。「零后端」只适用于本次新建的 4 个数值工具页。
3. **e2e 现跑在 dev server 上**：`playwright.config.js` 的 webServer 是 `npm run dev`；`package.json` 的 `check` 顺序是 unit → e2e → build。**必须按 §8 头部的新基建改造**，否则预渲染验收必然失败。
4. **`src/App.js` 是遗留死代码**，真实入口是 `App.jsx`；迁移以 `App.jsx` 为准，`App.js` 可删除。
5. **入口用 `ReactDOM.render`（React 17）**：预渲染 HTML 会被整树替换（控制台警告可接受）。维持 `render` 即可，**不要**改用 hydrate（预渲染快照与运行时树不保证匹配）。
6. `tests/e2e/pwa.spec.js` 硬断言旧品牌名（"Glycemic Load Calculator"/"GL Calc"）；`tests/e2e/seo.spec.js` 断言旧首页 head——两者在对应阶段按 §8 说明**重写**，不是追加。

## 1. 已锁定的决策（Agent 不得重开）

| # | 决策 | 依据（已核查） |
|---|---|---|
| D1 | 品牌 = GlucoMath，域名 = glucomath.com | RDAP 可注册、USPTO 无同名商标、无同名产品；禁止任何 glcalc 变体（上游 assafmo 持有 glcalc.com 且运营中） |
| D2 | 技术路线 = 保留 Vite+React，**构建后预渲染**；不迁 Next/Astro | 应用已完成（搜索/条码/拍照），迁移=推倒重来 |
| D3 | GI 数据低碳水条目 = **标注不剔除**（详 §6） | Louie et al. 2015 / ISO 26642 方法学 |
| D4 | A1c 相关输出禁止落诊断分档 | ADA 要求诊断用 NGSP 认证实验室检测 |
| D5 | 验收禁用 `site:` 算子，只用 GSC 报告 + curl | Google 官方声明 site: 不返回全部已索引 URL |
| D6 | 上游 MIT 署名必须补（与品牌无关） | fork 自 assafmo/glcalc.com（MIT, 2018） |

## 2. 现状基线（2026-09-09 GSC 实测，原始 CSV 在 `.gsc-export/`）

已索引 1 页；季度 4 点击 / 901 展示 / 平均排名 54.4。根因链：首页 `<a href>` = 0（Google 只靠 `<a href>` 发现链接）→ 可发现 URL 只有 1 → 全部词挤一个 URL 排 45~80。展示第一的词是 gmi calculator（67 次，排名 71）。

## 3. 数据口径规则（写任何数字前必读）

1. 搜索量（Google Ads Planner 口径，2026-09 快照，桶化+变体归并）：a1c calculator 22,200 / glucose to a1c 1,900 / blood sugar converter 1,300 / gi & glycemic index calculator 各 720 / blood sugar calculator 590 / gmi calculator 480（顶部出价 $3.00~15.79，全表最高）/ glucose calculator 390 / glycemic load calculator 260。
2. KD/linkBudget 来自哥飞版自建工具，**仅供选词参考**；linkBudget 是 Ahrefs 公开曲线的插值推算。引用必须带「哥飞版」标签。
3. GSC 是本站表现的唯一裁决口径；但展示量≠需求量（排第 5 页只有千分之几展示份额）。
4. **Agent 责任**：若有条件接入选词工具，执行前重拉上表数据并更新 §5 决策；无条件则沿用快照并在交付物中标注「2026-09 快照，未重验」。三种口径在任何表格中不得混列于同一「已验证」标签下。

## 4. 工作分解（按序执行）

**任务登记纪律**：本节所有任务已登记在仓库根目录 `tasks.md`。每个任务动手前先把对应条目改为 `[~]`（进行中），完成且验证通过后改 `[x]` 并附证据，受阻改 `[!]` 并写原因；新任务先登记再执行（协议全文见根目录 `AGENTS.md`）。

### P0 人类依赖项（Agent 无法代办，先确认状态）
- [ ] glucomath.com 是否已购买（站长在 Spaceship 购买；若查明为注册局溢价域名，备选顺位 glucoconvert.com → glycocalc.com → a1cmate.com）。**未购买不阻塞 P1~P4**，只阻塞 P5。
- [ ] GSC 权限（域名验证需站长在 DNS 加 TXT 记录）。
- [ ] **维护者署名与联系方式**（§7 第②项与 /about、Organization contactPoint 需要）。站长未提供时用兜底串 "Maintained by the {BRAND} project"，联系入口暂用 GitHub 仓库 issues 链接。

### P1 义务补齐（仓库层面，当天可完成，可单独合入）
1. MIT 署名先落仓库层：README 顶部加 "Based on the open-source project [glcalc.com](https://github.com/assafmo/glcalc.com) by Assaf Morami, MIT License, © 2018"；仓库根 LICENSE 保留不动（/about 页面级署名在 P2 一并上线）。
2. GA4：删除 `index.html` 第 23~25 行的 `if (window.location.hostname === "glcalc.vercel.app")` 门，改为无条件 `gtag("config", "G-PDPYWE3JR5")`（或域名白名单含新旧两域）。
3. **注意**：首页 `<a href>` 导航与 `/about` 页依赖 P2 的路由基建，**必须与 P2 同一次部署上线**——严禁提前上线指向尚不存在路由的链接（7 个 404 链接对抓取信号是负资产）。

### P2 多页化（核心工程）
1. **站点源常量**：新建 `src/site.config.js`：`export const SITE_ORIGIN = import.meta.env.VITE_SITE_ORIGIN || "https://glcalc.vercel.app"`。所有 canonical/OG/sitemap/schema 的绝对 URL 一律从此常量生成。P5 切域名时只改环境变量。
2. 引入客户端路由（react-router v6，兼容 React 17；或等价轻量路由），路由表 = §5 的 8 个 URL；页面组件与功能实现按 §5A 执行（现有 App 主体迁至 `/glycemic-load-calculator`，`/` 改为导航首页）。
3. **每路由独立 head**：title / meta description / canonical（`SITE_ORIGIN + path`）/ OG / JSON-LD（用 react-helmet-async 或路由级手写 document.head 更新；预渲染落地后以静态 HTML 为准）。**同时必须拆除 `index.html` 硬编码的全部页面级 head 标签**（title/canonical/description/og/twitter/JSON-LD @graph）——helmet 不会移除它不管理的静态标签，不拆则预渲染后每页出现双 title/双 canonical，T3 必挂。模板只保留 charset/viewport/字体/GA4/manifest/图标。
4. **构建后预渲染**：新增 `scripts/prerender.mjs` —— build 完成后用 Playwright（devDependencies 已有）起本地静态服务器，逐路由渲染，把完整 HTML 写为 `dist/<route>/index.html`。**关键细节**：预渲染时 `dist/` 只有根 `index.html`，本地静态服务器必须把所有 HTML 导航请求回退到 `dist/index.html`（仅此脚本内部使用，与线上配置无关），否则子路由 404 渲染不出内容。`package.json` 的 build 改为 `vite build && node scripts/prerender.mjs`。
5. **sitemap 与 robots 动态化**：`scripts/prerender.mjs` 末尾用 SITE_ORIGIN 重写 `dist/sitemap.xml`（8 个 URL + lastmod，来源见 §5B.4）与 `dist/robots.txt`；并生成含全站导航的静态 `dist/404.html`（Vercel 静态托管对未匹配路径自动以 404 状态返回它）。
6. **线上路由**：8 个路由全部是预渲染文件，**不需要也不得配置任何 SPA 回退 rewrite**（catch-all rewrite 到 index.html = 软 404，§5B.4 明令禁止）。`vercel.json` 只配 `cleanUrls: true` + `trailingSlash: false`，其余依赖文件系统路由。
7. `VITE_BUILD_DATE` 注入：在 `vite.config.js` 用 `define`（或 build script 环境变量）注入构建日期，供 `ToolFooter` 第④项使用。

### P3 内容页实现（逐页规格见 §5）
### P4 数据质量管道（见 §6）
### P5 域名切换（glucomath.com 购买后执行）
1. Vercel 绑定 glucomath.com，设为 Production 域名；`VITE_SITE_ORIGIN=https://glucomath.com` 重新 build；
2. glcalc.vercel.app → glucomath.com 全路径永久重定向（Vercel 域名 redirect 配置；**Vercel 实际返回 308，SEO 等效 301，验收断言 status ∈ {301, 308} 且 Location 正确**，不得把 308 误判为失败）；
3. 全站文案品牌名 GL Calc → GlucoMath：`BRAND` 常量切换 + manifest.webmanifest 的 name/short_name、application-name、og:site_name、schema name 同步；**`tests/e2e/pwa.spec.js` 的品牌名断言同步改为从 site.config 读取**（否则与「pwa.spec.js 全绿」互斥）；**重制 `public/og-cover.png`**（静态图内品牌名不吃环境变量切换）；
4. GSC 新建 glucomath.com 域名级资源（DNS TXT），提交 sitemap；旧资源保留观察重定向生效；
5. 验收：产物中 `grep -r "glcalc.vercel.app" dist/` 仅允许出现在重定向说明文档中（HTML/sitemap/robots 零命中）。

## 5. 页面规格（8 个 URL）

每页通用：唯一 `<h1>` 含目标词；正文以「回答该词搜索意图」为准，**禁止字数阈值**（Google 官方否认字数是排名因素）；Title 长度以 SERP 像素截断经验为参考非硬性；正文相关工具区 ≥2 个指向其他工具页的 `<a href>`（页头导航另计，见 §5B.3）；**全站 8 页统一使用同一 `ToolFooter` 页脚（免责 5 项，模板见 §7）**；JSON-LD 按 §5B.2 分页配置（WebApplication 仅 6 个工具页）。
表中「批次」列的 1/2 是**内容上线批次**（先做收割现有展示信号的 3 页，再做 a1c 竞争簇 3 页），与 §4 的阶段编号 P1~P5 是两套体系，勿混淆。

| URL | 目标词（口径见 §3） | 批次 | 核心功能与公式（含出处，必须原样实现） |
|---|---|---|---|
| `/` | 不争工具词 | 1 | 品牌介绍 2~3 句 + 6 工具 `<a href>` 卡片 + 健康声明。验收：`verify-dist.mjs` DOM 解析计数内部链接 ≥7（不得用 `grep -c`——它数行数，压缩 HTML 单行必误判） |
| `/glycemic-load-calculator` | glycemic load calculator 260 | 1 | 现有 App 主体。GL = GI × 可用碳水(g) ÷ 100；分档为**连续区间**（与现有 `getGlLabel` 一致）：GL ≤10 Low、10 < GL < 20 Medium、GL ≥20 High（GL 保留 2 位小数，10.5/19.99 均为 Medium，不得写出对小数返回 undefined 的整数式分档）；静态食物表 ≥20 条（§6）；正文覆盖 glycaemic 英拼与 how-to 长尾 |
| `/glycemic-index-calculator` | glycemic index calculator 720 + gi calculator 720 | 1 | 食物 GI 查询 + GI 分档（连续区间：GI ≤55 低、55 < GI < 70 中、GI ≥70 高）+ GI vs GL 区别段落 |
| `/gmi-calculator` | gmi calculator 480（商业价值最高） | 1 | **GMI(%) = 3.31 + 0.02392 × 平均血糖(mg/dL)**（Bergenstal et al., Diabetes Care 2018，页面注明）；mmol/L 输入换算后代入；必含「GMI 与实验室 A1C 常有 ±0.5% 差异」说明；受众为 CGM 用户，免责按最严档 |
| `/a1c-to-eag-calculator` | a1c calculator 22,200 | 2 | **只用 ADAG 正向式 eAG = 28.7 × A1C − 46.7**（Nathan et al., Diabetes Care 2008；mmol/L 版 1.59×A1C−2.59）；「ADAG formula」标注仅限此正向式；必含适用范围（样本 507 人、误差 SD≈15.7 mg/dL、A1C 4~10% 最可靠、妊娠/血红蛋白变异/贫血不适用）；ADA 参考区间仅作教育展示，**禁止对用户输入值输出 normal/prediabetes/diabetes 判定** |
| `/blood-sugar-converter` | blood sugar converter 1,300 | 2 | mmol/L = mg/dL ÷ 18.018 双向；单位地区差异说明 + 常见值对照表 |
| `/glucose-to-a1c-estimator` | glucose to a1c 1,900（与 §3 词表同串） | 2 | A1C ≈ (eAG + 46.7) ÷ 28.7，页面明示为「基于 ADAG 数据的代数近似，回归不对称、诊断边界附近偏差放大」，**输出区间**（按 SD 15.7 mg/dL 传播为 ±0.5% 量级的范围），不得标注为 ADAG 公式、不得落诊断分档；与 a1c-to-eag 页互链、正文独立 |
| `/about` | — | 1 | 数据来源：**DiOGenes GI Database（diogenes-eu.org，Aston et al., Obesity Reviews 2010；数据库现已下线，本站使用其存档数据）**——禁止写「哈佛」、禁止称 DiOGenes 为「权威 GI 参考」；升级计划注明 Atkinson et al. 2021 国际 GI 表；公式出处汇总（Nathan 2008 / Bergenstal 2018 / 18.018 换算）；MIT 上游署名（§4 P1-2）；维护者署名与联系方式；总免责声明 |

竞品情报（写入交付说明，不写入页面）：a1c-calculator.net（2026-04-03 注册）已覆盖 A1C↔eAG / glucose to A1C / converter / A1C by age——第 2 批三页执行前如有工具条件应对其做盘面精评；第 1 批三页（GL/GI/GMI）收割本站已有展示信号，无此前置。

## 5A. 功能规格（Functional Spec — 新工具怎么做、旧功能怎么迁）

### 5A.1 架构原则

1. **公式与 UI 分离**：所有计算收敛到 `src/lib/formulas.js` 纯函数（`gl`、`mgdlToMmol`、`mmolToMgdl`、`eag`、`a1cRange`、`gmi`、`glBand`、`giBand`），UI 组件禁止内联公式（T1 直接测这些函数）。现有 `src/lib/gl.js` 的 `normalizeServingToGrams` 保留并从 formulas 复用。
2. **页面组件**：新建 `src/pages/` 目录，8 个路由各一个页面组件（`HomePage`、`GlCalculatorPage`、`GiLookupPage`、`GmiCalculatorPage`、`A1cToEagPage`、`BloodSugarConverterPage`、`GlucoseToA1cPage`、`AboutPage`）。页面组件只做编排，业务块复用 `src/features/`。
3. **新增共享组件**（放 `src/features/common/`）：
   - `NumberField`：数值输入（label 关联、inputmode=decimal、非法输入走现有 `ErrorNotice`）；
   - `UnitToggle`：mg/dL ↔ mmol/L 切换（受控，切换时换算已输入值）；
   - `ResultCard`：结果值 + 说明 + 分档徽章（复用现有 `CalculatorResult` 的视觉语言，输出区加 `aria-live="polite"`）；
   - `ToolPageLayout`：H1 + 引言 + 计算器区 + FAQ 区 + 相关工具内链区 + `ToolFooter`；
   - `ToolFooter`：§7 免责 5 项模板的组件化（更新日期由构建时注入，如 `import.meta.env.VITE_BUILD_DATE`）。
4. **交互模型统一**：本次新建的 4 个数值工具（converter/a1c-to-eag/glucose-to-a1c/gmi）零后端、纯客户端、**实时计算**（输入即算，无提交按钮）；空输入显示占位提示而非 0 或 NaN；非法输入显示 `ErrorNotice` 且输出区清空。（现有条码/拍照依赖 `api/` 无服务器函数，见 §0A-2，保留不动，不适用「零后端」表述。）
5. **URL 纪律**：输入值不写入 URL（避免产生参数化 URL 被抓取）；唯一例外是 GI→GL 页的 `?food=` 预填深链，该参数页 canonical 一律归一到无参 URL。
6. 样式沿用现有 `src/styles/app.css` 体系与移动优先布局，不引入新 UI 库。

### 5A.2 逐工具功能规格

**`/blood-sugar-converter`（新建）**
- 输入：mg/dL 与 mmol/L 两个 `NumberField` **双向绑定**（编辑任一侧，另一侧实时更新）。
- 精度：mg/dL 显示整数；mmol/L 显示 1 位小数；内部计算不截断。
- 校验：≤0 或非数字 → ErrorNotice；>1000 mg/dL 显示「超出常见范围」警示条（不阻断）。
- 静态内容块：常见值对照表（70/100/126/140/180/200 mg/dL 对应行，静态 HTML 进预渲染）。

**`/a1c-to-eag-calculator`（新建）**
- 输入：A1C %（`NumberField`，step 0.1）。
- 输出：eAG 以 mg/dL 与 mmol/L **同时**显示（正向式 eag()，mmol 版 1.59×A1C−2.59）。
- A1C <4 或 >10：照常输出但加「超出 ADAG 可靠区间」警示条（对应 formulas 的 out-of-range 标记）。
- ADA 参考区间表为静态教育内容，**不高亮、不匹配用户输入值所在档**（红线 D4）。

**`/glucose-to-a1c-estimator`（新建）**
- 输入：平均血糖 `NumberField` + `UnitToggle`。
- 输出：**只输出区间** "≈ X.X% – Y.Y%"。计算规则写死：中心值 = (eAG+46.7)/28.7，半宽 = 15.7/28.7 = 0.547%（**不预舍入**），端点 = 中心 ± 半宽后**各自**四舍五入到 0.1%（例：输入 126 mg/dL → 中心 6.017 → 区间 5.470~6.564 → 显示 "≈ 5.5% – 6.6%"）；禁止单点大字输出。
- 必带说明块：「代数近似、非 ADAG 官方方向、诊断边界附近偏差放大」。

**`/gmi-calculator`（新建）**
- 输入：CGM 平均血糖 `NumberField` + `UnitToggle`，输入区提示「建议使用 ≥14 天的 CGM 平均值」。
- 输出：GMI 一位小数（gmi()），并排显示换算后的 mmol/L 口径输入回显。
- 必带说明块：GMI 与实验室 A1C 常有 ±0.5% 差异、两者不一致不代表数据错误。

**`/glycemic-index-calculator`（新建，复用检索资产）**
- 功能：食物名搜索 → GI 值 + GI 分档徽章（giBand 连续区间：≤55 低、55<GI<70 中、≥70 高）+ carbs_per_100g 展示。
- 实现：复用 `FoodSearch` + `SearchWorker.js` + `foodMatch.js` 检索 `src/gi.json`；结果卡不含 serving/GL 计算（与 GL 页职责区分）。
- 低碳水条目按 §6 规则显示 "GI: N/A · GL ≈ 0"。
- 每条结果提供「Calculate glycemic load →」深链到 `/glycemic-load-calculator?food=<name>`（GL 页读参预填选中食物）。

**`/glycemic-load-calculator`（迁移，不重写）**
- 现有 `App.jsx` 主体整体迁入（**以 `App.jsx` 为准，`src/App.js` 是遗留死代码，勿误迁，可删除**）：`FinderTabs` 三通道（Search/Barcode/Photo）+ `FoodCandidateList` 确认流 + `SelectedFoodSummary` + serving 输入（g/oz，`normalizeServingToGrams`）+ `CalculatorResult` + 现有 SeoGuide/FAQ 内容。
- **功能零改动**，仅两处新增：支持 `?food=` 预填；页尾插入 §6 规则生成的静态食物 GI/GL 参考表。
- 现有 e2e（app.spec.js 的搜索/条码/拍照用例）：**用例逻辑与断言不变，仅允许把入口 URL 从 `/` 改为 `/glycemic-load-calculator`**；不得删除或放松任何断言（T4-4）。（「原样通过」在迁移后逻辑上不可能——20 个用例全部 `page.goto("/")`。）

**`/`（改造为导航首页）**
- 6 个工具卡片（名称 + 一句话价值 + `<a href>`）+ 品牌介绍 + 健康声明 + 指向 /about 的链接；无任何计算功能。
- 现首页的 GL 工作流内容随主体迁往 `/glycemic-load-calculator`。

**`/about`（新建静态页）**
- 纯静态内容页（无交互），内容按 §5 表执行。

### 5A.3 PWA 与全局不回归

- `public/manifest.webmanifest`：name/short_name 改 GlucoMath（P5 时，连同 pwa.spec.js 断言，见 §4 P5-3），`start_url` 保持 `/`；
- **本次交付不含 Service Worker**（§0A-1：仓库本无 SW，PWA 仅为可安装元数据）；不得新增 SW、不得在任何页面文案/description 声称离线可用；`tests/e2e/pwa.spec.js` 必须全绿（P5 前按现断言，P5 后按更新品牌名的断言）；
- 现有条码/拍照功能的权限流与错误态（`ErrorNotice`/`DisclosureNotice`）不改动；
- 可访问性底线：每输入框有 `<label>`、输出区 aria-live、全键盘可用。

## 5B. SEO 实现规格（每页 head 文案、结构化数据、内链拓扑、技术细节）

### 5B.1 Title 与 meta description（逐页定稿文案，直接使用）

品牌名从 `src/site.config.js` 的 `BRAND` 常量读取（P5 前 = "GL Calc"，P5 后 = "GlucoMath"，与 SITE_ORIGIN 同机制切换）。Title 模板 `{页面题} | {BRAND}`：

| URL | Title（页面题部分） | Meta description |
|---|---|---|
| `/` | Free Blood Sugar & Glycemic Calculators | Free calculators for glycemic load, glycemic index, GMI, A1C to eAG, and blood sugar unit conversion. No sign-up, no ads walls, every formula source cited. |
| `/glycemic-load-calculator` | Glycemic Load Calculator – GL by Food & Serving | Calculate glycemic load from real serving sizes. Search foods, scan barcodes, or use a photo, then see GI, carbs, and GL together. GL = GI × carbs ÷ 100. |
| `/glycemic-index-calculator` | Glycemic Index Calculator – Look Up Food GI | Look up the glycemic index of common foods and see low, medium, or high GI at a glance. Includes carbs per 100 g and a direct link to calculate glycemic load. |
| `/gmi-calculator` | GMI Calculator – Glucose Management Indicator | Convert your CGM average glucose into a Glucose Management Indicator (GMI). Uses the published Bergenstal 2018 formula and explains how GMI differs from lab A1C. |
| `/a1c-to-eag-calculator` | A1C Calculator – Convert A1C to eAG | Convert A1C to estimated average glucose (eAG) in mg/dL and mmol/L using the ADAG formula (28.7 × A1C − 46.7). Includes accuracy limits and reference info. |
| `/blood-sugar-converter` | Blood Sugar Converter – mg/dL ⇄ mmol/L | Convert blood sugar between mg/dL and mmol/L instantly in both directions. Includes a reference table of common values and why the two units exist. |
| `/glucose-to-a1c-estimator` | Average Glucose to A1C Estimator | Estimate an A1C range from your average blood glucose. Shows a range, not a single number, and explains why reverse estimation has built-in uncertainty. |
| `/about` | About – Data Sources, Formulas & Disclaimer | Where our GI data and formulas come from: DiOGenes GI database, ADAG (Nathan 2008), GMI (Bergenstal 2018). Open-source attribution and medical disclaimer. |

规则：description 不逐字堆叠目标词、不超 160 字符量级（像素截断为参考非硬性，红线 3）；Google 可能改写 description，不作排名承诺。

### 5B.2 结构化数据（JSON-LD，预渲染进静态 HTML）

1. **首页 `/`**：`WebSite`（name=BRAND、url=SITE_ORIGIN）+ `WebApplication`（列表页级，applicationCategory: "HealthApplication"）。现 `index.html` 里的旧 `@graph`（WebSite+WebApplication+FAQPage）**整体拆除重建**，禁止新旧并存导致重复 schema。
2. **6 个工具页**：各一个 `WebApplication`：`name`（=页面 H1）、`url`（SITE_ORIGIN+path）、`applicationCategory: "HealthApplication"`、`operatingSystem: "Any"`、`offers: {price: 0, priceCurrency: "USD"}`、`description`（=meta description）。
3. **FAQPage**：仅当该页可见正文里有 FAQ 区块时输出，且 schema 问答文本与页面可见文本**逐字一致**（Google 富结果硬要求）；每页最多一个 FAQPage。
4. **/about**：`AboutPage` + 站点级 `Organization`（name=BRAND、url、contactPoint 指向站长联系方式）。
5. 禁用 `MedicalWebPage`/`MedicalRiskCalculator` 类型（本站无医学审阅，schema 声明须与 §7 第③项如实对齐）。
6. 验收走 T3-⑧ 与 T5 Rich Results Test。

### 5B.3 内链拓扑与锚文本

1. **全站页头导航**（`ToolPageLayout` 统一渲染，真实 `<a href>`）：Home + 6 工具页 + About，共 8 项——这保证任何一页被抓都能发现全站（修复根因链的结构性保险）。
2. **正文相关工具区**（每工具页 ≥2 条，§5 通用要求的落地位）按主题簇：
   - GL ⇄ GI 互链（正文段落内自然锚文本，如 "look up a food's glycemic index"）；
   - A1C 簇三页两两互链：a1c-to-eag ⇄ glucose-to-a1c-estimator ⇄ gmi-calculator；
   - blood-sugar-converter → A1C 簇三页（单位换算是三者的上游动作）。
3. 锚文本 = 目标词的自然语序变体；禁止全站同一锚文本逐字重复堆叠、禁止 "click here"。
4. 页脚 `ToolFooter` 全站链 `/about`（§7 第⑤项即是内链）。

### 5B.4 技术细节（P2 实施时一并落地）

- **URL 规范**：全站无尾斜杠（canonical、sitemap、内链三处一致；**根路径 `/` 天然豁免**——首页 canonical 为 `SITE_ORIGIN + "/"`，verify 脚本对根路径放行）；`vercel.json` 设 `cleanUrls: true` + `trailingSlash: false`，`/xxx/` 重定向到 `/xxx`（Vercel 返回 308，验收按 status ∈ {301,308}）。
- **`?food=` 参数**：canonical 指向无参 URL（§5A.1-5 已定）；robots.txt **不**屏蔽该参数（屏蔽会阻断 canonical 信号传递）。
- **404**：未知路由返回真实 HTTP 404 + 含全站导航的静态 `dist/404.html`（由 prerender 脚本生成，§4 P2-5）；禁止 SPA 式「软 404」（200 + 空壳）、禁止 catch-all rewrite。
- **OG/Twitter**：每页 `og:title`/`og:description` 同 5B.1，`og:url` 同 canonical，`og:type=website`；全站共用一张 `public/og-cover.png`（1200×630，含品牌名；无设计资源时可用简单纯色底+文字生成），`og:image` 用绝对 URL（SITE_ORIGIN 拼接）；P5 改品牌时重制此图（§4 P5-3）。
- **旧首页静态外壳处置**：现 `index.html` 中 hero/seo-panel/noscript 的 GL 文案随主体迁往 `/glycemic-load-calculator` 的预渲染产物；新首页不得残留旧 H1/FAQ，避免与 GL 页内容重复（预渲染后每页唯一 H1 由 T3-③ 把关）；head 硬编码标签拆除见 §4 P2-3。
- **sitemap**：8 URL；`lastmod` 真源 = 仓库内 `src/sitemap-lastmod.json`（路由 → ISO 日期的映射，页面内容实际变更时随 PR 手工更新），`prerender.mjs` 只读此文件生成——**禁止每次 build 刷新为当天**制造假新鲜度。

## 6. GI 数据质量规范（数据文件 `src/gi.json`，结构 `{名称: {gi, carbs_per_100g}}`）

背景：数据源 DiOGenes 为类别赋值表，低碳水条目大量出现编码值 GI=45/70（非实测），存在「蛋清 GI 70」类方向性错误。

1. 展示层规则（工具搜索结果与静态表统一）：`carbs_per_100g < 2.5` 的条目显示 **"GI: N/A (too little carbohydrate to measure) · GL ≈ 0"**，不显示其数值型 GI；条目保留可搜索。
2. 静态参考表（/glycemic-load-calculator 页）：只收录 `carbs_per_100g ≥ 2.5` 且非编码嫌疑的条目——编码嫌疑定义为 **`carbs_per_100g < 10` 且 GI ∈ {45, 70}**（DiOGenes 类别赋值特征组合），≥20 条，覆盖主食/水果/蔬菜/乳制品/豆类；每条注明 DiOGenes 出处，表脚标注数据等级说明。
3. 中期升级（非本次交付必做）：迁移 Atkinson 2021 表 1（ISO 26642 合规实测值）。

## 7. 页脚免责模板（全站 8 页统一 `ToolFooter`，5 项缺一不可）

```
This calculator is for informational purposes only and is not a substitute for
professional medical advice, diagnosis, or treatment.          ← ① 非诊断声明
Maintained by {维护者名，P0 提供；兜底 "the {BRAND} project"}.    ← ② 署名（品牌从 BRAND 常量读取，勿硬编码）
This tool has not been reviewed by a medical professional.      ← ③ 审阅状态（如实）
Last updated: YYYY-MM-DD.                                       ← ④ 更新日期（VITE_BUILD_DATE 注入；verify 用正则 Last updated: \d{4}-\d{2}-\d{2} 匹配，非字面串）
Data sources & contact: /about                                  ← ⑤ 联系入口
```
定位说明：此 5 项为基于 Google E-E-A-T/质量评估指南的行业最佳实践（署名有官方 strongly encourage 背书），任何文档/页面不得将其表述为「Google 官方要求」。首页与 /about 同样渲染此页脚（全站统一，消除适用范围歧义）。

## 8. Test Plan

### T0 测试基建改造（先于一切测试，否则 T3/T4 必然失败）
1. **`check` 顺序改为**：`test:unit → build（vite build + prerender）→ verify-dist → test:e2e`（现状是 unit → e2e → build，e2e 跑在产物生成之前，预渲染验收不可能通过）。
2. **Playwright 拆两个 project**（现状单一 webServer = `npm run dev`）：
   - project `static`：webServer = 对 `dist/` 起静态服务器（如 `vite preview`；须确认对 `/route` 能解析 `dist/route/index.html`，否则自写静态 server），跑 T4-2/T4-3/T4-5 与 seo.spec.js；
   - project `app`：webServer = `npm run dev`（保留 `vite.config.js` 的 barcode/photo API 中间件，§0A-2——条码/拍照用例**必须**在此 project 跑，静态服务器上无 API 必挂），跑 T4-1/T4-4 与 pwa.spec.js。
3. `seo.spec.js` 现有断言（旧首页 canonical/og/FAQPage/noscript）与新首页规格互斥，**按 §5B 重写，不是追加**。

### T1 公式单元测试 → 新建 `src/lib/formulas.js` 集中导出纯函数 + `tests/unit/formulas.test.js`（vitest）
**总规则：formulas.js 纯函数一律返回未舍入原始值，舍入只发生在展示层；数值断言一律用容差，禁止对浮点做严格相等**（例：`(139.85).toFixed(1)` 因二进制表示实际返回 "139.8"，严格相等是浮点陷阱）。

| 断言 | 黄金值（容差断言） |
|---|---|
| gl(50, 30) | \|gl − 15\| < 0.001，档位 Medium；glBand 边界：10→Low、10.5→Medium、19.99→Medium、20→High |
| mgdlToMmol(100) | \|x − 5.55\| < 0.01；mmolToMgdl(5.55) 回到 100±0.1；双向可逆误差 < 0.01 |
| eag(7.0) / eag(6.5) | \|x − 154.2\| < 0.01；\|x − **139.85**\| < 0.01（28.7×A1C−46.7；139.9 是旧版错值勿用） |
| eagMmol(7.0) | \|x − 8.54\| < 0.01（1.59×A1C−2.59） |
| a1cRange(126) | 区间端点 = [5.5, 6.6]（±0.01；按 §5A 规则：中心 6.017、半宽 0.547、端点各自舍入 0.1%），区间含 6.0 且**非单点**；输入超 A1C 4~10% 对应血糖范围（约 68~240 mg/dL 之外）返回 out-of-range 标记 |
| gmi(150) | \|x − 6.898\| < 0.001（3.31+0.02392×mgdl），展示层显示 6.9% |
| giBand | 55→低、56→中、69.5→中、70→高（连续区间无空洞） |

### T2 数据质量测试 → `tests/unit/gi-data.test.js`
- 对 `src/gi.json` 全量断言：渲染用「静态表选择器」输出的每条 `carbs_per_100g ≥ 2.5` 且非编码嫌疑（§6.2 定义）；
- 断言展示层对任一 `carbs_per_100g < 2.5` 条目返回 "GI: N/A"（抽样含**低碳水蛋清条目**——实测 carbs_per_100g 为 1.2/0.4，非零，勿按 carbs=0 找——回归锚点：不得输出数值 GI 70）；
- 静态表条目 ≥20。

### T3 构建产物断言 → 新建 `scripts/verify-dist.mjs`（build 后、e2e 前运行，CI 门禁；**用 DOM 解析器（如 node-html-parser）断言，不用 grep 行数**）
对 `dist/` 8 个 HTML 逐页断言：
①唯一 `<title>` 且等于 §5B.1 定稿文案 ②meta description 等于 §5B.1 定稿文案 ③唯一 `<h1>`
④公式关键串按页映射：`28.7` ∈ {a1c-to-eag, glucose-to-a1c}；`18.018` ∈ {blood-sugar-converter}；`0.02392` ∈ {gmi-calculator}；glycemic-load-calculator 页须含 GL 公式串（`÷ 100` 或 `/ 100` 任一写法均算通过）
⑤DOM 计数：首页内部链接 ≥7；每工具页**正文相关工具区容器内** ≥2 条内链（页头 8 项导航单独断言存在，不计入此数——否则导航让「≥2」恒真，测不到 §5B.3-2）
⑥canonical = SITE_ORIGIN+自身路径且无尾斜杠（**根路径 `/` 豁免**），og:url 与之一致、og:image 为绝对 URL
⑦免责 5 项匹配：①②③⑤按字面串、④按正则 `Last updated: \d{4}-\d{2}-\d{2}`（全站 8 页统一页脚，§7）
⑧JSON-LD 类型符合 §5B.2（6 工具页 WebApplication、FAQPage 问答与可见文本逐字一致、全站无 MedicalWebPage）
⑨/about 含 "DiOGenes" 与 "MIT"，且全站 **不含 "Harvard"**、不含「离线可用/works offline」类表述
⑩**仅 P5 后启用**（P5 前输出 SKIPPED 不算失败）：全产物 grep "glcalc.vercel.app" 零命中、GA4 无 hostname 条件。

### T4 E2E（Playwright，按 T0 双 project 分工）
1. [app] 4 个数值工具页输入→输出等于 T1 黄金值（展示层舍入后的显示值）；GL 页用「选定 gi.json 指定条目 + 设 serving → 断言显示 GL 与 `gl()` 计算值一致」验证（GL 页无直接数值输入，`gl(50,30)` 不适用 UI；GI 页为查询页，走搜索断言）；
2. [static] **`javaScriptEnabled: false` 直访每路由**：200 + 该页 H1 + 公式文字可见（预渲染核心验收）；
3. [static] 首页链接点击可达其余 7 页；请求 `/no-such-page` 断言 HTTP 404（防软 404 回归）；
4. [app] 现有食物搜索/条码/拍照用例（入口 URL 允许按 §5A.2 改为 `/glycemic-load-calculator`，断言不变）与 `pwa.spec.js` 全部通过；
5. [static] `?food=` 深链：`/glycemic-load-calculator?food=<存在条目>` 预填生效，且该页 canonical 仍为无参 URL。

### T5 结构化数据与性能（人工/工具，非 CI）
Rich Results Test 每页无错误；Lighthouse mobile ≥70（工程门槛，非排名规则）。

### T6 上线后验收（GSC，禁 site:）
第 2 个月索引报告 ≥5 页；第 3 个月平均排名 ≤35 且季度展示 ≥2,000；第 6 个月季度 clicks ≥40；第 9~12 个月 a1c 族 ≥1 词进前 30、季度 clicks ≥150（基线：4 clicks/季度）。每周导出效果 CSV 存 `.gsc-export/` 与 `docs/2026-09-09-gsc-baseline.md` 对比。

## 9. 禁止事项（红线）

1. 禁迁移 Next/Astro/重写应用；2. 禁 `site:` 做任何验收；3. 禁字数/Title 长度硬阈值与注水内容；4. 禁对用户输入的 A1c/eAG/GMI 值输出诊断判定；5. 禁把反解式标注为 ADAG、禁把 DiOGenes 写成权威源或写「哈佛」；6. 禁 glcalc 品牌变体；7. 禁把哥飞 KD/linkBudget 或任何单一口径数字标注为「已验证」；8. 禁删除上游 LICENSE 或遗漏 MIT 署名。

## 10. 交付清单

- [ ] T0 测试基建改造完成（check 顺序、Playwright 双 project、seo.spec.js 重写）；
- [ ] P1~P4 代码合入，`npm run check` 全绿输出附上；§5A 逐工具功能规格全部实现（含 GL 页零改动迁移与 `?food=` 预填）；§5B head 文案/JSON-LD/内链拓扑/404/尾斜杠策略逐项落地；
- [ ] `scripts/verify-dist.mjs` 运行输出附上（**P5 前：①~⑨ 全过 + ⑩ 标记 SKIPPED；P5 后：10 项全过**）；
- [ ] 新增/修改文件清单与差异摘要；
- [ ] §3 数据是否重拉的声明（重拉则附新表并标注口径；未重拉则标注「沿用 2026-09 快照」）；
- [ ] P5 状态：域名就绪则完成并附 301/GSC 证据；未就绪则列出等待项;
- [ ] 与 §9 红线逐条自查确认。

*v2.2 ｜ 2026-09-12 ｜ 综合来源：Spec v1.0/v1.1 与 19 条核查往来、四路对抗性审查（医学公式/SEO 技术/开源归属/第一性原理）、GSC 实测基线、哥飞后续修正（22,200 口径恢复、canonical/GA4 雷区、预渲染选型、GMI 判断）、仓库实况核查（gi.json 结构、index.html、robots/sitemap、测试目录）、v2.1 对抗性复审（修复 4 Critical：无 SW 实况 / e2e 基建互斥 / api 后端遗漏 / eag(6.5) 黄金值错误；及 15 Important）。*
