# 05: 更新 AGENTS.md + 删除重复与死文件

**Spec**: `docs/2026-09-29-content-ux-batch-spec-v1.md` §2 CU-05、§3、§4

**What to build:** 新会话里的任何 agent 读 `AGENTS.md` 就能准确知道项目现状、规则和坑点，不会再被过时说明误导（比如去重做已完成的 ticket、改错数据文件）。同时删掉两个会误导人的文件。

**Blocked by:** 04（让 AGENTS.md 反映本批全部完成后的状态）

**Status:** ready-for-agent

**执行要点：**
- 删除 `src/gi.json`（`src/data/gi.json` 的逐字节副本），`tests/unit/gi-data.test.js` 的 import 改指 `src/data/gi.json`，注释里的旧路径同步更新；删除零引用的 `src/index.css`；删除前后 `dist/` 逐字节相同。
- 重写 `AGENTS.md`（中文，只做索引），每一条都要能在仓库里核实。须覆盖的事实清单（执行者须逐条到仓库核实后再写）：
  - 当前状态：线上 https://glucomath.com（Vercel，GitHub `TigerVanguard/glcalc.com` 的 master 自动部署）；旧域 `glcalc.vercel.app` 全路径 308 到新域；9 个预渲染路由（以 `scripts/prerender.mjs` 为准）；品牌 GlucoMath。
  - Spec 索引：主 Spec `docs/2026-09-12-execution-spec-v2.2.md`（§9 红线仍有效）；`docs/2026-09-20-shareable-assets-spec-v1.md`；`docs/2026-09-27-perf-spec-v1.md`；`docs/2026-09-29-gmi-content-spec-v1.md`；`docs/2026-09-29-content-ux-batch-spec-v1.md`；以及各自的 ticket 目录（`.scratch/glucomath-rebuild/issues`、`.scratch/shareable-assets/issues`、`.scratch/perf/issues`、`.scratch/gmi-content/issues`、`.scratch/content-ux-batch/issues`）与完成状态（以 `tasks.md` 为准）。
  - `tasks.md` 任务纪律（保留现有 5 条）。
  - 编排协议：编排者写 spec 与 ticket；执行子代理实现，不 commit、不改 tasks.md；另一个子代理独立验收（自己重跑 `npm run check` 并核对事实），ACCEPT 后编排者才提交；同一 ticket 循环 5 次未过即暂停、请站长介入。
  - 常用命令（以 `package.json` 为准）；Playwright 文件名规则（以 `playwright.config.js` 为准）。
  - 关键不变量与坑点：React 17 `ReactDOM.render`（非 hydrate），三个 gi.json 页面首次渲染前先 await 模块、客户端导航走 lazy + Suspense；入口 JS ≤ 260 KB（verify-dist 断言）；`gi.json` 唯一位置 `src/data/gi.json`；字体站内托管于 `public/fonts/`，preload href 必须等于 `@font-face` src；全局样式在 `src/styles/`；公式只来自 `src/lib/formulas.js`、显示舍入只用 `src/lib/display.js`；每页 SEO 头来自 `src/seo/pageSeo.js`、sitemap lastmod 来自 `src/sitemap-lastmod.json`，verify-dist 对描述与 golden 值独立硬编码；Vercel 构建依赖 `vercel.json` 的 installCommand（yum 装 Chromium 系统库 + Playwright headless shell，预渲染需要，勿删）与 `.npmrc` 的 legacy-peer-deps；GA4 与 Cloudflare beacon 在 `index.html` 中无条件加载，预渲染与 e2e 屏蔽统计主机；/about 的反馈表单用 Web3Forms（access key 按设计公开）；GSC 周报原始数据存 `.gsc-export/<日期>-glucomath/`。
  - 红线摘要（指向主 Spec §9）与品牌规则（产品文案与资源文件名禁 glcalc 变体；仓库名与 MIT 上游署名 assafmo/glcalc.com 保留）。
  - 目录速览（与仓库实际一致）。
- **公开仓库**：不得写入任何邮箱、账号或密钥。

**Test plan:**
- `src/gi.json`、`src/index.css` 不存在，全仓库无引用；删除前后 dist 逐字节相同。
- `npm run check` 全绿。
- 验收方逐条核对 `AGENTS.md` 的每一项事实与仓库一致，并确认不含个人信息。

- [ ] 两个文件删除且无引用，dist 不变
- [ ] AGENTS.md 每条事实可核实，无过时或错误表述
- [ ] 不含个人信息与密钥
- [ ] `npm run check` 全绿
