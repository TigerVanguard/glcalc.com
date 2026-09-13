# 10: GMI 计算页

**What to build:** `/gmi-calculator` 端到端可用：输入 CGM 平均血糖（单位可切换，输入区提示「建议 ≥14 天 CGM 平均值」）实时输出 GMI 一位小数（Bergenstal 2018 式，页面注明出处）；必带说明块：GMI 与实验室 A1C 常有 ±0.5% 差异、不一致不代表数据错误；受众为 CGM 用户，免责按最严档；商业价值最高页（顶部出价全表第一），正文质量对标。规格：Spec §5 表 gmi 行、§5A.2。

**Blocked by:** 07（复用输入组件）

**Status:** ready-for-agent

## Acceptance criteria

- [ ] [app] e2e：输入 150 mg/dL → 显示 6.9%（T1 黄金值 6.898 经一位小数舍入）；mmol 输入换算后代入一致
- [ ] verify-dist ④：产物含 `0.02392`；正文含 ±0.5% 差异说明与 Bergenstal 2018 出处
- [ ] `npm run check` 全绿
