# 01: 旧域首页 308 改到 GL 计算器（OR-01）

**Spec**: `docs/2026-10-15-old-home-redirect-spec-v1.md`（§2 D1 ~ D5、§3 红线、§4 OR-01）

**What to build:** 在 `vercel.json` 的 `redirects` 数组最前面加一条旧域根路径规则，让 `https://glcalc.vercel.app/` 308 到 `https://glucomath.com/glycemic-load-calculator`；原全路径规则不动。verify-dist 补断言守住这条规则的值与顺序；`AGENTS.md` 同步说明。

**Blocked by:** 无

**执行步骤:**
1. 动手前先在当天（UTC）跑一次 `npm run build`，记录 `dist/` 全部文件的 SHA-256（保存到 `.scratch/or01-dist-before.txt`）。
2. 改 `vercel.json`：按 Spec D1 原样插入新规则到 `redirects[0]`，全路径规则保持原样排在其后；其余字段不动。
3. 改 `scripts/verify-dist.mjs` 的「vercel.json routing invariants」块，新增（期望值硬编码）：
   - host = glcalc.vercel.app 且 source = `/` 的规则恰好 1 条，destination === `https://glucomath.com/glycemic-load-calculator`，permanent === true；
   - 该规则下标 < 全路径规则下标；
   - `redirects.length === 2`；
   - 原有全路径断言保持不变。
4. 改 `AGENTS.md`：「当前状态」第 2 条改为“旧域 `glcalc.vercel.app` 根路径 308 到 `/glycemic-load-calculator`（旧首页即 GL 计算器），其余路径 308 到新域同名路径（`vercel.json` 中按 host 条件的 permanent redirect，根路径规则在前）”；Spec 索引表追加一行：`docs/2026-10-15-old-home-redirect-spec-v1.md`（旧域首页重定向修正）｜`.scratch/old-home-redirect/issues/`（01~02）｜以 `tasks.md` 为准。
5. 4183 与 4184 端口必须空闲，然后 `npm run check *> .scratch\or01-exec-check.log`，确认退出码 0 与各结果行。
6. 再次记录 `dist/` 全部文件 SHA-256（`.scratch/or01-dist-after.txt`），与步骤 1 逐行对比，须完全一致。

**不做:** 不改 `src/`、`public/`、`api/`；不加 rewrites / routes；不碰 tasks.md；不 commit。

**Test plan:**
- verify-dist：新增 3 条断言 PASS，原全路径断言 PASS，总 PASS 数 = 基线 + 新增条数。
- `npm run check` 全绿（unit → build → verify-dist → e2e）。
- `dist/` 前后 hash 逐文件一致。
- 临时把新规则的 destination 改错、或把它挪到全路径规则之后，verify-dist 必须 FAIL（变异检查，做完还原）。

- [ ] `vercel.json` 新规则值与位置正确，全路径规则未变
- [ ] verify-dist 新断言到位且能抓住错误目标与错误顺序
- [ ] `npm run check` 全绿
- [ ] `dist/` 前后一致
- [ ] `AGENTS.md` 按 D5 更新
