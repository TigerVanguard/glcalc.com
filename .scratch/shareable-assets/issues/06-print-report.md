# 06: 打印报告（GMI 页 + chart 页打印按钮 + @media print 全局规则）

**Spec**: `docs/2026-09-20-shareable-assets-spec-v1.md` §4 BL-05（锁定决策 D2 适用）。与 Spec 的差异：chart 页打印按钮从 BL-04 挪入本票（消除跨票耦合）。

**What to build:** 用户可以把 GMI 结果和 GL 速查表「另存为 PDF」：
- GMI 页有结果时出现 "Print report" 按钮：点击 → GA4 `print_report` 事件 → `window.print()`。
- `/glycemic-load-chart` 页加同样的打印按钮（打印整表）。
- 全局样式新增 `@media print` 规则：隐藏站点导航、页脚、表单/交互区、RelatedTools；保留 H1、结果卡/表格、公式引文、免责段；纸面顶部显示品牌 + 域名。

**Blocked by:** 05（chart 页需先存在）

**Status:** ready-for-agent

**执行要点**：禁引入任何 PDF 库（D2）；打印规则写进现有全局样式文件；`gtag` 不存在时静默跳过。

**Test plan:**
- e2e app：`page.addInitScript` stub `window.print` → 两页各断言点击按钮后 stub 被调用一次。
- 断言 `@media print` 规则存在于构建产物 CSS（verify-dist 或 e2e 任选一处，字符串检查即可）。
- 打印排版视觉效果由站长人工抽查（完成登记时注明"待站长抽查"）。
- 既有断言零回退；验收命令：`npm run check` 全绿。

- [ ] GMI 页与 chart 页打印按钮的 print stub 断言通过
- [ ] 构建产物含 @media print 规则
- [ ] 零新增依赖
- [ ] `npm run check` 全绿
