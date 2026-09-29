# GMI 页内容补强执行 Spec v1.0（2026-09-29）

> **本文件自包含**：执行 agent 不需要读会话历史。与本文件冲突时，以 `docs/2026-09-12-execution-spec-v2.2.md`（主 Spec）§9 红线为最高优先级。
>
> **目标一句话**：`/gmi-calculator` 是离搜索首页最近的页面（`gmi calculator` 平均排名 24.7、`gmi` 27.2）。按真实查询意图补三块内容：GMI 对照表、GMI 与 A1C 的换算说明、定义与「多少算好」的回答，推动这组词进入前 10。

---

## §0 数据依据（GSC，glucomath.com，2026-09-14 ~ 09-23，原始数据 `.gsc-export/2026-09-25-glucomath/queries.tsv`）

GMI 词簇 42 个查询、88 次展示、加权排名 41.8，按意图分组：

| 意图 | 代表查询 | 页面现状 |
|---|---|---|
| 工具 | gmi calculator、cgm calculator、gmi to a1c calculator | 已有计算器 |
| 按数值查 | gmi 6.5、gmi 6.6、gmi 8、6.1 gmi、gmi of 5.6 | **缺**：没有对照表 |
| GMI 换算 A1C | 5.5 / 5.6 / 6.0 / 6.1 / 6.2 / 6.8 gmi to a1c、convert gmi to a1c、gmi vs a1c conversion、gmi to hba1c calculator | **缺**：没有正面回答 |
| 定义 | gmi、what is gmi、gmi meaning、what does gmi mean (in diabetes)、glucose management indicator、gmi test、g.m.i. | 部分：没有一句话的定义 |
| 范围 / 好坏 | gmi range、whats a good gmi、glucose management indicator range、gmi scale、glucose management indicator chart | **缺**；且受红线约束 |

## §1 仓库实况（动手前必读）

- 页面：`src/pages/GmiCalculatorPage.jsx`。结构：计算器面板 `.gmi-panel` → 公式节 → 「GMI vs A1C」节 → FAQ（数据源 `src/data/gmiFaq.js`，同时生成可见 FAQ 与 FAQPage JSON-LD，verify-dist T3-⑧ 断言两者逐字一致）→ RelatedTools。
- 面板红线（已有 verify-dist 断言）：`.gmi-panel` 内不得出现 normal/prediabetes/diabetes，且预渲染（空输入）时面板内不得出现任何百分数。
- 公式：`src/lib/formulas.js` 的 `gmi(mgdl) = 3.31 + 0.02392 × mgdl`（Bergenstal et al., Diabetes Care 2018）；`mgdlToMmol` / `mmolToMgdl` 用 18.018。显示舍入只能用 `src/lib/display.js`：`formatMgdl`（整数）、`formatMmol`（1 位小数）、`formatGmi`（1 位小数，半入）。
- `verify-dist` 对每页 meta description 做了独立硬编码的逐字断言。
- 统一验收门：`npm run check`（unit → build+prerender → verify-dist → e2e），当前基线 unit 85、verify-dist 683 PASS、e2e 118。
- Playwright 按文件名分项目：`static`（对预渲染 dist）匹配 `/(prerender|seo)\.spec\.js/`；`app`（对 dev server）匹配 `/(app|pwa|converter|a1c|estimator|gmi|gi)\.spec\.js/`。
- `src/index.css` 是零引用死文件，不要往里写；全局样式在 `src/styles/app.css`。
- 任务纪律：执行子代理不 commit、不改 `tasks.md`；单个 ticket 循环 5 次未过即暂停请站长介入。

## §2 锁定决策（不得重开）

