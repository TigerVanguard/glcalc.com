# 09: 平均血糖→A1C 估算页（只输出区间）

**What to build:** `/glucose-to-a1c-estimator` 端到端可用：输入平均血糖（单位可切换）实时输出 **A1C 区间** "≈ X.X% – Y.Y%"（中心 (eAG+46.7)/28.7、半宽 0.547 不预舍入、端点各自四舍五入 0.1%；例 126 → "≈ 5.5% – 6.6%"）；**禁止单点大字输出、禁止标注为 ADAG 公式、禁止诊断分档**；必带说明块（代数近似、回归不对称、诊断边界附近偏差放大）；与 08 号页互链、正文独立不复制。规格：Spec §5 表 estimator 行、§5A.2、§1 D4。

**Blocked by:** 07（复用输入组件）

**Status:** ready-for-agent

## Acceptance criteria

- [ ] [app] e2e：输入 126 mg/dL → 显示 "≈ 5.5% – 6.6%"（或等价区间格式），页面不存在单点结果元素
- [ ] [app] e2e：单位切换到 mmol/L 输入 7.0 → 区间与 mg/dL 口径换算一致
- [ ] verify-dist：产物含 `28.7` 与近似性说明文字；不含 "ADAG formula" 对反解式的标注
- [ ] `npm run check` 全绿
