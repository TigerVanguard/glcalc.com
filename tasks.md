# 任务清单（真源：docs/2026-09-12-execution-spec-v2.2.md §4/§8）

> **执行单元**：Spec 已拆为 17 张可独立执行+验证的 ticket，见 `.scratch/glucomath-rebuild/issues/`（每张含 What to build / Blocked by / 验收命令）。子代理按 ticket 认领执行；本文件是状态总账，ticket 开始/完成时同步更新对应条目。frontier 规则：只认领所有 Blocked-by 均已完成的 ticket。

**协议**（与 AGENTS.md 一致）：动手前把对应条目改 `[~]` 并填开始时间；完成且验证通过后改 `[x]` 并填完成时间+证据；受阻改 `[!]` 并写原因。同一时刻只允许一个 `[~]`。新任务先登记再执行。

格式：`- [状态] 任务 ｜开始: ｜完成: ｜证据/备注:`

## P0 人类依赖（Agent 无法代办，只登记状态）

- [!] 购买 glucomath.com（Spaceship；溢价则备选 glucoconvert → glycocalc → a1cmate）｜备注: 等站长确认，不阻塞 P1~P4
- [!] GSC 域名验证 DNS TXT ｜备注: 等站长
- [!] 提供维护者署名与联系方式 ｜备注: 未提供时用兜底串 "Maintained by the {BRAND} project"

## T0 测试基建改造（先于一切开发任务，Spec §8 T0）

- [x] ticket 03：多页骨架 + 预渲染管线 + 测试基建（覆盖本节 3 项及 P2 的路由/site.config/prerender/vercel.json/BUILD_DATE）｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: `npm run check` 全链路绿：unit 4 文件 33/33 → build+prerender 8 路由+404.html → verify-dist 骨架全过 → e2e 双 project 33/33（static 10 + app 23，app/pwa/seo 零改动）。静态服务器自写 scripts/serve-dist.mjs（vite preview 会 SPA 回退产生软 404，弃用）；根路由无双 H1（React render 整树替换 #root 静态外壳后快照）。独立验证 PASS（第 1 轮）：验证者亲跑 check 115s 全绿 + curl 实测 404/308/200 + spec 零改动核对。备忘: seo.spec.js 重写时迁 static project（ticket 04）

- [x] `check` 脚本顺序改为 unit → build（含 prerender）→ verify-dist → e2e ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: package.json check=`test:unit && build && verify-dist && test:e2e`，全绿（ticket 03）
- [x] Playwright 拆双 project：static（dist 静态服务器）/ app（npm run dev 含 API 中间件）｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: playwright.config.js 双 project + 双 webServer（static=serve-dist.mjs 404 模式 :4184，app=npm run dev :4183）；static 跑 prerender.spec.js，app 跑 app/pwa/seo（ticket 03）
- [x] `tests/e2e/seo.spec.js` 按 §5B 重写（非追加）｜开始: 2026-09-13 01:40 ｜完成: 2026-09-13 01:58 ｜证据: 全量重写并迁入 static project（playwright.config testMatch: static=(prerender|seo)，app=(app|pwa)）；禁 JS 抽查 4 页 title/canonical/JSON-LD + FAQPage 仅 GL 页 + robots/sitemap + GA4 无门；e2e 41/41 绿（ticket 04）

## P1 义务补齐（可单独合入；导航与 /about 必须随 P2 部署）

- [x] README 顶部补 MIT 上游署名（assafmo/glcalc.com）｜开始: 2026-09-13 08:05 ｜完成: 2026-09-13 08:15 ｜证据: README.md 顶部加 "Based on the open-source project [glcalc.com](https://github.com/assafmo/glcalc.com) by Assaf Morami, MIT License, © 2018" + LICENSE 指引；LICENSE 未改动（git status 无条目、git diff 为空，原 "Copyright (c) 2018 Assaf Morami" 版权行本就存在）（ticket 13）
- [x] 移除 index.html GA4 hostname 门（第 23~25 行）｜开始: 2026-09-13 01:40 ｜完成: 2026-09-13 01:58 ｜证据: gtag config 改无条件；verify-dist 每页断言含 config 串且无 window.location.hostname + seo.spec 同断言，全绿（ticket 04）

## P2 多页化（核心工程，Spec §4 P2 + §5A/§5B）