| # | 决策 |
|---|---|
| D1 | `src/lib/formulas.js` 新增纯函数 `meanGlucoseFromGmi(gmiPercent)`，返回 `(gmiPercent − 3.31) / 0.02392`（mg/dL，**不舍入**）。注释写明：GMI 由这条线性公式**定义**，所以这是精确的代数反解，回答「多少 CGM 平均值会得出这个 GMI」；它**不是**从化验 A1C 反推血糖（那属于主 Spec D4 的「只出区间」范畴，与本函数无关）。现有函数一律不改。 |
| D2 | 新建 `src/data/gmiChart.js`：GMI 取值为 5.5~8.0 每 0.1 一档（26 个）加 8.5、9.0、9.5、10.0（4 个），共 **30 行**。用整数 ×10（55…80、85、90、95、100）生成再除以 10，避免浮点累加误差。每行在模块加载时计算：mg/dL = `meanGlucoseFromGmi`，mmol/L = `mgdlToMmol`；显示文本用 `formatGmi` / `formatMgdl` / `formatMmol`。**禁止手写任何数值。** |
| D3 | 页面新增静态节「GMI 对照表」，位置在计算器面板之后、公式节之前；`<section id="gmi-chart">`，H2 为 `GMI chart: the CGM average behind each GMI value`。表格三列：GMI（如 `6.5%`，用 `<th scope="row">`）、CGM mean glucose (mg/dL)、CGM mean glucose (mmol/L)。表前一段说明怎么读：在左列找到你的 GMI，右边就是得出它的 CGM 平均值；GMI 与 A1C 用同一种百分数刻度；数值来自同一条 Bergenstal 2018 公式的精确反解；**本表只做换算，不评判好坏**。表后一段（muted）：同期化验 A1C 常与 GMI 相差约半个百分点；如需把化验 A1C 换算成平均血糖，链接到 `/a1c-to-eag-calculator`。该节必须在 `.gmi-panel` **之外**。 |
| D4 | intro 追加一段跳转：`Already have a GMI from your CGM report?` + `<a href="#gmi-chart">` 链接（普通锚点，禁 JS 可用），指向对照表。 |
| D5 | `src/data/gmiFaq.js` 在现有 4 条**之后**追加 4 条（现有 4 条的文字与顺序不变）：①「What does GMI mean?」——一句话定义：Glucose Management Indicator，由 CGM 数据计算而非血液检测，用与 A1C 相同的百分数刻度估计与该传感器平均值相对应的化验 A1C；许多 CGM app 和报告会把它显示在平均血糖旁边。②「Can I convert my GMI to an A1C?」——不需要换算：GMI 本来就在 A1C 刻度上，GMI 6.5% 就是公式对约 6.5% 化验 A1C 的估计；公式无法告诉你真实化验结果，同期化验 A1C 常相差约半个百分点。③「What average glucose does my GMI correspond to?」——给出反解公式 mean glucose (mg/dL) = (GMI − 3.31) ÷ 0.02392，并以 GMI 6.5% 为例给出对应的 mg/dL 与 mmol/L，提到本页的 GMI 对照表。**例子里的数字必须在模块加载时用 formulas + display 计算后拼进字符串，不得手写。** ④「Is there a "good" GMI number?」——没有适用于所有人的数字：目标因人而异（年龄、妊娠、低血糖频率、其他健康状况等），本站不给任何 GMI 值贴好坏标签；医护通常把 GMI 与 time in range、低血糖频率一起看。**不得给出任何目标数值**（如「低于 7%」）。FAQ 答案保持纯文本（不含链接），以维持 JSON-LD 逐字一致。 |
| D6 | 标题、H1、meta description **不改**（verify-dist 逐字断言；GMI 页排名正在上升，不宜改标题）。`src/sitemap-lastmod.json` 中 `/gmi-calculator` 改为 `2026-09-29`。 |
| D7 | 计算器面板 `.gmi-panel`、`App.jsx`、现有 formulas / display 函数零改动。不加新 CSS 规则也能正常显示为首选；确需样式只能复用现有 class（如 `conversion-table`、`seo-panel`、`muted`）。 |
| D8 | 手机 390×844 视口下 `/gmi-calculator` 不得横向溢出（`document.documentElement.scrollWidth ≤ window.innerWidth`）。 |

## §3 红线（违反即失败）

1. 主 Spec §9 全部继承（禁诊断分档、禁 glcalc 变体、公式只来自 formulas.js、MIT 署名不动等）。
2. 新内容（对照表节 + 4 条新 FAQ）不得出现：`prediabet`、`normal`、`diabetic range`、给数值贴好坏标签的措辞，以及任何目标数值。`diabetes` 一词在新内容中尽量不用；如用，只能作为「谁在用 CGM」的静态说明，不得绑定到任何数值。
3. 不新增 npm 依赖；不删除、不放松任何现有断言；现有测试零修改。
4. 新增统计性说法只能复述页面上已有的表述（如「常相差约半个百分点」），不得引入新的未经核实的统计数字。

## §4 Tickets

### GC-01 GMI 对照表 + 意图 FAQ（执行子代理 + 独立验收子代理）

**做什么**：按 D1~D8 实现。

**Test plan**：
- unit：
  - `meanGlucoseFromGmi` golden（误差 1e-9 以内）：5.5 → 91.5551839…、6.5 → 133.3612040…、7.0 → 154.2642140…、8.0 → 196.0702341…、10.0 → 279.6822742…；
  - 往返：30 个 GMI 值都满足 `gmi(meanGlucoseFromGmi(x)) ≈ x`；
  - `gmiChart` 共 30 行，golden 显示行：5.5% → 92 / 5.1、6.0% → 112 / 6.2、6.5% → 133 / 7.4、7.0% → 154 / 8.6、7.5% → 175 / 9.7、8.0% → 196 / 10.9、10.0% → 280 / 15.5；
  - FAQ ③ 的例子数字与对照表 6.5% 那一行一致。
- verify-dist 新增：`/gmi-calculator` 的 `#gmi-chart` 内恰好一个表格、30 个 body 行；上面 7 个 golden 行（**在 verify-dist 里独立硬编码**）都能在表中找到；存在 `a[href="#gmi-chart"]` 且目标 id 存在；`#gmi-chart` 不在 `.gmi-panel` 内；对照表节与 4 条新 FAQ 答案通过红线 2 的负向扫描。FAQ 逐字一致由既有 T3-⑧ 自动覆盖，4 条新问题须出现在 FAQPage JSON-LD 中。
- e2e（static 项目，文件名须匹配 `/(prerender|seo)\.spec\.js/`）：禁 JS 时对照表可见、30 行、三列表头；启用 JS 在 390×844 视口下无横向溢出（D8）。
- 现有测试零修改全部通过；`npm run check` 全绿。

### GC-02 部署与线上核对（编排者）

推送部署后：线上 `/gmi-calculator` 含 `#gmi-chart` 且表格 30 行；FAQPage JSON-LD 含 4 个新问题；sitemap 中 `/gmi-calculator` 的 lastmod 为 2026-09-29。是否在 GSC 请求重新编入索引由站长决定（请求额度可能与站长的其他站点共用）。
