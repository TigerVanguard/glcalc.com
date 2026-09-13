# 15: P5 域名切换（GlucoMath 上线）

**What to build:** glucomath.com 购妥后的品牌与域名切换：Vercel 绑定新域为 Production；SITE_ORIGIN 环境变量切换重 build；旧域全路径永久重定向（Vercel 返回 308，SEO 等效 301）；BRAND 常量切换 GlucoMath + manifest name/short_name + og:site_name + schema name 同步；pwa.spec.js 品牌断言改为从站点常量读取；og 封面图重制（静态图不吃变量切换）；GSC 新建域名级资源（DNS TXT，人类）并提交 sitemap，旧资源保留观察；启用产物验证第⑩项。规格：Spec §4 P5、§8 T3-⑩。

**Blocked by:** 14；P0 域名购买（人类，未购则备选 glucoconvert → glycocalc → a1cmate）

**Status:** blocked（等 P0）

## Acceptance criteria

- [ ] 旧域任意路径请求：status ∈ {301, 308} 且 Location 指向新域同路径（脚本抽查 ≥3 路径）
- [ ] verify-dist ⑩：产物 grep "glcalc.vercel.app" 零命中；GA4 无 hostname 条件
- [ ] [app] pwa.spec.js 全绿（断言已随品牌更新）；manifest 安装名为 GlucoMath
- [ ] GSC 新资源验证通过 + sitemap 已提交（人类确认记录）
