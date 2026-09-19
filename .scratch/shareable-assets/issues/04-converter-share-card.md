# 04: 血糖换算页速查卡

**Spec**: `docs/2026-09-20-shareable-assets-spec-v1.md` §4 BL-06

**What to build:** `/blood-sugar-converter` 有有效换算结果时出现 "Download result card" 按钮，下载 PNG：标题 "Blood Sugar Conversion"，行：mg/dL 值、mmol/L 值、规则行 "mmol/L = mg/dL ÷ 18.018"；文件名 `glucomath-conversion.png`。

**Blocked by:** 01（分享卡片基建）

**Status:** ready-for-agent

**执行要点**：数值取页面双向绑定的显示值；规则行为固定字符串（与 about 页公式口径一致）。

**Test plan:**
- e2e app 项目一条 download 测试（输入 → 按钮 → 事件文件名断言）+ 无结果不渲染断言。
- 既有 converter.spec.js 零改动零回退。
- 验收命令：`npm run check` 全绿。

- [ ] download 事件与文件名断言通过
- [ ] 无结果时按钮不渲染
- [ ] 既有 converter.spec.js 零修改全过
- [ ] `npm run check` 全绿
