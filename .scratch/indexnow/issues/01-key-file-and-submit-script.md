# 01: IndexNow 密钥文件与推送脚本（IN-01）

**Spec**: `docs/2026-11-03-indexnow-spec-v1.md`（§2 D1 ~ D6、§3 红线、§4 IN-01）

**What to build:** 在 `public/` 发布 IndexNow 密钥文件；新增部署后手动运行的推送脚本 `scripts/indexnow-submit.mjs` 与 `npm run indexnow`；补单测、verify-dist 断言、static e2e；更新 `AGENTS.md`。

**Blocked by:** 无

**执行步骤:**
1. 动手前在当天（UTC）跑一次 `npm run build`，记录 `dist/` 全部文件 SHA-256（相对路径 + hash，按路径排序）到 `.scratch/in01-dist-before.txt`，并跑一次 `node scripts/verify-dist.mjs` 记下基线 PASS 数。
2. 创建 `public/86029e40dc794a3b9a8fe1b14c762680.txt`，内容恰为 `86029e40dc794a3b9a8fe1b14c762680`：32 字节、无换行、无 BOM。用不会自动加换行的方式写（例如 Node `fs.writeFileSync(path, key)`），写完核对字节数为 32。
3. 新增 `scripts/indexnow-submit.mjs`，行为按 Spec D3 逐条实现；导出纯函数（解析 sitemap 的 `<loc>`、组装 payload、校验 host）；只有作为入口直接运行时才执行主流程（import 时不执行）。
4. `package.json` 的 `scripts` 增加 `"indexnow": "node scripts/indexnow-submit.mjs"`，其他字段不动。
5. 新增 `tests/unit/indexnow.test.js`：样例 sitemap（9 个 `https://glucomath.com` 路由）解析结果与顺序；payload 的 host / key / keyLocation / urlList；混入 `https://example.com/x` 时校验失败。期望值在测试内硬编码。
6. `scripts/verify-dist.mjs` 新增断言（硬编码）：`dist/86029e40dc794a3b9a8fe1b14c762680.txt` 存在、内容逐字等于密钥、字节数 32；dist 根目录恰有 1 个文件名匹配 `/^[0-9a-f]{32}\.txt$/`。
7. 新增 `tests/e2e/indexnow-prerender.spec.js`（文件名须匹配 static 项目的 `/(prerender|seo)\.spec\.js/`）：GET `/86029e40dc794a3b9a8fe1b14c762680.txt` → 200，正文等于密钥。
8. 按 Spec D6 更新 `AGENTS.md`。
9. 4183 与 4184 端口空闲后：`npm run check *> .scratch\in01-exec-check.log`，确认退出码 0 与各结果行。
10. 记录 dist hash 到 `.scratch/in01-dist-after.txt`，与步骤 1 对比：除新增的 `86029e40dc794a3b9a8fe1b14c762680.txt` 外须逐文件一致。
11. 演练：`node scripts/indexnow-submit.mjs --dry-run --sitemap dist/sitemap.xml`，确认打印 9 个网址的 JSON，且没有任何网络请求（可断网或在代码层面确认此路径不调用 fetch）。
12. 变异检查（做完还原）：把密钥文件内容改成别的值（或加一个换行），verify-dist 与 e2e 必须失败；在样例里混入其他 host，单测必须失败。输出存 `.scratch/in01-mutation.log`。

**不做:** 不真正向 IndexNow 发请求；不改 `src/`、`vercel.json`、sitemap、robots.txt；不加依赖；不碰 `tasks.md`；不 commit。

**Test plan:**
- unit 新增用例全过，总数 = 基线 + 新增。
- verify-dist 新增断言 PASS，原有断言全部照常通过。
- e2e 新增 static 用例通过，总数 = 基线 + 新增。
- `npm run check` 全绿；dist 前后只多出密钥文件。
- 演练输出正确且不联网；变异能被抓住。

- [ ] 密钥文件内容与字节数正确
- [ ] 脚本按 D3 实现，import 时不执行
- [ ] 单测、verify-dist、e2e 新断言到位且能抓住错误
- [ ] `npm run check` 全绿，dist 只多一个文件
- [ ] `AGENTS.md` 按 D6 更新
