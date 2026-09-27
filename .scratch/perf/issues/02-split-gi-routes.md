# 02: 拆分 gi.json 页面出入口包 + JSON.parse

**Spec**: `docs/2026-09-27-perf-spec-v1.md` §5 PF-02（锁定决策 D5~D8 适用）

**What to build:** 打开首页、GMI、A1C、换算等页面时，浏览器不再下载和解析 279 KB 的食物数据；只有 GL 计算器、GI 查询、GL 速查页三个页面才加载它。直接打开这三个页面时，预渲染内容一直可见、不闪白屏；从别的页面站内跳过去时，加载期间显示导航栏和加载提示，而不是空白页。

**Blocked by:** 01（按纪律串行；代码上无依赖）

**Status:** ready-for-agent

**执行要点**（细节以 Spec 为准）：
- `vite.config.js` 加 `json: { stringify: true }`。
- `src/index.jsx`：三个页面改为动态 `import()`；启动时如果当前路径是其中之一，先 `await` 对应模块，再用已解析的组件调用 `ReactDOM.render`（首次渲染不经过 Suspense fallback）；`data-render-complete` 标记仍在 render 回调里设置。
- 客户端导航到这三个页面时用 `React.lazy` + `Suspense`，fallback 渲染 `<SiteNav />` 加一行加载提示。不做空闲预取。
- 其余 6 个页面保持静态 import；不改 `src/App.jsx` 计算主流程。
- 交付说明报告：入口包体积、拆出的 chunk 列表与体积、预渲染 HTML 是否自动带 `modulepreload`（只报告）。

**Test plan:**
- verify-dist 新增三条断言（Spec PF-02 Test plan ①~③）：入口 JS ≤ 260 KB；入口 JS 中 `carbs_per_100g` 出现 ≤ 5 次；存在 `carbs_per_100g` 出现 ≥ 4000 次的独立 chunk。
- e2e（app 项目）新增三条：从 `/gmi-calculator` 经 SiteNav 客户端导航到 GL 计算器，搜索框可见且未整页刷新；同样导航到 GI 查询与速查页，H1 可见；直开 `/glycemic-load-calculator` 期间 `#root` 内 `h1` 始终存在（MutationObserver 断言不闪屏）。
- 既有 `app.spec.js`（GL 流程、`?food=` 深链）、GI 搜索、速查页 CSV 下载等测试零修改全部通过。
- 验收命令：`npm run check` 全绿。

- [ ] 入口 JS ≤ 260 KB，且不含 gi.json 数据
- [ ] 存在独立的 gi.json 数据 chunk
- [ ] 客户端导航到三个拆分页均正常，fallback 不空白
- [ ] 直开拆分页不闪屏（MutationObserver 断言通过）
- [ ] 既有测试零修改全部通过
- [ ] 零新增依赖
- [ ] `npm run check` 全绿
