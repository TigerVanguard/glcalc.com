# 03: 多页骨架 + 预渲染管线 + 测试基建（核心 tracer bullet）

**What to build:** 打穿「路由 → 构建 → 预渲染 → 验证」全链路的最小可用版本：站点常量（SITE_ORIGIN/BRAND/构建日期注入）、react-router v6 的 8 条路由（每页先用占位组件，但 H1 必须是 §5 的最终 H1）、构建后预渲染脚本（内部静态服务器须回退到根 index.html，产出每路由独立 HTML + 404 页）、Vercel 配置（cleanUrls、无尾斜杠、禁 catch-all rewrite）、测试基建改造（check 顺序 unit→build→verify-dist→e2e；Playwright 拆 static/app 双 project——条码/拍照 API 只存在于 dev server，见 Spec §0A-2/§8 T0）、产物验证脚本骨架（DOM 解析：每路由文件存在、唯一 title、唯一 H1）。现有应用在本 ticket 期间保持在 `/` 可用不动。规格：Spec §0A、§4 P2、§8 T0。

**Blocked by:** None（可立即开始，与 01/02 并行）

**Status:** ready-for-agent

## Acceptance criteria

- [ ] `npm run check` 端到端绿（新顺序），verify-dist 骨架断言全过
- [ ] [static] e2e：`javaScriptEnabled: false` 直访 8 路由均 200 且该页 H1 可见
- [ ] [static] e2e：请求不存在路径返回 HTTP 404（非 200 空壳）
- [ ] [app] e2e：现有 app.spec.js / pwa.spec.js 全绿（应用仍在 `/`，零改动）
- [ ] 尾斜杠访问任一路由被重定向到无尾斜杠（本地断言或 vercel.json 配置核对）
