# 08: A1C→eAG 计算页

**What to build:** `/a1c-to-eag-calculator` 端到端可用：输入 A1C%（步长 0.1）实时输出 eAG，mg/dL 与 mmol/L 同时显示（正向 ADAG 式；仅此正向式可标注 "ADAG formula"）；A1C <4 或 >10 照常输出但加「超出 ADAG 可靠区间」警示；正文含适用范围说明（样本 507 人、SD≈15.7、妊娠/血红蛋白变异/贫血不适用）；ADA 参考区间表为纯静态教育内容，**禁止高亮/匹配用户输入值所在档（红线 D4：不得输出 normal/prediabetes/diabetes 判定）**；与 09 号页互链。规格：Spec §5 表 a1c 行、§5A.2、§1 D4。

**Blocked by:** 07（复用输入组件）

**Status:** ready-for-agent

## Acceptance criteria

- [ ] [app] e2e：输入 7.0 → 显示 eAG 对齐 T1 黄金值（154.2 经展示舍入）+ mmol 并排值（8.54 经舍入）
- [ ] [app] e2e：输入 3.5 显示 out-of-range 警示；参考区间表无任何随输入变化的高亮/标记
- [ ] verify-dist ④：产物含 `28.7`；⑧ 本页 WebApplication；正文含适用范围与出处（Nathan 2008）
- [ ] `npm run check` 全绿
