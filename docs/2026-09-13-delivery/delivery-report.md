# GlucoMath 重构交付说明（ticket 14 收口�?

日期�?026-09-13 �?真源：`docs/2026-09-12-execution-spec-v2.2.md` �?基线 commit：`1cc006d` �?交付 HEAD：`6b9199e`�?3 �?commit，工作区无未提交代码改动�?

## 1. 全量验收结果（Spec §8 / §10�?

`npm run check`（unit �?build+prerender �?verify-dist �?e2e�?*全绿**，exit 0�?

| 环节 | 结果 |
|---|---|
| test:unit（vitest�?| 7 文件 74/74 通过 |
| build（vite build + prerender.mjs�?| 8 路由预渲�?+ 404.html + sitemap/robots 生成 |
| verify-dist | 全部断言 PASS：T3 ①②③④(6 工具页公式行)⑤⑥⑦⑧�?�?/about 正向) + sitemap/robots/404/vercel.json�?*�?输出 `SKIPPED (P5 �?`**（按 Spec 设计，P5 后启用） |
| test:e2e（Playwright static+app �?project�?| 90/90 通过�?.7m�?|

证据存档（本目录）：
- `check-output.txt` �?check 全链路完整输�?
- `verify-dist-output.txt` �?verify-dist 单独运行输出（①~�?PASS + �?SKIPPED 可见�?
- `redline-audit.md` �?§9 八条红线逐条自查表（附命令与输出�?
- `lighthouse-{home,gl,a1c,gmi}.json` + `lighthouse-home-rerun.json` �?Lighthouse 原始报告

## 2. §3 数据口径声明

**本次交付未重拉选词数据�?* 执行环境无选词/盘面工具（Google Ads Planner、哥飞版工具均不可用），�?Spec §3-4 无条件分支处理：**§5 页面优先级与全部搜索量数字沿�?2026-09 GSC/Google Ads 快照，未重验**。上线后�?GSC 实测为唯一裁决口径（T6 门槛跟踪 = ticket 17）。本交付全部文档未将任何单一口径数字标注为「已验证」（红线 7 自查�?redline-audit.md）�?

## 3. 新增/修改文件清单�?cc006d 之后 13 �?commit，按 ticket 分组�?

完整 `git log --stat` �?`git log --stat --reverse 1cc006d..HEAD`；摘要：

| Ticket | Commit | 主要新增/修改 |
|---|---|---|
| 01 公式�?| f47bb23 | �?`src/lib/formulas.js`、`tests/unit/formulas.test.js`；`src/lib/gl.js` 改为委托 |
| 03 多页骨架+测试基建 | 702348d | �?`scripts/{prerender,serve-dist,verify-dist}.mjs`、`src/pages/`×8、`src/site.config.js`、`vercel.json`、`tests/e2e/prerender.spec.js`；改 `playwright.config.js`（双 project）、`package.json`（check 顺序）、`src/index.jsx`（react-router v6�?|
| 02 GI 数据规则 | 4e3a9e8 | �?`src/lib/giData.js`（�? N/A 规则+静态表选择器）、`tests/unit/gi-data.test.js` |
| 05 GL 页迁�?| 66bcbd8 | App 主体�?`/glycemic-load-calculator` + `?food=` 深链�?*删除死代�?`src/App.js`**；`app.spec.js` 仅改 goto |
| 04 SEO head �?| d1bb529 | �?`src/seo/{HeadManager,pageSeo}.jsx/js`、`src/data/glFaq.js`、`src/sitemap-lastmod.json`、`public/og-cover.png`+生成脚本；拆 `index.html` 页面�?head、GA4 �?hostname 门；重写 `tests/e2e/seo.spec.js`；verify-dist �?T3-①②⑥⑧�?�?|
| 06 布局与内�?| ac44229 | �?`src/features/common/{SiteNav,ToolFooter,RelatedTools,ToolPageLayout}.jsx`；首�?6 卡片；�?B.3 内链拓扑；�? 五项页脚；verify-dist T3-⑤⑦ |
| 07 血糖换算页 | 6d416e8 | �?`NumberField/UnitToggle/ResultCard`、`src/lib/display.js`、converter 页正�?FAQ、`tests/e2e/converter.spec.js`、`tests/unit/display.test.js` |
| 08 A1C→eAG �?| 7c56d9f | a1c 页正体（ADAG 正向�?ADA 教育表，D4 三层防线）、`tests/e2e/a1c.spec.js` |
| 09 血糖→A1C 估算�?| 2437477 | estimator 页正体（只出区间）、`tests/e2e/estimator.spec.js` |
| 10 GMI �?| b079e91 | gmi 页正体（Bergenstal 2018、�?.5 差异说明）、`tests/e2e/gmi.spec.js` |
| 11 GI 查询�?| 39f10bf | gi 页正体（搜索复用+27 行静态表+诚实口径）、`tests/e2e/gi.spec.js`、`src/data/giFaq.js` |
| 12 GL 静态食物表 | 7998821 | `src/data/glStaticTable.js`�?7 条构建时�?GL）、CalculatorResult N/A 分支闭环、`tests/unit/gl-static-table.test.js` |
| 13 About �?MIT 署名 | 6b9199e | AboutPage 六段正体（DiOGenes 诚实口径/公式出处/MIT/联系）、README 顶部上游署名、verify-dist T3-�?正向断言 |

