# 05: GL 计算器整体迁移到独立路由

**What to build:** 现有应用主体（三通道查找 Search/Barcode/Photo、候选确认流、serving 输入、GL 结果、SeoGuide/FAQ 内容）从 `/` 整体迁到 `/glycemic-load-calculator`，功能零改动。以 App.jsx 为准（App.js 是遗留死代码，删除）。新增 `?food=` 深链预填（读参选中对应食物），该页 canonical 保持无参。现有 e2e 用例只允许把入口 URL 从 `/` 改为新路由，断言一条不许删改。迁移后 `/` 暂时留占位（06 号 ticket 接手做导航首页）。规格：Spec §5A.2 GL 页、§8 T4-4/T4-5。

**Blocked by:** 03

**Status:** ready-for-agent

## Acceptance criteria

- [ ] [app] e2e：原有搜索/条码/拍照全部用例绿（仅 goto 目标变更）
- [ ] [static] e2e：禁 JS 直访 `/glycemic-load-calculator` 可见 H1 与 GL 公式文字
- [ ] [static] e2e：`?food=<存在条目>` 预填生效；该页 canonical 仍为无参 URL
- [ ] App.js 已删除；`npm run check` 全绿
