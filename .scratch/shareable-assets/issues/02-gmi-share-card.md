# 02: GMI 页分享卡

**Spec**: `docs/2026-09-20-shareable-assets-spec-v1.md` §4 BL-02

**What to build:** 用户在 GMI 计算器输入平均血糖并得到有效结果后，结果卡下方出现 "Download result card" 按钮；点击下载一张 1200×630 PNG：标题 "GMI Result"，行为 Average glucose（含单位）与 GMI %（与页面显示值逐字符一致），脚注 Bergenstal 2018 引文（与页面现有引文一致），文件名 `glucomath-gmi-result.png`。无有效结果时按钮不存在。

**Blocked by:** 01（分享卡片基建）

**Status:** ready-for-agent

**执行要点**：
- 卡片数值直接取页面已经算好的显示值（display 层输出），组件内禁止重新计算/舍入（D6）。
- 不修改 GMI 计算逻辑与既有文案；按钮加在结果组件层。

**Test plan:**
- e2e app 项目新增：①输入合法均值 → 按钮可见 → 点击 → `page.waitForEvent('download')` 断言文件名 `glucomath-gmi-result.png`；②清空/非法输入 → 按钮不存在。
- 既有 GMI e2e（gmi.spec.js）零改动零回退。
- 验收命令：`npm run check` 全绿。

- [ ] 有结果时按钮可见，download 事件文件名正确
- [ ] 无结果时按钮不渲染
- [ ] 既有 gmi.spec.js 全数通过（零修改）
- [ ] `npm run check` 全绿