- [x] `src/site.config.js`：SITE_ORIGIN + BRAND 常量 ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: SITE_ORIGIN/BRAND 均带 VITE_ 环境变量覆盖（ticket 03）
- [x] 引入 react-router v6，8 路由 + `src/pages/` 8 个页面组件 ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: react-router-dom@6.30.6；`/` 渲染现有 App 不动，7 个占位页组件含 §5 定稿 H1；页面内容属 ticket 04+（ticket 03）
- [x] `src/lib/formulas.js` 纯函数集 + `tests/unit/formulas.test.js`（T1 全表容差断言）（ticket 01）｜开始: 2026-09-13 00:45 ｜完成: 2026-09-13 01:05 ｜证据: 独立验证 PASS（第 1 轮）：验证者亲跑 `npm run test:unit` 4 文件 33/33 绿；逐行复算 eag(6.5)=139.85、gmi(150)=6.898、a1cRange(126)=[5.5,6.6]、18.018 换算；断言全容差式；gl.js 委托保真、无越界改动
- [x] 共享组件：NumberField / UnitToggle / ResultCard / ToolPageLayout / ToolFooter ｜开始: ｜完成: 2026-09-13 03:11 ｜证据: ToolPageLayout/ToolFooter（另加 SiteNav/RelatedTools）由 ticket 06 落地；NumberField（type=text+inputMode=decimal、label 关联、aria-invalid）/ UnitToggle（受控，切换时经 formulas 换算已输入值到新单位显示精度）/ ResultCard（stat/pill 视觉语言、整卡 aria-live=polite、空态占位）由 ticket 07 落地（src/features/common/），显示舍入/解析共用 src/lib/display.js
- [x] 每路由独立 head：落地 §5B.1 逐页定稿 title/description 文案 + 拆除 index.html 硬编码页面级 head（§4 P2-3，防双 title/canonical）（ticket 04，含 JSON-LD/og-cover/sitemap 三项）｜开始: 2026-09-13 01:40（原登记 02:40 为误值）｜完成: 2026-09-13 01:58 ｜证据: 自写 src/seo/HeadManager.jsx（useLayoutEffect，早于 render 回调标记，零依赖）+ src/seo/pageSeo.js 定稿配置；index.html 拆除 title/canonical/description/robots/og/twitter/@graph（PWA meta 保留，pwa.spec 依赖）；`npm run check` 全绿：unit 47/47 → build+prerender 8 路由 → verify-dist 全 PASS（T3 ①②③⑥⑧⑨+⑩SKIPPED）→ e2e 41/41
- [x] JSON-LD 按 §5B.2 分页配置（工具页 WebApplication、FAQPage 逐字一致、/about AboutPage+Organization、禁 MedicalWebPage）｜开始: 2026-09-13 01:40 ｜完成: 2026-09-13 01:58 ｜证据: 首页 WebSite+WebApplication、6 工具页各一 WebApplication（name=H1、offers 0 USD、description=meta）、FAQPage 仅 GL 页且问答与可见文本同源（src/data/glFaq.js，App.jsx 与 schema 共用）、/about AboutPage+Organization（contactPoint=GitHub issues 兜底）；verify-dist T3-⑧ 全 PASS、全站无 MedicalWebPage（ticket 04）
- [x] 内链拓扑按 §5B.3：页头 8 项导航（ToolPageLayout 渲染）+ 各页正文相关工具区 ≥2 条（GL⇄GI、A1C 簇两两互链、converter→A1C 簇）+ 锚文本规则 ｜开始: 2026-09-13 03:15 ｜完成: 2026-09-13 02:35 ｜证据: SiteNav 8 项真实 `<a href>` 全站渲染；related-tools 容器：GL⇄GI 互链、GL/GI→converter、A1C 簇三页两两互链、converter→A1C 簇三页；13 处锚文本全站无逐字重复、无 click here；verify-dist T3-⑤ 断言 nav 8 项+容器内 ≥2 且不计导航（ticket 06）
- [x] 制作 `public/og-cover.png` 初版（1200×630 含品牌名，纯色底+文字即可）+ 每页 og 标签（§5B.4）｜开始: 2026-09-13 01:40 ｜完成: 2026-09-13 01:58 ｜证据: scripts/generate-og-cover.mjs（Playwright 截图 1200×630，读 VITE_BRAND，P5 重制可重跑）生成；每页 og:title/description/url/type/image+twitter:card 由 HeadManager 输出，verify-dist T3-⑥ og:image 绝对 URL 全 PASS（ticket 04）
- [x] `scripts/prerender.mjs`（静态服务器须 SPA 回退到 dist/index.html）+ build 脚本接入 ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: build=`vite build && node scripts/prerender.mjs`；内部 SPA 回退服务器 + Playwright chromium 逐路由快照，先全部渲染再写盘（防根 index.html 被覆写污染回退）；含 dist/404.html 生成；sitemap/robots 未动（ticket 04）
- [x] sitemap（真源 `src/sitemap-lastmod.json`）+ robots 重写 + `dist/404.html` 生成 ｜开始: 2026-09-13 01:40 ｜完成: 2026-09-13 01:58 ｜证据: src/sitemap-lastmod.json（8 路由→ISO 日期，2026-09-13 初始化）；prerender.mjs 末尾只读真源生成 dist/sitemap.xml（8 URL+lastmod，路由/真源双向校验不符即抛错）+ 重写 robots.txt（Allow all + Sitemap 行）；404.html 属 ticket 03 已有；verify-dist sitemap/robots 断言全 PASS（ticket 04）
- [x] `vercel.json`：cleanUrls + trailingSlash:false，禁 catch-all rewrite ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: 仅两键无 rewrites；verify-dist 断言核对 + static e2e 断言 /about/ → 308 /about（本地模拟）（ticket 03）
- [x] `VITE_BUILD_DATE` 注入机制 ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: vite.config.js define 注入构建当天 ISO 日期；消费方 ToolFooter 属后续 ticket（ticket 03）

