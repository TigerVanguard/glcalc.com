// IndexNow submission (IndexNow spec v1, D3). Run by hand after a deploy —
// never part of build or check:
//
//   npm run indexnow                  live sitemap → api.indexnow.org
//   npm run indexnow -- --dry-run     print the payload, send nothing
//   node scripts/indexnow-submit.mjs --dry-run --sitemap dist/sitemap.xml
//
// Reads the sitemap (default https://glucomath.com/sitemap.xml; --sitemap
// takes a local path or a URL), keeps every <loc> in document order and
// refuses any URL whose host is not glucomath.com. A real run then GETs the
// key file at keyLocation and POSTs only if its body is exactly the key;
// IndexNow answering 200 or 202 is success, anything else exits non-zero.
// --dry-run never contacts IndexNow or the key file, and with a local sitemap
// it makes no network request at all. Importing this module only exposes the
// helpers below; main() runs only when the file is executed directly.

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const HOST = "glucomath.com";
export const KEY = "86029e40dc794a3b9a8fe1b14c762680";
export const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
export const DEFAULT_SITEMAP = `https://${HOST}/sitemap.xml`;
export const ENDPOINT = "https://api.indexnow.org/indexnow";

const XML_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

// Every <loc> value, trimmed and entity-decoded, in document order.
export function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(([, loc]) =>
    loc.trim().replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => XML_ENTITIES[name]),
  );
}

// The URLs whose host is not `host` (unparseable values included).
export function foreignHostUrls(urls, host = HOST) {
  return urls.filter((url) => {
    try {
      return new URL(url).host !== host;
    } catch {
      return true;
    }
  });
}

export function buildPayload(urlList) {
  return { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
}

function parseArgs(argv, env) {
  // `npm run indexnow --dry-run` (without `--`) gives the flag to npm, which
  // runs this script without it and only sets npm_config_dry_run.
  const options = { dryRun: env.npm_config_dry_run === "true", sitemap: DEFAULT_SITEMAP };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--dry-run") {
      options.dryRun = true;
    } else if (argv[i] === "--sitemap" && argv[i + 1] && !argv[i + 1].startsWith("--")) {
      options.sitemap = argv[i + 1];
      i += 1;
    } else {
      throw new Error(`unknown or incomplete argument "${argv[i]}" (usage: [--dry-run] [--sitemap <path or URL>])`);
    }
  }
  return options;
}

async function readSitemap(source) {
  if (!/^https?:\/\//i.test(source)) return readFile(source, "utf-8");
  const response = await fetch(source);
  if (!response.ok) throw new Error(`GET ${source} → HTTP ${response.status}`);
  return response.text();
}

// Resolves to the process exit code.
export async function main(argv, env = process.env) {
  const { dryRun, sitemap } = parseArgs(argv, env);

  const urlList = parseSitemapLocs(await readSitemap(sitemap));
  if (urlList.length === 0) {
    console.error(`[indexnow] no <loc> URLs found in ${sitemap}`);
    return 1;
  }
  const foreign = foreignHostUrls(urlList);
  if (foreign.length > 0) {
    console.error(`[indexnow] refusing to submit: ${foreign.length} URL(s) not on ${HOST}:\n  ${foreign.join("\n  ")}`);
    return 1;
  }

  const payload = buildPayload(urlList);
  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return 0;
  }

  // The key has to be served at keyLocation itself, so redirects are not
  // followed; bytes are compared because Response.text() drops a leading BOM.
  const keyResponse = await fetch(KEY_LOCATION, { redirect: "manual" });
  const keyBody = Buffer.from(await keyResponse.arrayBuffer());
  if (keyResponse.status !== 200 || !keyBody.equals(Buffer.from(KEY, "ascii"))) {
    console.error(
      `[indexnow] key file check failed: GET ${KEY_LOCATION} → HTTP ${keyResponse.status}, ${keyBody.length} bytes ${JSON.stringify(keyBody.toString("latin1").slice(0, 80))}`,
    );
    return 1;
  }
  console.log(`[indexnow] key file OK: ${KEY_LOCATION}`);
  console.log(`[indexnow] submitting ${urlList.length} URLs from ${sitemap}:\n  ${urlList.join("\n  ")}`);

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  console.log(`[indexnow] POST ${ENDPOINT} → HTTP ${response.status}`);
  if (response.status === 200 || response.status === 202) {
    if (body) console.log(body);
    return 0;
  }
  console.error(`[indexnow] submission not accepted; response body:\n${body || "(empty)"}`);
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(`[indexnow] FAILED: ${error.message}`);
      process.exitCode = 1;
    },
  );
}
