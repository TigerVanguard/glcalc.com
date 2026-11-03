# GlucoMath IndexNow 接入 Spec v1.0（2026-11-03）

> 一句话：在站点根目录发布 IndexNow 密钥文件，并提供一个部署后手动运行的脚本，把线上 sitemap 里的全部网址推送给 IndexNow（Bing 等参与的搜索引擎共享通知）。不改任何页面内容。本 Spec 自包含，是本批执行依据。

## §0 背景

- 2026-11-02 调研（`tasks.md`「AI 搜索收录」）：OpenAI 官方说明 ChatGPT 搜索没有提交入口，需允许 OAI-SearchBot（本站 robots.txt 已对所有爬虫放行，三种 OpenAI UA 请求均为 200），并会从第三方搜索服务获取网址。
- 本站在 Bing Webmaster Tools 里 sitemap 已成功读取 9 个网址（2026-10-17），但 `/glycemic-load-calculator` 仍为 Discovered but not crawled（2026-09-17 发现）。
- IndexNow 协议：站点根目录放 `<key>.txt`（内容为密钥本身），向 `https://api.indexnow.org/indexnow` POST JSON `{host, key, keyLocation, urlList}`；参与的搜索引擎共享通知；200 或 202 表示接收。
- 站长 2026-11-02 选定「接入 IndexNow」。

## §1 仓库实况（动手前必读）

- `public/` 下文件由 Vite 原样复制到 `dist/` 根目录，Vercel 以静态文件服务；`vercel.json` 的 `cleanUrls` 只影响 `.html`。
- `dist/sitemap.xml`、`dist/robots.txt` 由 `scripts/prerender.mjs` 按 `ROUTES` 生成；当前 9 个 `<loc>`，全部为 `https://glucomath.com` 开头。
- `scripts/verify-dist.mjs` 检查 dist 文件名与资源路径不匹配 `/glcalc/i`、全部产物不含 `glcalc.vercel.app`。
- `package.json` 没有 IndexNow 相关脚本；Node 内置 `fetch` 可用；不得新增依赖。
- `scripts/serve-dist.mjs` 服务 `dist/` 下任意静态文件，e2e static 项目（`testMatch: /(prerender|seo)\.spec\.js/`，端口 4184）可直接请求。
- vitest 只收 `tests/unit/**/*.test.js`。

## §2 锁定决策（不得重开）

| # | 决策 |
|---|---|
| D1 | 密钥固定为 `86029e40dc794a3b9a8fe1b14c762680`（32 位小写十六进制；按 IndexNow 设计公开，不是秘密）。 |
| D2 | 新增 `public/86029e40dc794a3b9a8fe1b14c762680.txt`，内容恰为密钥本身：32 字节，无换行、无 BOM。线上地址 `https://glucomath.com/86029e40dc794a3b9a8fe1b14c762680.txt`。 |
| D3 | 新增 `scripts/indexnow-submit.mjs`，部署后手动运行，不进 build、不进 check：① 读取 sitemap（默认 `https://glucomath.com/sitemap.xml`，可用 `--sitemap <本地路径或网址>` 覆盖），取出全部 `<loc>` 并保持顺序；② 校验每个网址的 host 都是 `glucomath.com`，否则退出码非 0；③ 非演练模式下，先 GET keyLocation，正文与密钥逐字一致才继续，否则退出码非 0；④ POST `https://api.indexnow.org/indexnow`，`Content-Type: application/json; charset=utf-8`，body 为 `{"host":"glucomath.com","key":…,"keyLocation":"https://glucomath.com/86029e40dc794a3b9a8fe1b14c762680.txt","urlList":[…]}`；⑤ 打印状态码，200 或 202 视为成功（退出码 0），其余退出码非 0 并打印响应体；⑥ `--dry-run`：不向 IndexNow 发请求、不校验线上密钥文件，只打印将提交的 JSON；sitemap 为本地文件时完全不联网。解析 sitemap、组装 payload、校验 host 的纯函数导出供单测使用；文件被 import 时不得自动执行。 |
| D4 | `package.json` 新增脚本 `"indexnow": "node scripts/indexnow-submit.mjs"`；不新增依赖；`check` 及其他脚本不变。 |
| D5 | 不改任何页面、标题、描述、canonical、sitemap、robots.txt、vercel.json；构建产物除新增这一个 `.txt` 外与改动前逐字节一致。 |
| D6 | `AGENTS.md`：「常用命令」补一行 `npm run indexnow`（部署后手动把线上 sitemap 网址推给 IndexNow；`-- --dry-run` 只打印不发送）；「关键不变量与坑点」补一条：`public/86029e40dc794a3b9a8fe1b14c762680.txt` 是公开的 IndexNow 密钥文件，内容必须与文件名中的密钥逐字一致，勿删勿改；Spec 索引表追加本 Spec 一行。 |

## §3 红线（违反即失败）

- `npm run check` 全绿；不删除、不放松任何现有断言；不新增 npm 依赖。
- 站点运行时不新增任何第三方请求（脚本只在本地手动运行）；不改 `src/` 下任何文件（`src/App.jsx` 零改动）。
- 新断言的期望值（密钥、文件名、文件内容、网址数量）在单测、verify-dist、e2e 内独立硬编码。
- 执行与验收子代理**不得**真正向 IndexNow 发送请求，只能用 `--dry-run` 和本地 sitemap；真实推送由编排者在部署后执行（IN-02）。

## §4 Tickets 与 Test plan

| Ticket | Blocked by | Test plan |
|---|---|---|
| IN-01 | 无 | unit（`tests/unit/indexnow.test.js`）：从含 9 个路由的样例 sitemap XML 解析出全部 `<loc>` 且顺序不变；payload 四个字段正确；混入其他 host 的网址时校验失败。verify-dist：`dist/86029e40dc794a3b9a8fe1b14c762680.txt` 存在，内容逐字等于密钥且恰 32 字节；dist 根目录恰有 1 个文件名匹配 `/^[0-9a-f]{32}\.txt$/`。e2e（static，新文件 `tests/e2e/indexnow-prerender.spec.js`）：GET `/86029e40dc794a3b9a8fe1b14c762680.txt` 返回 200、正文等于密钥。`node scripts/indexnow-submit.mjs --dry-run --sitemap dist/sitemap.xml` 打印的 urlList 恰为 9 个 `https://glucomath.com` 网址，且不发任何网络请求。`npm run check` 全绿；同 UTC 日构建前后 dist 除新增 `.txt` 外逐文件 hash 一致。 |
| IN-02 | IN-01 | 编排者：推送部署后 ① `curl.exe` 请求密钥文件，200 且正文逐字一致；② `npm run indexnow -- --dry-run`（读线上 sitemap）核对 9 个网址；③ 正式 `npm run indexnow`，记录状态码（200 或 202 为通过）与响应体；④ 请站长在 Bing Webmaster Tools 的 IndexNow 页面查看这 9 个网址是否出现（站长截图，非硬性）。 |