## P3 内容页实现（Spec §5/§5A 逐页）

- [x] `/`（导航首页：6 工具卡片 + 品牌介绍 + 健康声明）（ticket 06，含布局/内链/页脚）｜开始: 2026-09-13 03:15 ｜完成: 2026-09-13 02:35 ｜证据: `npm run check` 全绿：unit 47/47 → build+prerender 8 路由 → verify-dist 全 PASS（新增 T3-⑤ 首页正文内链 7 条/工具页 related-tools ≥2/每页 SiteNav 恰 8 项 + T3-⑦ 页脚 5 项字面串+日期正则）→ e2e 49/49（+8 新增 static 用例：首页真实点击可达其余 7 页、8 页统一页脚）。新组件 SiteNav/ToolFooter/RelatedTools/ToolPageLayout（src/features/common/）；8 页全套布局，GL 页 App 内部零改动；现有 app/pwa/seo 测试零改动全过
- [x] `/glycemic-load-calculator`（App.jsx 主体迁移，勿迁 App.js；+ ?food= 预填；静态食物表属 ticket 12）（ticket 05）｜开始: 2026-09-13 01:23 ｜完成: 2026-09-13 01:32 ｜证据: npm run check 全绿（unit 47 通过；build+prerender 8 路由；verify-dist 全 PASS；e2e 36 通过含 3 条新增 ?food= 用例）；App.js 已删除；app.spec.js 仅改 goto 目标（20 处 "/" → "/glycemic-load-calculator"），断言零删改；/ 改渲染 HomePage 占位（H1 "Free Blood Sugar & Glycemic Calculators"），prerender.mjs 与 prerender.spec.js 的 / H1 期望同步
- [x] `/glycemic-index-calculator`（复用 FoodSearch/SearchWorker，GI 分档连续区间）（ticket 11）｜开始: 2026-09-13 05:50 ｜完成: 2026-09-13 06:10 ｜证据: `npm run check` 全绿：unit 6 文件 71/71（零改动）→ build+prerender 8 路由 → verify-dist 全 PASS（新增 T3-④ gi 行：.gi-static-table 恰 1 个 27 行、抽查 Rye bread 89/High/47 + Apple 38/Low/11.1（硬编码独立于 giData.js）、诚实口径关键词 DiOGenes/category-level/not individually measured、"Glycemic index vs glycemic load" 段、N/A 串不出现在静态表；FAQPage 白名单+gi 页）→ e2e 84/84（+5 条 app gi.spec.js：Banana 52/Low/19.4+URL 不写输入、Rye bread 89/High+深链 href 编码 ?food=Rye%20bread、点深链跨页断言 GL 页 Shared link 预填+Estimated glycemic load、蛋清 "Egg. chicken. white. raw" 选中→GI: N/A (too little carbohydrate to measure) · GL ≈ 0 且面板无 "70" 无分档 pill（下拉 pill 也走 §6.1 规则显示 GI: N/A）、无匹配/清空查询 No matches yet；+1 条 static 禁 JS：27 行表/诚实口径/GI vs GL/FAQ 4 条/结果区仅占位/表内无 N/A）。搜索复用：SearchWorker 零改动；FoodSearch 仅加可选 resultPill prop（默认值逐字节复刻原 pill 渲染，GL 页不传 prop 行为不变，app.spec.js 20+ 用例零改动全绿）；GI 页结果面板无 serving/GL 计算，深链复用 ticket 05 ?food= 机制（encodeURIComponent 键名）；related-tools 区未动；FAQ 同源 src/data/giFaq.js（可见块与 pageSeo.js FAQPage 共用，4 条含 N/A 必问）
- [x] `/gmi-calculator`（ticket 10）｜开始: 2026-09-13 05:00 ｜完成: 2026-09-13 05:20 ｜证据: `npm run check` 全绿：unit 6 文件 71/71（+display.test.js formatGmi 6 条：gmi(150)=6.898→"6.9" T1 黄金值、gmi(154)=6.99368→"7.0" 进位、8.3 mmol=149.5494→"6.9"（判别对：8.3 直代=3.5）、6.25→6.3 half-up、gmi(125) 噪声 6.300000000000001→6.3、补零 7→7.0/gmi(700)→20.1）→ build+prerender 8 路由 → verify-dist 全 PASS（新增 T3-④ gmi 行：0.02392+3.31+Bergenstal+±0.5 差异+"not a data error"+"cannot replace a laboratory A1C"；负向：.gmi-panel 恰 1 个、预渲染无任何 %、无 normal/prediabetes/diabetes；FAQPage 白名单+gmi 页）→ e2e 78/78（+7 条 app gmi.spec.js：150→6.9%+回显 8.3 mmol/L+URL 不写输入、154→7.0% 进位、mmol 8.3→6.9%+回显 150 mg/dL（非 3.5% 判别）、700 超传感器范围警示不阻断仍出 20.1%、UnitToggle 双向 150⇄8.3、非法清空+回显消失、空态无 NaN；+1 条 static 禁 JS：公式串/Bergenstal/±0.5/差异说明/FAQ 4 条可见+panel 无 %）。formatGmi 沿用 formatEag 的 toPrecision(12) 噪声防护+half-up；超范围阈值自定为 CGM 传感器上报范围 40~400 mg/dL（Dexcom/Libre 上限约 400，均值超出必非真实 CGM 数据），警示不阻断；FAQ 同源 src/data/gmiFaq.js（可见块与 pageSeo.js FAQPage 共用，4 条含 ticket 必问两条）；related-tools 区未动；判定词纪律：Diabetes Care 引用只在 panel 外静态区
- [x] `/a1c-to-eag-calculator`（参考区间不匹配用户输入，红线 D4）（ticket 08）｜开始: 2026-09-13 04:30 ｜完成: 2026-09-13 03:47 ｜证据: `npm run check` 全绿：unit 6 文件 60/60（+display.test.js formatEag 5 条：154.2/139.9/8.5/53.8·3.0/125.5·7.0·154.0）→ build+prerender 8 路由 → verify-dist 全 PASS（新增 T3-④ a1c 行：28.7+Nathan+507+15.7、.a1c-reference-table 恰 1 个 3 静态行、D4 负向：.a1c-calculator-panel 无 normal/prediabetes/diabetes 且表无高亮 class/aria-current；FAQPage 白名单 +a1c 页）→ e2e 62/62（+6 条 app a1c.spec.js：7.0→154.2/8.5、6.5→139.9 浮点陷阱、3.5 出结果+ADAG 警示、D4 用例 6.0 结果区无判定词+表 innerHTML 输入前后逐字节相等、非法清空、空态无 NaN；+1 条 static 禁 JS：公式串/Nathan/507/15.7/区间表 3 行/FAQ 3 条可见）。eAG 显示规则：双单位均 1 位小数 half-up，先 toPrecision(12) 消二进制噪声（raw eag(6.5)=139.84999999999997，naive 舍入错出 139.8）；FAQ 同源 src/data/a1cToEagFaq.js（可见块与 pageSeo.js FAQPage 共用）；related-tools 区未动
- [x] `/blood-sugar-converter`（双向绑定）（ticket 07，含 NumberField/UnitToggle/ResultCard 共享组件）｜开始: 2026-09-13 03:50 ｜完成: 2026-09-13 03:11 ｜证据: `npm run check` 全绿：unit 6 文件 55/55（+display.test.js 8 条锚定显示舍入黄金值）→ build+prerender 8 路由 → verify-dist 全 PASS（新增 T3-④ converter 行：18.018 串 + 对照表 6 行硬编码键值对；converter 改 FAQPage+WebApplication）→ e2e 55/55（+5 条 app converter.spec.js：100→5.6/5.5→99/非法清空/1200 警示/空输入无 NaN；+1 条 static：禁 JS 公式/对照表/FAQ 可见）。真源=最后编辑侧原始文本，另一侧经 formulas 原始值派生显示；显示舍入集中 src/lib/display.js（mg/dL 整数、mmol 1 位小数 half-up）；FAQ 同源 src/data/bloodSugarConverterFaq.js（页面可见块与 pageSeo.js FAQPage 共用，seo.spec FAQPage 白名单改为 GL+converter 两页）
- [x] `/glucose-to-a1c-estimator`（只输出区间，端点各自舍入 0.1%）（ticket 09）｜开始: 2026-09-13 05:10 ｜完成: 2026-09-13 04:40 ｜证据: `npm run check` 全绿：unit 6 文件 65/65（+display.test.js formatA1cRange 5 条：126→"≈ 5.5% – 6.6%"、7.0 mmol=126.126 同区间、判别对 10.0 mmol=180.18→8.5 vs 180→8.4、50 超范围仍出区间 2.8–3.9、区间形状正则）→ build+prerender 8 路由 → verify-dist 全 PASS（新增 T3-④ estimator 行：28.7+反向公式串+15.7+algebraic/asymmetric；负向：.estimator-panel 恰 1 张结果卡、预渲染无任何 %、无判定词、"ADAG formula" 仅存在于指向 a1c-to-eag 的 related-tools 上下文；FAQPage 白名单+estimator 页）→ e2e 70/70（+7 条 app estimator.spec.js：126→5.5–6.6、mmol 7.0→同区间、无单点断言（唯一 .stat__value 匹配区间正则）、50 超范围区间+警示、UnitToggle 首覆盖双向换算 180⇄10.0（8.4/8.5 判别）、非法清空、空态无 NaN+URL 不写输入；+1 条 static 禁 JS：公式串/15.7/algebraic/asymmetric/FAQ 3 条可见+panel 无 % 无 ADAG formula）。UnitToggle 首次使用未发现缺陷；FAQ 同源 src/data/glucoseToA1cFaq.js（可见块与 pageSeo.js FAQPage 共用）；related-tools 区未动；页面无教育性分档表（D4 按 ticket 09 建议用 FAQ 讲解替代）
- [x] 【第 2 批三页开工前】竞品精评（ticket 16）｜完成: 2026-09-13 ｜证据: 跳过——执行环境无选词/盘面工具，按 ticket 16 无工具分支登记，不臆造数据；08/09/10 按 Spec 现有规格执行
- [x] ticket 12：GL 页静态食物参考表（27 条含典型份量 GL/分档、glycaemic 英拼、how-to 段、N/A 条目 GL 页交互闭环、verify-dist T3-④ GL 行）｜开始: 2026-09-13 06:40 ｜完成: 2026-09-13 07:30 ｜证据: `npm run check` 全绿：unit 7 文件 74/74（+gl-static-table.test.js 3 条：27 行/逐行 GL=formulas.gl 容差断言+分档取未舍入值/黄金 3 行 Rye bread 12.549→"12.5" Medium、Watermelon 7.3872→"7.4" Low、Couscous 22.425→"22.4" High 且三档齐备）→ build+prerender 8 路由 → verify-dist 全 PASS（新增 T3-④ GL 行：公式串 ÷100 或 /100、.gl-static-table 恰 1 个 27 行、黄金 2 行手算硬编码（Rye bread 30g→12.5 Medium / Watermelon 120g→7.4 Low，独立于 glStaticTable.js）、分档边界 "≤ 10"/"≥ 20"、"glycaemic" 英拼、DiOGenes 出处、表内无 N/A 无 Egg 编码嫌疑）→ e2e 89/89（+4 条 app app.spec.js 新 describe：蛋清 ?food= 深链→结果区 GL ≈ 0 + GI: N/A (too little carbohydrate to measure) 无 "70" 无 pill、蛋清经搜索下拉 pill 显示 GI: N/A 且确认后同语义（改 serving 也不出数值）、Blueberries 数值流回归护栏 4.95、静态表 27 行+Rye bread golden 行+边界语义可见；+1 条 static 禁 JS prerender.spec.js：27 行表/12.5/1 slice (30 g)/无 N/A 无 Egg/≤10 ≥20/glycaemic/DiOGenes/how-to 段/FAQ 5 条含新 band 问答）。份量口径：国际 GI 表名义份量硬编码 src/data/glStaticTable.js（面包 30g/片、水果 120g/个、蔬菜 80g、奶 250g、熟意面 180g、豆类 150g、冰淇淋 50g/球；couscous、生鹰嘴豆按干重 50g 标注 dry；parsnip 用 100g 避开 80g 名义份量恰落 10.0 分档边界）；GL 构建时经 formulas.gl 计算、glBand 取未舍入值、显示 1 位小数。App.jsx 零改动（N/A 分支在 CalculatorResult.jsx；FoodSearch defaultResultPill 走 §6.1 规则，合规条目 pill 逐字节不变）；app.spec.js 97 行纯追加 0 删改；GI 页/其他页零改动；glFaq.js 纯追加 1 条（原 4 条冻结，JSON-LD 同源自动同步）
- [x] `/about`（DiOGenes 来源 + 公式出处 + MIT 署名 + 联系方式）（ticket 13，含 P1 README MIT 署名）｜开始: 2026-09-13 08:05 ｜完成: 2026-09-13 08:15 ｜证据: `npm run check` 全绿（.scratch/ticket13-check.log）：unit 7 文件 74/74（零改动）→ build+prerender 8 路由 → verify-dist 全 PASS（新增 T3-⑨ /about 正向断言：DiOGenes/Aston/category-level/Atkinson/Nathan/Bergenstal/MIT/Assaf Morami + assafmo 仓库链接 + GitHub Issues 联系链接（可见 <a> + Organization contactPoint 双断言，URL 独立硬编码）；原 Harvard/works offline 全站负向断言保留）→ e2e 90/90（+1 条 static 禁 JS 直访 /about：数据出处段（含 "no longer maintained"）/公式引文（含 18.018）/MIT 归属+上游仓库链接可见/维护者兜底串+Issues 链接可见/医学审阅状态+NGSP 免责）。AboutPage.jsx 六段正体：站点定位（教育用途）、DiOGenes 诚实口径（类别赋值+已停维护+建议交叉核对 Sydney/Atkinson 2021 升级路径）、公式出处四条（GL 定义/Nathan 2008/Bergenstal 2018/18.018）、MIT 归属（assafmo/glcalc.com 链接）、维护者+联系（CONTACT_URL 同源 pageSeo.js）+ 审阅状态、完整免责段（NGSP 认证实验室）；无 related-tools（页脚全站链入）；JSON-LD 沿用 ticket 04 不动；sitemap-lastmod /about 已是 2026-09-13 未动
- [ ] 现有 app.spec.js 入口 URL 迁移（仅改 goto 目标，断言不变）｜开始: ｜完成: ｜证据:

