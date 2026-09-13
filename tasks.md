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
- [ ] `tests/e2e/seo.spec.js` 按 §5B 重写（非追加）｜开始: ｜完成: ｜证据:

## P1 义务补齐（可单独合入；导航与 /about 必须随 P2 部署）

- [ ] README 顶部补 MIT 上游署名（assafmo/glcalc.com）｜开始: ｜完成: ｜证据:
- [ ] 移除 index.html GA4 hostname 门（第 23~25 行）｜开始: ｜完成: ｜证据:

## P2 多页化（核心工程，Spec §4 P2 + §5A/§5B）

- [x] `src/site.config.js`：SITE_ORIGIN + BRAND 常量 ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: SITE_ORIGIN/BRAND 均带 VITE_ 环境变量覆盖（ticket 03）
- [x] 引入 react-router v6，8 路由 + `src/pages/` 8 个页面组件 ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: react-router-dom@6.30.6；`/` 渲染现有 App 不动，7 个占位页组件含 §5 定稿 H1；页面内容属 ticket 04+（ticket 03）
- [x] `src/lib/formulas.js` 纯函数集 + `tests/unit/formulas.test.js`（T1 全表容差断言）（ticket 01）｜开始: 2026-09-13 00:45 ｜完成: 2026-09-13 01:05 ｜证据: 独立验证 PASS（第 1 轮）：验证者亲跑 `npm run test:unit` 4 文件 33/33 绿；逐行复算 eag(6.5)=139.85、gmi(150)=6.898、a1cRange(126)=[5.5,6.6]、18.018 换算；断言全容差式；gl.js 委托保真、无越界改动
- [ ] 共享组件：NumberField / UnitToggle / ResultCard / ToolPageLayout / ToolFooter ｜开始: ｜完成: ｜证据:
- [ ] 每路由独立 head：落地 §5B.1 逐页定稿 title/description 文案 + 拆除 index.html 硬编码页面级 head（§4 P2-3，防双 title/canonical）｜开始: ｜完成: ｜证据:
- [ ] JSON-LD 按 §5B.2 分页配置（工具页 WebApplication、FAQPage 逐字一致、/about AboutPage+Organization、禁 MedicalWebPage）｜开始: ｜完成: ｜证据:
- [ ] 内链拓扑按 §5B.3：页头 8 项导航（ToolPageLayout 渲染）+ 各页正文相关工具区 ≥2 条（GL⇄GI、A1C 簇两两互链、converter→A1C 簇）+ 锚文本规则 ｜开始: ｜完成: ｜证据:
- [ ] 制作 `public/og-cover.png` 初版（1200×630 含品牌名，纯色底+文字即可）+ 每页 og 标签（§5B.4）｜开始: ｜完成: ｜证据:
- [x] `scripts/prerender.mjs`（静态服务器须 SPA 回退到 dist/index.html）+ build 脚本接入 ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: build=`vite build && node scripts/prerender.mjs`；内部 SPA 回退服务器 + Playwright chromium 逐路由快照，先全部渲染再写盘（防根 index.html 被覆写污染回退）；含 dist/404.html 生成；sitemap/robots 未动（ticket 04）
- [ ] sitemap（真源 `src/sitemap-lastmod.json`）+ robots 重写 + `dist/404.html` 生成 ｜开始: ｜完成: ｜证据:
- [x] `vercel.json`：cleanUrls + trailingSlash:false，禁 catch-all rewrite ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: 仅两键无 rewrites；verify-dist 断言核对 + static e2e 断言 /about/ → 308 /about（本地模拟）（ticket 03）
- [x] `VITE_BUILD_DATE` 注入机制 ｜开始: 2026-09-13 01:10 ｜完成: 2026-09-13 01:15 ｜证据: vite.config.js define 注入构建当天 ISO 日期；消费方 ToolFooter 属后续 ticket（ticket 03）

## P3 内容页实现（Spec §5/§5A 逐页）

- [ ] `/`（导航首页：6 工具卡片 + 品牌介绍 + 健康声明）｜开始: ｜完成: ｜证据:
- [ ] `/glycemic-load-calculator`（App.jsx 主体迁移，勿迁 App.js；+ ?food= 预填 + 静态食物表）｜开始: ｜完成: ｜证据:
- [ ] `/glycemic-index-calculator`（复用 FoodSearch/SearchWorker，GI 分档连续区间）｜开始: ｜完成: ｜证据:
- [ ] `/gmi-calculator` ｜开始: ｜完成: ｜证据:
- [ ] `/a1c-to-eag-calculator`（参考区间不匹配用户输入，红线 D4）｜开始: ｜完成: ｜证据:
- [ ] `/blood-sugar-converter`（双向绑定）｜开始: ｜完成: ｜证据:
- [ ] `/glucose-to-a1c-estimator`（只输出区间，端点各自舍入 0.1%）｜开始: ｜完成: ｜证据:
- [x] 【第 2 批三页开工前】竞品精评（ticket 16）｜完成: 2026-09-13 ｜证据: 跳过——执行环境无选词/盘面工具，按 ticket 16 无工具分支登记，不臆造数据；08/09/10 按 Spec 现有规格执行
- [ ] `/about`（DiOGenes 来源 + 公式出处 + MIT 署名 + 联系方式）｜开始: ｜完成: ｜证据:
- [ ] 现有 app.spec.js 入口 URL 迁移（仅改 goto 目标，断言不变）｜开始: ｜完成: ｜证据:

## P4 数据质量管道（Spec §6）

- [ ] 展示层规则：carbs_per_100g < 2.5 → "GI: N/A · GL ≈ 0" ｜开始: ｜完成: ｜证据:
- [ ] 静态表选择器（≥2.5 且非编码嫌疑 <10 ∧ GI∈{45,70}，≥20 条）｜开始: ｜完成: ｜证据:
- [ ] `tests/unit/gi-data.test.js`（含低碳水蛋清回归锚点）｜开始: ｜完成: ｜证据:

## 验收（Spec §8）

- [ ] `scripts/verify-dist.mjs`（DOM 解析断言，P5 前 ①~⑨ + ⑩ SKIPPED）｜开始: ｜完成: ｜证据:
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
