# 03: 线上 PSI 验收（编排者执行）

**Spec**: `docs/2026-09-27-perf-spec-v1.md` §5 PF-03、§6

**What to build:** 部署 PF-01 与 PF-02 后，用 Google 官方 PageSpeed Insights 证明线上 4 个关键页的移动端性能分都 ≥ 70，从而关闭 `tasks.md` 的 T5 受阻项。

**Blocked by:** 01、02（且已推送部署到 glucomath.com）

**Status:** orchestrator-only（需要浏览器访问 pagespeed.web.dev，不派子代理）

**执行要点：**
- 确认线上已是新版本：线上 HTML 不含 `fonts.googleapis.com`，且引用的入口 JS 与本地构建一致。
- 在 pagespeed.web.dev 分别测 `/`、`/glycemic-load-calculator`、`/a1c-to-eag-calculator`、`/gmi-calculator` 的移动端；另测 `/glycemic-load-chart` 作参考。记录分数、FCP、LCP、TBT、CLS。

**Test plan:**
- 4 个关键页均 ≥ 70：通过，关闭 T5，Rich Results 部分以 GSC「Datasets 1 valid item」为证据。
- 某页 < 70：同页复测一次取较高值；仍不达标则按 Spec §6 立 PF-04/PF-05，并向站长报告实测数据。

- [ ] 线上版本确认
- [ ] 4 个关键页移动端 PSI 均 ≥ 70（记录全部指标，与 §0 基线对比）
- [ ] T5 关闭或应急 ticket 立项