## P4 数据质量管道（Spec §6）

- [x] 展示层规则：carbs_per_100g < 2.5 → "GI: N/A · GL ≈ 0"（ticket 02，含下两项）｜开始: 2026-09-13 01:45 ｜完成: 2026-09-13 01:19 ｜证据: `src/lib/giData.js` giDisplayRule 纯函数 + 规格化展示常量（GI_NA_LABEL/GL_APPROX_ZERO_LABEL/GI_NA_FULL_LABEL）；`npm run test:unit` 5 文件 47/47 绿（gi-data 14 新增）；对全量 573 条 carbs<2.5 条目断言 N/A 语义。独立验证 PASS（第 1 轮）：验证者实跑选择器逐条核对 27 条全合规、随机 3 条与 gi.json 原值一致、蛋清无 70 泄漏
- [x] 静态表选择器（≥2.5 且非编码嫌疑 <10 ∧ GI∈{45,70}，≥20 条）｜开始: 2026-09-13 01:45 ｜完成: 2026-09-13 01:19 ｜证据: selectStaticTable 固定名单 27 条（主食6/水果6/蔬菜5/乳制品5/豆类5），逐条校验存在性+合规性，违规抛错不静默跳过（ticket 02）
- [x] `tests/unit/gi-data.test.js`（含低碳水蛋清回归锚点）｜开始: 2026-09-13 01:45 ｜完成: 2026-09-13 01:19 ｜证据: 蛋清锚点 "Egg. chicken. white. raw"(carbs 1.2)/"Egg Chicken White Raw"(carbs 0.4) 断言返回 N/A 且展示结构零处出现 70；合规条目 Rye bread 89/High、Apple 38/Low、Couscous 65/Medium（ticket 02）

