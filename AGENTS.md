# glcalc.com → GlucoMath 重构

Vite 5 + React 17 纯 CSR 单页应用（血糖/升糖计算器），部署于 glcalc.vercel.app，fork 自 assafmo/glcalc.com（MIT）。当前任务：按执行 Spec 重构为 8 页预渲染多页站并更名 GlucoMath。

## 唯一真源

**`docs/2026-09-12-execution-spec-v2.2.md`** 是本次重构的唯一执行依据（自包含，不需要读会话历史）。本文件只做索引，与 Spec 冲突时以 Spec 为准。

- Spec §0A：仓库实况备忘（无 Service Worker、`api/` 真实后端、e2e 跑在 dev server、`App.js` 是死代码）——**动手前必读**
- Spec §1：已锁定决策 D1~D6（不得重开）
- Spec §4：工作分解 P0~P5
- Spec §5 / §5A / §5B：页面规格 / 功能规格 / SEO 实现规格
- Spec §8：Test Plan（T0 测试基建改造先于一切）
- Spec §9：八条红线（禁迁框架、禁 site:、禁诊断分档、禁 glcalc 变体……）

## 执行单元（ticket）

Spec 已拆为 17 张 ticket：`.scratch/glucomath-rebuild/issues/01~17`（依赖序编号，每张含 What to build / Blocked by / 验收标准）。认领规则：只做 **frontier** 上的 ticket（所有 Blocked-by 已完成）；01/02/03/16 无阻塞可立即开始。完成一张必须跑通其验收命令并在 `tasks.md` 登记证据。

## 任务纪律（强制）

**每个任务执行之前，先写入根目录 `tasks.md`；完成后立即标记完成。** 规则：

1. 开始任何任务前，在 `tasks.md` 对应条目把状态改为 `[~]`（进行中）并填「开始时间」；若任务不在清单里，先补一行再动手。
2. 任务完成且验证通过后，改为 `[x]` 并填「完成时间 + 验证证据」（命令输出摘要、测试结果）。
3. 任务受阻改为 `[!]` 并写明阻塞原因（如 P0 人类依赖）。
4. 同一时刻只允许一个 `[~]`。
5. 禁止跳过登记直接改代码；禁止未验证就标 `[x]`。

## 快速命令

```
npm run dev        # 开发服务器（含 barcode/photo API 中间件）
npm run check      # unit → build → verify-dist → e2e（按 Spec T0 改造后的顺序）
npm run test:unit  # vitest
npm run test:e2e   # Playwright
```

## 目录速览

```
api/                 Vercel 无服务器函数（条码/拍照后端，保留不动）
src/App.jsx          现有 GL 计算主流程（App.js 是死代码）
src/features/        search / barcode / photo / calculator / confirm / workflow / common
src/lib/             gl.js（normalizeServingToGrams）/ foodMatch.js / normalizeFood.js
src/gi.json          GI 数据（{食物名: {gi, carbs_per_100g}}，4893 条）
tests/e2e/           app / pwa / seo（seo.spec.js 按 Spec §8 T0-3 重写）
docs/                Spec 与 GSC 基线（2026-09-09-gsc-baseline.md）
.gsc-export/         GSC 原始 CSV
```

## 关键约束（详见 Spec §9）

- 保留 Vite + React，构建后预渲染；**禁止**迁 Next/Astro 或重写应用
- 医学输出：A1c 反解只出区间、禁诊断分档；公式必须来自 `src/lib/formulas.js` 纯函数（返回未舍入原始值）
- 品牌：GlucoMath（BRAND 常量切换），禁止任何 glcalc 变体；MIT 上游署名不可遗漏
- 验收禁用 `site:`，以 GSC 报告 + `scripts/verify-dist.mjs` 为准
