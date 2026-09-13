# 07: 血糖单位换算页（共享输入组件首次落地）

**What to build:** `/blood-sugar-converter` 端到端可用：mg/dL 与 mmol/L 双输入框**双向绑定**实时换算（编辑任一侧另一侧即更新；mg/dL 显示整数、mmol/L 显示 1 位小数、内部不截断；≤0/非数字报错、>1000 mg/dL 警示不阻断）；正文含单位地区差异说明 + 常见值静态对照表（70/100/126/140/180/200 mg/dL 行，进预渲染）与 ≥3 条 FAQ。本 ticket 同时产出可复用的数值输入/单位切换/结果卡组件（label 关联、inputmode=decimal、aria-live 输出区、空输入占位而非 NaN），供 08/09/10 复用。规格：Spec §5A.1-3/§5A.2 converter、§5 表。

**Blocked by:** 01, 06

**Status:** ready-for-agent

## Acceptance criteria

- [ ] [app] e2e：输入 100 mg/dL → mmol 侧显示值 = 公式原始值经「1 位小数」展示舍入；反向同理；黄金值对齐 T1
- [ ] [app] e2e：非法输入显示错误且输出清空；>1000 显示警示条
- [ ] verify-dist ④：产物含 `18.018`；对照表在禁 JS 时可见
- [ ] `npm run check` 全绿
