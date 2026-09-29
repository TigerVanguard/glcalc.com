# 02: 换算页对照表扩充（正向 29 行 + 反向 27 行）

**Spec**: `docs/2026-09-29-content-ux-batch-spec-v1.md` §2 CU-02（取值清单与 golden 值在此）、§3、§4

**What to build:** 在 `/blood-sugar-converter` 搜「180 mg/dl to mmol/l」「11 mmol/l to mg/dl」这类具体数值的人，不用输入就能在页面上直接查到结果：一张 mg/dL→mmol/L 表（40~600，29 行），一张 mmol/L→mg/dL 表（2~30，27 行），顶部有跳转链接。

**Blocked by:** 01

**Status:** ready-for-agent

**执行要点：** 两张表在模块加载时由 formulas + display 生成，禁止手写数值；保留现有 6 个值与表下说明段；标题/H1/描述不改；sitemap lastmod 更新为当天。

**Test plan:**
- unit：行数 29 / 27；Spec 中 13 个 golden 值。
- verify-dist：独立硬编码 golden 值与行数；跳转锚点与目标 id；既有 6 个对照对仍通过。
- e2e（static，禁 JS）：两张表可见、行数正确。
- `npm run check` 全绿；现有测试零修改。

- [ ] 两张表行数与 golden 值正确，无手写数值
- [ ] 既有 6 个对照对断言仍通过
- [ ] 跳转链接可用
- [ ] 标题 / H1 / 描述零变化
