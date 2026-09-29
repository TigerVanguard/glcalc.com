# 06: 部署与线上核对（编排者执行）

**Spec**: `docs/2026-09-29-content-ux-batch-spec-v1.md` §4 CU-06

**What to build:** 确认 CU-01~05 合并部署后，线上页面与本地验收结果一致。

**Blocked by:** 01~05（全部 ACCEPT 并已推送）

**Status:** orchestrator-only

**Test plan:**
- 线上 `/blood-sugar-converter`：两张表行数 29 / 27，抽查 golden（180 → 10.0、11.0 → 198）。
- 线上 `/glucose-to-a1c-estimator`：区间表 18 行，抽查 golden（160 → `≈ 6.7% – 7.7%`）。
- 线上 GL 计算器、GI 查询、速查页在 390×844 下无横向溢出。
- sitemap 中两页 lastmod 为执行当天。

- [ ] 线上两张新表与区间表正确
- [ ] 三个页面手机视口无横向溢出
- [ ] sitemap lastmod 正确
