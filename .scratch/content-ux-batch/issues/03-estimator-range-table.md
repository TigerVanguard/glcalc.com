# 03: 估算页区间参考表（70~240 mg/dL，18 行）

**Spec**: `docs/2026-09-29-content-ux-batch-spec-v1.md` §2 CU-03（golden 值在此）、§3、§4

**What to build:** 在 `/glucose-to-a1c-estimator` 搜「160 glucose to a1c」这类问题的人，能在页面上直接查到常见平均血糖对应的**估算 A1C 区间**。每行都是区间（与估算器同一计算），不给单点值、不分档、不高亮，只覆盖 ADAG 数据可靠的 70~240 mg/dL。

**Blocked by:** 02

**Status:** ready-for-agent

**执行要点：** 新节在 `.estimator-panel` 之后、公式节之前；三列（mg/dL、mmol/L、`formatA1cRange(a1cRange(x))`）；模块加载时生成；intro 加跳转链接；文件头 RED LINES 注释补一句「本表不是分档表」；标题/H1/描述/面板不改；sitemap lastmod 更新为当天。

**Test plan:**
- unit：18 行；6 个 golden 行；每行都与 `formatA1cRange(a1cRange(x))` 一致且为区间形态。
- verify-dist：独立硬编码 golden；18 行；节在 `.estimator-panel` 之外；表内无单点百分数、无分档词；跳转锚点。
- e2e（static，禁 JS）：表可见、18 行。
- `npm run check` 全绿；现有测试零修改。

- [ ] 18 行区间全部正确，无单点值、无分档词
- [ ] 节在面板之外，面板零变化
- [ ] 标题 / H1 / 描述零变化
