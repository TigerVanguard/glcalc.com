# 01: 测试时屏蔽 GA4 / Cloudflare 统计脚本

**Spec**: `docs/2026-09-29-content-ux-batch-spec-v1.md` §2 CU-01、§3、§4

**What to build:** 本机跑 `npm run check` 或任何 Playwright 测试时，浏览器不再把访问上报给 GA4 和 Cloudflare Web Analytics；线上网站的统计代码保持原样。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**执行要点：** 只改 `playwright.config.js`，用顶层 `use.launchOptions.args` 的 `--host-resolver-rules` 把 Spec 列出的统计主机解析为 `~NOTFOUND`；`index.html` 与现有测试零改动。

**Test plan:**
- 新增两个 e2e（一个被 app 项目匹配、一个被 static 项目匹配）：打开页面后，统计主机没有任何成功响应，且其请求以 `net::ERR_NAME_NOT_RESOLVED` 失败。
- verify-dist 既有 GA4 / Cloudflare beacon 断言照常通过。
- `npm run check` 全绿。

- [ ] 两个项目下统计请求都被屏蔽（有 requestfailed 证据）
- [ ] `index.html` 零改动，既有断言全部通过
- [ ] 现有测试零修改；零新增依赖