## 验收（Spec §8）

- [ ] `scripts/verify-dist.mjs`（DOM 解析断言，P5 前 ①~⑨ + ⑩ SKIPPED）｜开始: ｜完成: ｜证据: ticket 04 已落地 ①②③⑥⑧⑨（⑨ 仅禁 Harvard/works offline，/about 正体断言属 ticket 13）+ ⑩ SKIPPED + sitemap/robots/GA4 断言；ticket 06 已落地 ⑤（首页正文内链 ≥7 排除 nav/footer、工具页 related-tools 容器内 ≥2 不计导航、每页 nav 恰 8 项）+ ⑦（页脚 5 项：①②③⑤字面串、④日期正则）；④公式串属后续 ticket
- [ ] T4 e2e 全绿（static + app 双 project，含 404 状态断言、?food= 深链）｜开始: ｜完成: ｜证据:
- [ ] `npm run check` 全绿 ｜开始: ｜完成: ｜证据:
- [ ] T5 Rich Results Test + Lighthouse mobile ≥70（人工）｜开始: ｜完成: ｜证据:
- [ ] Spec §9 红线逐条自查 ｜开始: ｜完成: ｜证据:
- [ ] §3 数据口径声明：重拉选词数据（有工具）或标注「沿用 2026-09 快照，未重验」（Spec §3-4 / §10）｜开始: ｜完成: ｜证据:
- [ ] 交付说明：新增/修改文件清单 + 差异摘要 + 竞品情报记录（Spec §10）｜开始: ｜完成: ｜证据:

