# Google Analytics 和 Search Console 上线收录教程

本文记录 `https://glcalc.vercel.app/` 从安装 Google Analytics，到提交 Google Search Console sitemap，再到请求 Google 收录的完整流程。适用于 Vite/React/Vercel 这类单页应用。

## 1. 先分清两个产品

Google Analytics 和 Google Search Console 是两套系统：

- Google Analytics：统计用户访问、实时流量、页面浏览、事件。
- Google Search Console：让 Google 发现、抓取、索引网站，并查看搜索表现。

Analytics 测试成功，只说明统计代码能工作；它不会自动让页面被 Google 搜索收录。收录要去 Search Console 做。

## 2. 当前项目配置

本站正式地址：

```text
https://glcalc.vercel.app/
```

GA4 Measurement ID：

```text
G-PDPYWE3JR5
```

Sitemap 地址：

```text
https://glcalc.vercel.app/sitemap.xml
```

Robots 地址：

```text
https://glcalc.vercel.app/robots.txt
```

## 3. 安装 Google Analytics

### 3.1 创建 Web data stream

1. 打开 Google Analytics。
2. 进入 `Admin`。
3. 找到 `Data collection and modification`。
4. 点击 `Data streams`。
5. 点击 `Add stream`，选择 `Web`。
6. 填写：

```text
Website URL: https://glcalc.vercel.app
Stream name: glcalc
```

7. 创建后复制 Measurement ID，格式通常是：

```text
G-XXXXXXXXXX
```

本项目使用的是：

```text
G-PDPYWE3JR5
```

### 3.2 把 Google tag 放进项目

编辑 `index.html`，在 `<head>` 靠前位置加入：

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PDPYWE3JR5"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());

  if (window.location.hostname === "glcalc.vercel.app") {
    gtag("config", "G-PDPYWE3JR5");
  }
</script>
```

这里加了域名判断：

```js
window.location.hostname === "glcalc.vercel.app"
```

作用是：只有正式线上域名才会上报 GA，本地开发环境、测试环境、Vercel preview 不会污染统计数据。

### 3.3 验证 GA 是否成功

上线后访问：

```text
https://glcalc.vercel.app/
```

然后在浏览器开发者工具的 Network 里搜索：

```text
collect
```

如果看到类似请求，说明 GA 已经在发送 page_view：

```text
https://www.google-analytics.com/g/collect?...tid=G-PDPYWE3JR5...en=page_view
```

状态码 `204` 是正常的，表示 Google 接收了采集请求。

在 GA 后台，也可以进入：

```text
Reports -> Realtime
```

查看是否有实时访问。

## 4. 准备 SEO 基础文件

### 4.1 robots.txt

在 `public/robots.txt` 中写入：

```text
User-agent: *
Allow: /

Sitemap: https://glcalc.vercel.app/sitemap.xml
```

上线后访问确认：

```text
https://glcalc.vercel.app/robots.txt
```

应该返回 `200 OK`。

### 4.2 sitemap.xml

在 `public/sitemap.xml` 中写入：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://glcalc.vercel.app/</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

上线后访问确认：

```text
https://glcalc.vercel.app/sitemap.xml
```

应该返回 `200 OK`，并且 Content-Type 是 XML。

## 5. 配置 Search Console

### 5.1 添加资源

打开：

```text
https://search.google.com/search-console/
```

点击 `Add property`，选择 `URL prefix`，输入：

```text
https://glcalc.vercel.app/
```

不要选 `Domain`，因为 `vercel.app` 是平台域名，不适合用 Domain 属性验证。

### 5.2 验证所有权

优先尝试 `Google Analytics` 验证，因为网站已经安装了 GA tag。

如果 GA 验证失败，可以改用 `HTML tag` 验证。Search Console 会给一段 meta 标签，把它放进 `index.html` 的 `<head>` 后重新部署即可。

## 6. 提交 sitemap

进入 Search Console 左侧菜单：

```text
Sitemaps
```

在 `Add a new sitemap` 输入框里，只填：

```text
sitemap.xml
```

不要填：

```text
/sitemap.xml
```

也不要填完整 URL。

Search Console 会自动拼成：

```text
https://glcalc.vercel.app/sitemap.xml
```

提交成功后会看到：

```text
Status: Success
Discovered pages: 1
```

如果显示 `Couldn't fetch`，先确认你是不是填了 `/sitemap.xml`。带斜杠可能导致 Search Console 拼出双斜杠地址：

```text
https://glcalc.vercel.app//sitemap.xml
```

这种情况下删除旧 sitemap，重新提交 `sitemap.xml`。

## 7. 请求首页收录

在 Search Console 顶部 URL Inspection 输入框输入：

```text
https://glcalc.vercel.app/
```

如果显示：

```text
URL is not on Google
Page can be indexed
```

或者 Live Test 显示：

```text
URL is available to Google
Page can be indexed
```

说明技术上没问题。点击：

```text
REQUEST INDEXING
```

如果出现：

```text
Quota Exceeded
```

说明当天手动请求额度用完了，第二天再点即可。即使不点成功，sitemap 成功后 Google 也已经知道页面存在，会自己排队抓取。

## 8. 常见状态解释

### Discovered - currently not indexed

Google 已经通过 sitemap 或链接发现了页面，但还没有抓取。新站很常见。处理方式：

- 等待几天。
- 请求一次 indexing。
- 增加外部链接，让 Google 更快发现。

### Crawled - currently not indexed

Google 已经抓取页面，但暂时不收录。处理方式：

- 提升页面独特价值。
- 增加正文说明、FAQ、工具说明、使用场景。
- 增加外部链接和真实访问。

### URL is available to Google

Live Test 成功。代表：

- 页面能访问。
- 没有 robots 阻挡。
- 没有 noindex。
- 页面可以被索引。

这不等于已经收录，只是说明页面具备被收录资格。

### Couldn't fetch

常见原因：

- sitemap 输入格式错了。
- Search Console 后台延迟。
- sitemap 刚上线，Google 还没刷新。
- 地址发生跳转或返回非 200。

先用浏览器打开 `https://glcalc.vercel.app/sitemap.xml`，如果能正常访问，通常等一会儿或重新提交即可。

## 9. 收录后怎么检查

几天后用 Google 搜索：

```text
site:glcalc.vercel.app
```

如果出现结果，说明已经收录。

也可以在 Search Console 的 URL Inspection 中重新检查首页，看状态是否变成：

```text
URL is on Google
```

## 10. 推荐的后续动作

为了让新站更快被抓取和收录，可以做：

1. 在 GitHub README 中保留首页链接。
2. 在公开平台发一条介绍链接。
3. 增加隐私政策页面，说明使用 Google Analytics。
4. 后续如果增加多个页面，记得同步更新 `sitemap.xml`。
5. 不要频繁重复点 `REQUEST INDEXING`，每天一次以内即可。

## 11. 最终检查清单

上线前确认：

- `https://glcalc.vercel.app/` 返回 `200 OK`
- `https://glcalc.vercel.app/robots.txt` 返回 `200 OK`
- `https://glcalc.vercel.app/sitemap.xml` 返回 `200 OK`
- 首页 canonical 是 `https://glcalc.vercel.app/`
- 首页 meta robots 是 `index,follow`
- 页面没有 `noindex`
- GA 请求里包含 `tid=G-PDPYWE3JR5`
- Search Console sitemap 状态是 `Success`
- URL Inspection 显示 `Page can be indexed`

