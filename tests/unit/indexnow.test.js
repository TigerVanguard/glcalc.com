// IndexNow spec v1 (IN-01): scripts/indexnow-submit.mjs. The pure helpers
// (sitemap <loc> parsing, payload, host check) plus main() with fetch stubbed,
// so no test here ever reaches the network. The key, key location, endpoint
// and the 9 route URLs are hardcoded HERE, independent of the script's
// constants, so a typo there cannot self-certify.

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPayload, foreignHostUrls, main, parseSitemapLocs } from "../../scripts/indexnow-submit.mjs";

const KEY = "86029e40dc794a3b9a8fe1b14c762680";
const KEY_LOCATION = "https://glucomath.com/86029e40dc794a3b9a8fe1b14c762680.txt";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const LIVE_SITEMAP = "https://glucomath.com/sitemap.xml";

// The 9 prerendered routes, in sitemap order.
const ROUTE_URLS = [
  "https://glucomath.com/",
  "https://glucomath.com/glycemic-load-calculator",
  "https://glucomath.com/glycemic-load-chart",
  "https://glucomath.com/glycemic-index-calculator",
  "https://glucomath.com/gmi-calculator",
  "https://glucomath.com/a1c-to-eag-calculator",
  "https://glucomath.com/blood-sugar-converter",
  "https://glucomath.com/glucose-to-a1c-estimator",
  "https://glucomath.com/about",
];

// Same shape as the dist/sitemap.xml written by scripts/prerender.mjs.
const SAMPLE_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://glucomath.com/</loc>
    <lastmod>2026-09-20</lastmod>
  </url>
  <url>
    <loc>https://glucomath.com/glycemic-load-calculator</loc>
    <lastmod>2026-09-20</lastmod>
  </url>
  <url>
    <loc>https://glucomath.com/glycemic-load-chart</loc>
    <lastmod>2026-09-20</lastmod>
  </url>
  <url>
    <loc>https://glucomath.com/glycemic-index-calculator</loc>
    <lastmod>2026-09-20</lastmod>
  </url>
  <url>
    <loc>https://glucomath.com/gmi-calculator</loc>
    <lastmod>2026-09-29</lastmod>
  </url>
  <url>
    <loc>https://glucomath.com/a1c-to-eag-calculator</loc>
    <lastmod>2026-09-13</lastmod>
  </url>
  <url>
    <loc>https://glucomath.com/blood-sugar-converter</loc>
    <lastmod>2026-09-29</lastmod>
  </url>
  <url>
    <loc>https://glucomath.com/glucose-to-a1c-estimator</loc>
    <lastmod>2026-09-29</lastmod>
  </url>
  <url>
    <loc>https://glucomath.com/about</loc>
    <lastmod>2026-09-17</lastmod>
  </url>