## P5 域名切换（阻塞于 P0 域名购买）

- [!] Vercel 绑定 glucomath.com + VITE_SITE_ORIGIN 重 build ｜备注: 等 P0
- [!] 旧域全路径重定向（断言 status ∈ {301,308}）｜备注: 等 P0
- [!] 品牌名切换（BRAND + manifest + pwa.spec.js 断言 + og-cover 重制）｜备注: 等 P0
- [!] GSC 新资源 + sitemap 提交 ｜备注: 等 P0
- [!] verify-dist ⑩ 启用（glcalc.vercel.app 零命中）｜备注: 等 P0

## T6 上线后验收（GSC，禁 site:；长期跟踪，Spec §8 T6）

- [ ] 每周导出 GSC 效果 CSV 存 `.gsc-export/`，与 docs/2026-09-09-gsc-baseline.md 对比 ｜备注: 上线后启动
- [ ] 第 2 个月门槛：索引报告 ≥5 页 ｜备注: 未达标须回查预渲染/内链
- [ ] 第 3 个月门槛：平均排名 ≤35 且季度展示 ≥2,000 ｜备注:
- [ ] 第 6 个月门槛：季度 clicks ≥40 ｜备注:
- [ ] 第 9~12 个月门槛：a1c 族 ≥1 词进前 30、季度 clicks ≥150（基线 4）｜备注:

## 已完成（本会话，规划阶段）

- [x] GSC 基线报告 ｜完成: 2026-09-09 ｜证据: docs/2026-09-09-gsc-baseline.md
- [x] Spec v2.0（综合全部 comment）｜完成: 2026-09-10 ｜证据: docs/2026-09-10-seo-spec-v2.md
- [x] 品牌决策 GlucoMath + 域名预算方案（≤$10/年，Spaceship $3.94 首年）｜完成: 2026-09-11 ｜证据: Spec v2.0 §3 D0-2
- [x] 执行 Spec v2.1（功能规格 §5A + SEO 实现规格 §5B）｜完成: 2026-09-12 ｜证据: docs 文件
- [x] 对抗性复审 + 修复 4 Critical / 15 Important → Spec v2.2 ｜完成: 2026-09-12 ｜证据: docs/2026-09-12-execution-spec-v2.2.md 版本注记
