# 01: 分享卡片基建（buildCardLines 纯函数 + Canvas 下载 + ShareCardButton）

**Spec**: `docs/2026-09-20-shareable-assets-spec-v1.md` §4 BL-01（锁定决策 D1/D5/D6/D8 适用）

**What to build:** 一套可复用的「结果 → 品牌 PNG 卡片下载」能力：给定一个结果规格（标题 + 若干 label/value 行 + 脚注），产出规范化文本行（固定追加免责微字与域名行），在浏览器里绘制成 1200×630 卡片并触发 PNG 下载，同时上报 GA4 事件。本票只交付库与组件本身（不接线任何页面），验证方式是单元测试。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**执行要点**（细节以 Spec BL-01 为准）：
- 文本组装是纯函数：输入结果规格 → 输出文本行数组；不做任何数值计算或舍入（数值由调用方从页面显示值传入）。
- 固定尾行两条：`Estimate for education — not medical advice.` 与站点域名（取自 site.config，禁硬编码）。
- Canvas 原生绘制（禁新增依赖），底色用现有 theme 色，顶部品牌行。
- 下载走 `toBlob("image/png")` → 临时 `<a download>` → `revokeObjectURL`；成功后 `gtag('event','share_card_download',{page})`，`gtag` 不存在时静默跳过。
- 按钮组件复用现有 `secondary-button` 样式，文案 "Download result card"。

**Test plan:**
- unit（新增 share-card 测试文件）：①golden——给定规格输出的行序列完全匹配（含微字行与域名行）；②区间字符串按原样透传不被改写；③空 rows/缺脚注的边界形态。
- 不测 Canvas 像素；不加 e2e（无页面接线）。
- 验收命令：`npm run check` 全绿（90 e2e 基线不变，unit 新增若干条全过）。

- [ ] buildCardLines golden 单测通过，含微字/域名固定尾行断言
- [ ] 区间字符串透传断言通过
- [ ] 零新增 npm 依赖（git diff package.json 无变化）
- [ ] `npm run check` 全绿
