# 02: 部署、线上核对与正式推送（IN-02，编排者执行）

**Spec**: `docs/2026-11-03-indexnow-spec-v1.md` §4 IN-02

**What to build:** IN-01 验收通过并推送部署后，确认密钥文件已上线，并把线上 sitemap 的全部网址正式推送给 IndexNow。

**Blocked by:** 01（ACCEPT 并已推送）

**Status:** orchestrator-only

**Test plan:**（PowerShell 用 `curl.exe`）
- `https://glucomath.com/86029e40dc794a3b9a8fe1b14c762680.txt` → 200，正文逐字等于 `86029e40dc794a3b9a8fe1b14c762680`
- `npm run indexnow -- --dry-run`（读线上 sitemap）打印 9 个网址
- `npm run indexnow` 正式推送：状态码 200 或 202 为通过，记录响应体
- 请站长在 Bing Webmaster Tools 的 IndexNow 页面看这 9 个网址是否出现（站长截图，非硬性）

- [ ] 密钥文件线上可访问且内容正确
- [ ] 正式推送返回 200 或 202
