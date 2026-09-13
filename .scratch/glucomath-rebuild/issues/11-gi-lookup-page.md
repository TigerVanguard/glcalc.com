# 11: GI 查询页

**What to build:** `/glycemic-index-calculator` 端到端可用：食物名搜索（复用现有搜索资产与 worker）→ 结果卡显示 GI 值 + 分档徽章（连续区间）+ 每 100g 碳水；低碳水条目按 02 号规则显示 "GI: N/A · GL ≈ 0"；结果卡**不含** serving/GL 计算（与 GL 页职责区分），每条提供 "Calculate glycemic load →" 深链到 GL 页 `?food=` 预填；正文含 GI vs GL 区别段落 + ≥3 条 FAQ。规格：Spec §5 表 GI 行、§5A.2 GI 页、§6。

**Blocked by:** 02, 05（深链目标）, 06

**Status:** ready-for-agent

## Acceptance criteria

- [ ] [app] e2e：搜索常见主食条目 → 显示 GI 数值 + 正确分档徽章；搜索蛋清 → 显示 "GI: N/A"，无数值 GI
- [ ] [app] e2e：点击结果卡深链 → 到达 GL 页且该食物已预选
- [ ] verify-dist：禁 JS 时 H1、GI vs GL 段落、FAQ 可见；本页 WebApplication schema
- [ ] `npm run check` 全绿
