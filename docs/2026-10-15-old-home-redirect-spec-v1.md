# GlucoMath 旧域首页重定向修正 Spec v1.0（2026-10-15）

> 一句话：旧域名 glcalc.vercel.app 的首页就是 GL 计算器，把它的 308 目标从新首页 `/` 改为 `/glycemic-load-calculator`，其余路径保持原样。本 Spec 自包含，是本批执行依据；与主 Spec 冲突处以本 Spec 为准（主 Spec §4 P5-2 已加修订说明）。

## §0 背景数据

- 旧站只有首页被 Google 收录，首页内容是上游 GL 计算器 App，即现在的 `src/App.jsx`，由 `/glycemic-load-calculator`（`src/pages/GlCalculatorPage.jsx`）渲染。新首页 `/` 是 6 个工具的导航页。
- 现状 `vercel.json` 只有一条 redirect：host = glcalc.vercel.app，`/(.*)` → `https://glucomath.com/$1`，所以旧 `/` 落在新首页。
- GSC（站长账号，只读）：旧首页 2026-09-24 ~ 10-09 仍有 151 次展示、平均第 22.8 名（glycemic index calculator 19 次 @14.3，glycemic load calculator 6 次 @24.3）；2026-10-08 被重抓，状态为 Page with redirect，旧首页的信号开始转向新首页。
- 新 GL 计算器页 2026-09-14 ~ 10-13：112 次展示、0 点击、平均第 29.3 名；含 load 的可列出查询分散到 GL 计算器 22、GI 页 17、首页 5、速查表 3，均在 65 ~ 73 名。
- 诊断全文在本地 `.scratch/gl-page-diagnosis-2026-10-15.md`（不提交）。

## §1 仓库实况（动手前必读）

- `vercel.json`：`installCommand`、`cleanUrls: true`、`trailingSlash: false`、`redirects` 数组（当前 1 条，即上面的全路径规则）。不得出现 `rewrites` / `routes`。
- `scripts/verify-dist.mjs` 约 1440 ~ 1461 行的「vercel.json routing invariants」：断言 cleanUrls、trailingSlash、无 rewrites/routes，并用 `.find` 按 source、destination、permanent、host 条件精确匹配全路径规则（与它在数组中的位置无关）。
- `scripts/serve-dist.mjs` 只模拟 trailingSlash 的 308，不模拟按 host 的跳转；e2e 无法覆盖本改动。真实跳转只能在部署后用 curl 核对（OR-02）。
- `vercel.json` 不进 `dist/`；本改动不应改变任何构建产物。
- `AGENTS.md`「当前状态」第 2 条描述了旧域跳转方式，需要同步。

## §2 锁定决策（不得重开）

| # | 决策 |
|---|---|
| D1 | 在 `redirects` 数组**最前面**新增一条：`{ "source": "/", "has": [{ "type": "host", "value": "glcalc.vercel.app" }], "destination": "https://glucomath.com/glycemic-load-calculator", "permanent": true }`。Vercel 按数组顺序匹配、首条命中生效，所以必须排在全路径规则之前。 |
| D2 | 全路径规则原样保留，四个字段一字不改；`vercel.json` 其余字段不动。 |
| D3 | 只改旧域根路径 `/`，不新增其他路径映射（旧站其他网址未被收录）。 |
| D4 | 新域 `glucomath.com` 的任何页面、首页、sitemap、canonical、标题与描述都不变，不新增任何新域跳转。 |
| D5 | `AGENTS.md`「当前状态」中旧域跳转那句改为：旧域根路径 308 到 `/glycemic-load-calculator`，其余路径 308 到新域同名路径；Spec 索引表追加本 Spec 一行。 |

## §3 红线（违反即失败）

- `npm run check` 全绿；不删除、不放松任何现有断言（包括 verify-dist 对全路径规则的断言）。
- 不新增 npm 依赖；不加 `rewrites` / `routes`；不改 `src/`、`public/`、`api/` 下任何文件（`src/App.jsx` 零改动）。
- 构建产物与改动前逐字节一致（两次构建须在同一 UTC 日内）。
- 新增断言的期望值在 verify-dist 内独立硬编码，不从 `vercel.json` 以外的地方推导。

## §4 Tickets 与 Test plan

| Ticket | Blocked by | Test plan |
|---|---|---|
| OR-01 | 无 | verify-dist 新增断言：① host = glcalc.vercel.app 且 source = `/` 的规则恰好 1 条，destination 精确等于 `https://glucomath.com/glycemic-load-calculator`，permanent 为 true；② 它在 `redirects` 中的下标小于全路径规则的下标；③ `redirects` 共 2 条；④ 原有全路径规则断言原样通过。`npm run check` 全绿；改动前后同日构建的 `dist/` 逐文件 hash 一致。`AGENTS.md` 按 D5 更新。 |
| OR-02 | OR-01 | 编排者：推送部署后用 `curl.exe -sI` 核对：旧 `/` → 308、Location 为 `https://glucomath.com/glycemic-load-calculator`；旧 `/about` 与旧 `/glycemic-load-calculator` → 308 到新域同名路径；新域 `/` 为 200 且不跳转。另记录旧 `/?food=apple` 的 Location 是否带上查询参数（仅记录，不作硬性要求）。 |
