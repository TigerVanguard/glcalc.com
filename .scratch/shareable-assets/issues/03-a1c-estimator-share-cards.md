# 03: A1C→eAG 页 + glucose→A1C 估算页分享卡

**Spec**: `docs/2026-09-20-shareable-assets-spec-v1.md` §4 BL-03（红线 D5 重点适用）

**What to build:** 两个页面的结果各自可下载品牌 PNG 卡：
- `/a1c-to-eag-calculator`：标题 "A1C to eAG"，行：A1C %、eAG mg/dL、eAG mmol/L；脚注 Nathan 2008（ADAG）；文件名 `glucomath-a1c-eag.png`。
- `/glucose-to-a1c-estimator`：标题 "Estimated A1C Range"，行：Average glucose（含单位）、A1C 区间字符串（**必须原样取页面显示的区间，禁止改成单点值**）；文件名 `glucomath-a1c-estimate.png`。

**Blocked by:** 01（分享卡片基建）

**Status:** ready-for-agent

**执行要点**：
- 红线：estimator 卡任何位置不得出现单点 A1C 值或诊断分档词（normal/prediabetes/diabetes）；区间措辞与页面一致。
- 数值取页面显示值，组件内零计算（D6）。

**Test plan:**
- e2e app 项目新增两条 download 测试（各页一条：输入 → 按钮 → download 事件文件名断言）。
- estimator 增加内容断言：传给卡片的区间文本含区间连接符（与页面显示一致），可通过暴露 data-* 属性或拦截 buildCardLines 输入实现（实现方式自定，断言必须存在）。
- 既有 a1c.spec.js / estimator.spec.js 零改动零回退。
- 验收命令：`npm run check` 全绿。

- [ ] 两页 download 事件与文件名断言通过
- [ ] estimator 卡区间断言通过（无单点值、无诊断词）
- [ ] 既有两页 e2e 零修改全过
- [ ] `npm run check` 全绿
