# 12: GL 页静态食物参考表

**What to build:** GL 页页尾插入静态 GI/GL 参考表：由 02 号选择器生成 ≥20 条合规条目（覆盖主食/水果/蔬菜/乳制品/豆类），每条含 GI、每 100g 碳水、典型 serving 的 GL 与分档；注明 DiOGenes 出处，表脚标注数据等级说明；进预渲染 HTML（禁 JS 可见），同时覆盖 glycaemic 英拼与 how-to 长尾文案段。规格：Spec §5 表 GL 行、§6.2。

**Blocked by:** 02, 05

**Status:** ready-for-agent

## Acceptance criteria

- [ ] verify-dist：禁 JS 时表格 ≥20 行可见；表内不存在编码嫌疑条目（抽查断言）；含 "glycaemic" 拼写与 DiOGenes 出处
- [ ] 表中每行 GL 值与公式库计算一致（单测或 e2e 抽查 3 行）
- [ ] `npm run check` 全绿
