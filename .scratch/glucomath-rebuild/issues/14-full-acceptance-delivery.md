# 14: 全量验收 + 交付说明

**What to build:** 收口 ticket：跑通完整验收链并产出交付物。`npm run check` 全绿（unit→build→verify-dist→e2e）；verify-dist ①~⑨ 全过 + ⑩ SKIPPED（P5 前）；Spec §9 八条红线逐条自查并记录；§3 数据口径声明（有选词工具则重拉并附新表标注口径，无则声明「沿用 2026-09 快照，未重验」）；交付说明含新增/修改文件清单、差异摘要、竞品情报记录（16 号结果）；人工项：Rich Results Test 8 页无错误、Lighthouse mobile ≥70。规格：Spec §8 T3/T5、§9、§10。

**Blocked by:** 04, 05, 06, 07, 08, 09, 10, 11, 12, 13

**Status:** ready-for-agent

## Acceptance criteria

- [ ] `npm run check` 全绿输出存档；verify-dist 输出存档（①~⑨ PASS + ⑩ SKIPPED）
- [ ] §9 红线自查表逐条附证据（如产物 grep 无 "Harvard"、无诊断分档 UI）
- [ ] §3 口径声明与交付说明写入 docs/ 并登记 tasks.md
- [ ] Rich Results Test 与 Lighthouse 结果截图/记录附上（人工项，无法自动化则标注待站长执行）
