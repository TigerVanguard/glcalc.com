# 04: 修复手机横向溢出

**Spec**: `docs/2026-09-29-content-ux-batch-spec-v1.md` §2 CU-04、§3、§4

**What to build:** 用手机打开任何一个页面，整页都不会左右晃动或需要横向拖动；宽表格改为在自己的框内横向滚动，内容不被截断，并且可以用键盘聚焦滚动。桌面端外观完全不变。

**Blocked by:** 03

**Status:** ready-for-agent

**执行要点：** 先在 390×844 与 360×740 下逐页定位所有溢出源（已知 GL 计算器 597px、GI 查询 420px、速查页 728px，改动前即存在）；宽表格统一包进带 `tabindex="0"`、`role="region"`、非空 `aria-label` 的滚动容器；CSS 只新增且限定作用范围；不改 `App.jsx` 逻辑与结构；处理 `overflow-x: auto` 带来的外边距折叠变化，确保桌面视觉零变化。

**Test plan:**
- e2e（static，JS 开与关）：9 页 × 2 个手机视口 `scrollWidth <= innerWidth`；所有滚动容器具备三项无障碍属性。
- 验收方：桌面 1440×900 下 9 页全页截图与本 ticket 开始时的构建逐字节相同。
- `npm run check` 全绿；现有测试零修改。

- [ ] 9 页 × 2 视口 × JS 开/关 无横向溢出
- [ ] 滚动容器无障碍属性齐全
- [ ] 桌面截图逐字节相同