�?ticket�?4）新增（不改代码）：`docs/2026-09-13-delivery/`（本目录 8 个文件）、`.scratch/redline-dom-audit.mjs`、`.scratch/ticket14-gitlog.txt`、`tasks.md` 状态更新�?

## 4. 差异摘要 —�?Spec §10 交付清单逐项对照

- [x] **T0 测试基建改�?*：check 顺序 unit→build→verify-dist→e2e（package.json）；Playwright static/app �?project（ticket 03）；seo.spec.js 重写非追加（ticket 04�?
- [x] **P1~P4 代码合入 + check 全绿输出附上**：见 §1 �?`check-output.txt`；�?A 逐工具功能规格全部实现（GL �?App.jsx 零改动迁�?+ `?food=` 预填，ticket 05/12�? 数值工具页 07/08/09/10；GI 查询�?11）；§5B head 文案/JSON-LD/内链拓扑/404/尾斜杠策略逐项落地（ticket 04/06，verify-dist 机器断言�?
- [x] **verify-dist 运行输出附上**：`verify-dist-output.txt`，P5 前口�?①~�?全过 + �?SKIPPED
- [x] **新增/修改文件清单与差异摘�?*：本文档 §3/§4
- [x] **§3 数据是否重拉的声�?*：本文档 §2——未重拉，沿�?2026-09 快照
- [x] **P5 状�?*：未就绪，等待项�?§7 遗留项（阻塞�?P0 域名购买�?
- [x] **§9 红线逐条自查**：`redline-audit.md`�?/8 PASS

## 5. 竞品情报记录（ticket 16�?

**跳过——无工具分支�?* 执行环境无选词/盘面工具（无法获取竞品流量、词排名、外链数据），按 ticket 16 预设的无工具分支登记跳过�?*未臆造任何竞品数�?*；第 2 批三页（08/09/10）按 Spec v2.2 现有规格原样执行，未因竞品情报调整规格。已登记�?`tasks.md` P3 节�?

## 6. T5 人工项结果（Rich Results Test + Lighthouse�?

### Lighthouse mobile（本地实跑，Lighthouse 13.4.1 + Chrome 152 headless，默认移动模拟）

�?`scripts/serve-dist.mjs`�?27.0.0.1:4188�?04 模式）实�?4 关键页：

| 页面 | Performance | SEO | Accessibility | Best Practices |
|---|---|---|---|---|
| `/`（home�?| **46**（复�?63�?| 100 | 100 | 100 |
| `/glycemic-load-calculator` | **65** | 100 | 100 | 100 |
| `/a1c-to-eag-calculator` | **65** | 100 | 100 | 100 |
| `/gmi-calculator` | **47** | 100 | 100 | 100 |

**结论：SEO/无障�?最佳实践三项全部满分；mobile performance 46~65，未�?�?0 工程门槛�?* 主要指标：FCP 4.0~5.0s、LCP 5.0~6.4s（模拟慢�?4G），TBT 基本�?0——瓶颈是渲染阻塞资源与首包体积（semantic-ui-css 全量 + 单一 JS bundle �?gi.json），非脚本执行。注意事项：本地 headless 运行 run-to-run 方差大（home 两次 46�?3）；**建议站长在生产部署后�?PageSpeed Insights 实测复核**，若确认 <70 则性能优化立项（见遗留项）。原始报�?JSON 已存档本目录�?

### Rich Results Test

**待站长执�?*（Google 在线工具，无法本地自动化）。离线替代已覆盖：verify-dist T3-�?�?8 页全�?JSON-LD 做了 `JSON.parse` 可解析断言 + @type 分布逐页断言�? 工具�?WebApplication、FAQPage 问答与可见文本逐字一致�?about AboutPage+Organization、全站无 MedicalWebPage），全部 PASS——见 `verify-dist-output.txt`�?

## 7. 遗留项清�?

| # | 项目 | 状�?| 依赖/说明 |
|---|---|---|---|
| 1 | P0：购�?glucomath.com | `[!]` 等站�?| Spaceship；溢价备�?glucoconvert �?glycocalc �?a1cmate。不阻塞已交付内容，只阻�?P5 |
| 2 | P0：GSC 域名验证 DNS TXT | `[!]` 等站�?| |
| 3 | P0：维护者署名与联系方式 | `[!]` 等站�?| 现用兜底�?"Maintained by the GL Calc project" + GitHub Issues；站长提供后替换 |
| 4 | ticket 15：P5 域名切换（Vercel 绑定/VITE_SITE_ORIGIN �?build/旧域 301/品牌名切�?GSC 新资�?verify-dist �?启用�?| `[!]` 阻塞�?P0-1 | 全链路已参数化（site.config.js 环境变量），切换只改 env + �?build |
| 5 | ticket 17：T6 上线�?GSC 跟踪 | 待上�?| 每周导出 CSV �?`.gsc-export/`�?/3/6/9~12 月门槛见 Spec §8 T6 |
| 6 | 人工项：Rich Results Test 8 �?| 待站长执�?| 离线 JSON-LD 断言已全过（�?§6�?|
| 7 | 人工项：Lighthouse mobile perf 复核 | 待站长执�?| 本地实测 46~65 <70；先在生产环境用 PageSpeed Insights 复测，确认后立项优化（方向：semantic-ui-css 裁剪/关键 CSS 内联/bundle 拆分 gi.json 懒加载） |
| 8 | §3 选词数据重验 | 待有工具�?| 本次沿用 2026-09 快照（见 §2�?|