</urlset>
`;

const FOREIGN_URL = "https://example.com/x";
const SITEMAP_WITH_FOREIGN_URL = SAMPLE_SITEMAP.replace(
  "</urlset>",
  `  <url>\n    <loc>${FOREIGN_URL}</loc>\n  </url>\n</urlset>`,
);

const EXPECTED_PAYLOAD = {
  host: "glucomath.com",
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: ROUTE_URLS,
};

describe("IndexNow helpers (IN-01)", () => {
  it("parses all 9 <loc> URLs from the sample sitemap, in document order", () => {
    expect(parseSitemapLocs(SAMPLE_SITEMAP)).toEqual(ROUTE_URLS);
  });

  it("trims whitespace inside <loc> and decodes XML entities", () => {
    const xml = "<urlset><url><loc>\n  https://glucomath.com/?a=1&amp;b=2\n</loc></url></urlset>";
    expect(parseSitemapLocs(xml)).toEqual(["https://glucomath.com/?a=1&b=2"]);
  });

  it("builds the payload: host, key, keyLocation, urlList — in that order on the wire", () => {
    expect(buildPayload(ROUTE_URLS)).toEqual(EXPECTED_PAYLOAD);
    expect(JSON.stringify(buildPayload(["https://glucomath.com/"]))).toBe(
      '{"host":"glucomath.com","key":"86029e40dc794a3b9a8fe1b14c762680","keyLocation":"https://glucomath.com/86029e40dc794a3b9a8fe1b14c762680.txt","urlList":["https://glucomath.com/"]}',
    );
  });

  it("finds no foreign host in the sample sitemap", () => {
    expect(foreignHostUrls(parseSitemapLocs(SAMPLE_SITEMAP))).toEqual([]);
  });

  it("flags a URL on another host mixed into the sitemap", () => {
    const urls = parseSitemapLocs(SITEMAP_WITH_FOREIGN_URL);
    expect(urls).toHaveLength(10);
    expect(foreignHostUrls(urls)).toEqual([FOREIGN_URL]);
  });

  it("treats subdomains, look-alike hosts, other ports and non-URLs as foreign", () => {
    const suspects = [
      "https://www.glucomath.com/",
      "https://glucomath.com.example.com/",
      "https://glucomath.com:8443/",
      "not a url",
    ];
    expect(foreignHostUrls([...ROUTE_URLS, ...suspects])).toEqual(suspects);
  });
});

describe("IndexNow main() with fetch stubbed (IN-01)", () => {
  let dir;
  let sitemapFile;
  let stdout;
  let stderr;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "indexnow-test-"));
    sitemapFile = join(dir, "sitemap.xml");
    writeFileSync(sitemapFile, SAMPLE_SITEMAP);
    stdout = [];
    stderr = [];
    vi.spyOn(console, "log").mockImplementation((...args) => stdout.push(args.join(" ")));
    vi.spyOn(console, "error").mockImplementation((...args) => stderr.push(args.join(" ")));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    rmSync(dir, { recursive: true, force: true });
  });

  // Serves the live sitemap, the key file and the IndexNow endpoint; any other
  // URL fails the test.
  function stubFetch({ keyStatus = 200, keyBody = KEY, submitStatus = 202, submitBody = "" } = {}) {
    const fetchMock = vi.fn(async (url) => {
      if (url === LIVE_SITEMAP) return new Response(SAMPLE_SITEMAP, { status: 200 });
      if (url === KEY_LOCATION) return new Response(keyBody, { status: keyStatus });
      if (url === ENDPOINT) return new Response(submitBody, { status: submitStatus });
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("--dry-run with a local sitemap prints only the payload JSON and never calls fetch", async () => {
    const fetchMock = stubFetch();
    expect(await main(["--dry-run", "--sitemap", sitemapFile], {})).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.parse(stdout.join("\n"))).toEqual(EXPECTED_PAYLOAD);
    expect(stderr).toEqual([]);
  });

  it("--dry-run without --sitemap reads the live sitemap only (no key file, no IndexNow)", async () => {
    const fetchMock = stubFetch();
    expect(await main(["--dry-run"], {})).toBe(0);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([LIVE_SITEMAP]);
    expect(JSON.parse(stdout.join("\n"))).toEqual(EXPECTED_PAYLOAD);
  });

  it("npm_config_dry_run=true (npm run indexnow --dry-run, no --) is still a dry run", async () => {
    const fetchMock = stubFetch();
    expect(await main(["--sitemap", sitemapFile], { npm_config_dry_run: "true" })).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.parse(stdout.join("\n"))).toEqual(EXPECTED_PAYLOAD);
  });

  it("a real run checks the key file, then POSTs the JSON payload; 202 exits 0", async () => {
    const fetchMock = stubFetch({ submitStatus: 202 });
    expect(await main(["--sitemap", sitemapFile], {})).toBe(0);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([KEY_LOCATION, ENDPOINT]);
    const [, init] = fetchMock.mock.calls[1];
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json; charset=utf-8" });
    expect(JSON.parse(init.body)).toEqual(EXPECTED_PAYLOAD);
    expect(stdout.join("\n")).toContain("HTTP 202");
  });

  it("IndexNow answering 200 also exits 0", async () => {
    stubFetch({ submitStatus: 200 });
    expect(await main(["--sitemap", sitemapFile], {})).toBe(0);
    expect(stdout.join("\n")).toContain("HTTP 200");
  });

  it("any other IndexNow status exits non-zero and prints the response body", async () => {
    stubFetch({ submitStatus: 422, submitBody: "URLs do not belong to the host" });
    expect(await main(["--sitemap", sitemapFile], {})).toBe(1);
    expect(stdout.join("\n")).toContain("HTTP 422");
    expect(stderr.join("\n")).toContain("URLs do not belong to the host");
  });

  it("never POSTs unless the key file answers 200 with exactly the key", async () => {
    const badKeyFiles = [
      { keyBody: `${KEY}\n` },
      { keyBody: `\uFEFF${KEY}` },
      { keyBody: "0123456789abcdef0123456789abcdef" },
      { keyStatus: 404, keyBody: "Not Found" },
      { keyStatus: 308, keyBody: KEY },
    ];
    for (const keyFile of badKeyFiles) {
      const fetchMock = stubFetch(keyFile);
      expect(await main(["--sitemap", sitemapFile], {}), JSON.stringify(keyFile)).toBe(1);
      expect(fetchMock.mock.calls.map(([url]) => url), JSON.stringify(keyFile)).toEqual([KEY_LOCATION]);
    }
  });

  it("refuses a sitemap holding a foreign-host URL before any request, dry run or not", async () => {
    writeFileSync(sitemapFile, SITEMAP_WITH_FOREIGN_URL);
    const fetchMock = stubFetch();
    expect(await main(["--sitemap", sitemapFile], {})).toBe(1);
    expect(await main(["--dry-run", "--sitemap", sitemapFile], {})).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(stdout).toEqual([]);
    expect(stderr.join("\n")).toContain(FOREIGN_URL);
  });

  it("rejects unknown or incomplete arguments instead of submitting", async () => {
    const fetchMock = stubFetch();
    await expect(main(["--dryrun", "--sitemap", sitemapFile], {})).rejects.toThrow('"--dryrun"');
    await expect(main(["--sitemap"], {})).rejects.toThrow('"--sitemap"');
    await expect(main(["--sitemap", "--dry-run"], {})).rejects.toThrow('"--sitemap"');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
