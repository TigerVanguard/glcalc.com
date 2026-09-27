# 01: 字体站内托管（Fraunces + Manrope）

**Spec**: `docs/2026-09-27-perf-spec-v1.md` §5 PF-01（锁定决策 D1~D4 适用）

**What to build:** 用户打开任意页面时，浏览器不再去 Google Fonts 拉样式表和字体，而是从 glucomath.com 自己加载同样的两款字体。页面外观与现在完全一致，但首屏不再被跨域字体请求阻塞。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**执行要点**（细节以 Spec 为准）：
- 用现代 Chrome UA 请求 Google Fonts CSS2 API（与 `index.html` 现有 URL 完全相同的 family/axes/weights），只保留 latin 与 latin-ext 两个子集的 `@font-face`，下载对应 woff2 提交进仓库；`@font-face` 描述符原样照搬，只改 `src`。
- 同目录放两份 SIL OFL 1.1 许可文本（从 `github.com/google/fonts` 的 `ofl/fraunces/OFL.txt`、`ofl/manrope/OFL.txt` 获取）。
- `@font-face` 写进全局样式（`src/styles/app.css` 顶部，或新建 CSS 文件并由 `src/index.jsx` 在 app.css 之前引入）。**不改**任何现有 CSS 规则。
- `index.html`：删除 Google Fonts stylesheet 和两个 preconnect；新增最多 2 个字体 preload（Fraunces latin、Manrope latin），`href` 必须与构建后 CSS 的 `@font-face src` 完全一致。
- 零新增 npm 依赖。

**Test plan:**
- verify-dist 新增四条断言（Spec PF-01 Test plan ①~④）：无 Google Fonts 域名；两款 `@font-face` 带 `font-display: swap`；所有 `src` 文件在 dist 中存在；每页 1~2 个带 `crossorigin` 的字体 preload 且 href 均出现在 CSS `@font-face src` 中。
- e2e（app 项目）新增一条：无请求发往 Google Fonts 域名；`document.fonts.ready` 后 `document.fonts.check('700 1em Fraunces')` 与 `document.fonts.check('500 1em Manrope')` 为 true。
- 既有断言零修改零删除。
- 验收命令：`npm run check` 全绿。

- [ ] dist 全部 HTML/CSS 无 fonts.googleapis.com / fonts.gstatic.com
- [ ] 构建 CSS 含两款 `@font-face`，`font-display: swap`，src 文件均存在
- [ ] 每页 1~2 个字体 preload，href 与 CSS src 一致
- [ ] e2e 字体加载与无 Google 请求断言通过
- [ ] OFL 许可文本随字体提交
- [ ] `git diff package.json package-lock.json` 为空
- [ ] `npm run check` 全绿
