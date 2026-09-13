# 04: SEO head 层（文案、结构化数据、sitemap、旧 head 拆除）

**What to build:** 每路由独立 head 全量落地：§5B.1 逐页定稿 title/description（一字不改）、canonical/og:url（无尾斜杠、根路径豁免）、og:image 绝对 URL + 全站共用 og 封面图初版（1200×630 含品牌名，纯色底+文字即可）、JSON-LD 按 §5B.2 分页配置（6 工具页 WebApplication、有可见 FAQ 才输出 FAQPage 且逐字一致、/about 用 AboutPage+Organization、全站禁 MedicalWebPage）。**必须**拆除根模板硬编码的全部页面级 head 标签（title/canonical/description/og/twitter/JSON-LD @graph——helmet 不会移除非它管理的标签，不拆则每页双 title），模板只留 charset/viewport/字体/GA4/manifest/图标；同时移除 GA4 hostname 门（Spec §4 P1-2）。sitemap（真源为仓库内 lastmod 映射文件，禁止每次 build 刷新为当天）与 robots 由预渲染脚本重写。产物验证脚本扩展到 Spec §8 T3 的 ①②⑥⑧⑨（⑩ 输出 SKIPPED）。规格：Spec §5B.1/§5B.2/§5B.4、§4 P2-3/P2-5。

**Blocked by:** 03

**Status:** ready-for-agent

## Acceptance criteria

- [ ] verify-dist：8 页 title/description 与 §5B.1 定稿逐字一致；唯一 title/canonical（无重复标签）
- [ ] verify-dist：canonical 无尾斜杠（根路径豁免）、og:url 一致、og:image 绝对 URL
- [ ] verify-dist：JSON-LD 类型分布符合 §5B.2，全站无 MedicalWebPage、无 "Harvard"、无 works offline 类表述
- [ ] dist/sitemap.xml 含 8 URL，lastmod 来自真源文件；robots 指向 sitemap
- [ ] GA4 config 无 hostname 条件（产物 grep 断言）
