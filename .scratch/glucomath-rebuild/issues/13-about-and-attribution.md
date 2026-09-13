# 13: /about 页 + 上游署名义务闭环

**What to build:** `/about` 静态内容页：数据来源如实陈述（DiOGenes GI Database，Aston et al. Obesity Reviews 2010，数据库已下线、本站用其存档数据——禁止写「哈佛」、禁称其为权威 GI 参考）；升级计划注明 Atkinson 2021 国际 GI 表；公式出处汇总（Nathan 2008 / Bergenstal 2018 / 18.018）；MIT 上游署名（"Based on the open-source project glcalc.com by Assaf Morami, MIT License, © 2018" 带仓库链接）；维护者署名与联系方式（P0 未提供时用兜底串 + 仓库 issues 链接）；总免责声明。同时在 README 顶部补同款 MIT 署名（Spec §4 P1-1），LICENSE 保留不动。规格：Spec §5 表 about 行、§4 P1。

**Blocked by:** 06

**Status:** ready-for-agent

## Acceptance criteria

- [ ] verify-dist ⑨：/about 含 "DiOGenes" 与 "MIT"；全站不含 "Harvard"
- [ ] /about 含 AboutPage + Organization schema（含联系入口）；禁 JS 全文可见
- [ ] README 顶部含 MIT 上游署名；LICENSE 未改动（git diff 断言）
- [ ] `npm run check` 全绿
