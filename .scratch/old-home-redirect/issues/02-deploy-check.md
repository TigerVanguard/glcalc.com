# 02: 部署与线上核对（OR-02，编排者执行）

**Spec**: `docs/2026-10-15-old-home-redirect-spec-v1.md` §4 OR-02

**What to build:** OR-01 验收通过并推送后，确认 Vercel 线上跳转与 `vercel.json` 一致。

**Blocked by:** 01（ACCEPT 并已推送）

**Status:** orchestrator-only

**Test plan:**（PowerShell 用 `curl.exe -sI`，不要用 `curl` 别名）
- `https://glcalc.vercel.app/` → 308，Location = `https://glucomath.com/glycemic-load-calculator`
- `https://glcalc.vercel.app/about` → 308，Location = `https://glucomath.com/about`
- `https://glcalc.vercel.app/glycemic-load-calculator` → 308，Location = `https://glucomath.com/glycemic-load-calculator`
- `https://glucomath.com/` → 200，无 Location
- 记录 `https://glcalc.vercel.app/?food=apple` 的 Location（是否带查询参数，仅记录）

- [ ] 旧根路径跳到 GL 计算器
- [ ] 旧其他路径仍跳同名路径
- [ ] 新首页不跳转
