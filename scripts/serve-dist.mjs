// Small static file server for the dist/ directory.
//
// Two modes (Spec §8 T0-2):
//   - spaFallback: true  → unresolved HTML navigations fall back to dist/index.html.
//     Used ONLY inside scripts/prerender.mjs, where dist/ still contains just the
//     root index.html and sub-routes must render via the client router.
//   - spaFallback: false → unresolved paths return HTTP 404 (serving dist/404.html
//     if present). Used as the Playwright "static" project webServer, emulating
//     Vercel file-system routing (cleanUrls, no catch-all rewrite, and a 308
//     redirect from /route/ to /route mirroring trailingSlash: false).
//
// `vite preview` was rejected: its default SPA appType falls back every unknown
// path to index.html with HTTP 200, which is exactly the soft-404 behavior the
// static e2e project must prove absent.

import http from "node:http";
import { existsSync, statSync, createReadStream } from "node:fs";
import { join, normalize, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
};

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function sendFile(res, filePath, status = 200) {
  const type = MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";
  res.writeHead(status, { "Content-Type": type });
  createReadStream(filePath).pipe(res);
}

export function createDistServer({ root, spaFallback = false }) {
  const distRoot = resolve(root);

  return http.createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Method Not Allowed");
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Bad Request");
      return;
    }

    // Emulate Vercel trailingSlash: false → 308 redirect /route/ → /route.
    if (pathname.length > 1 && pathname.endsWith("/")) {
      res.writeHead(308, { Location: pathname.replace(/\/+$/, "") });
      res.end();
      return;
    }

    // Resolve inside dist/ only (block traversal).
    const safePath = normalize(pathname).replace(/^([.][.][/\\])+/, "");
    const basePath = join(distRoot, safePath);
    if (!basePath.startsWith(distRoot)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    // File-system routing: exact file, then cleanUrls-style <path>/index.html.
    if (pathname !== "/" && isFile(basePath)) {
      sendFile(res, basePath);
      return;
    }
    const indexCandidate = pathname === "/" ? join(distRoot, "index.html") : join(basePath, "index.html");
    if (isFile(indexCandidate)) {
      sendFile(res, indexCandidate);
      return;
    }

    if (spaFallback) {
      // Prerender-internal mode: every unresolved navigation gets the root shell.
      sendFile(res, join(distRoot, "index.html"));
      return;
    }

    const notFoundPage = join(distRoot, "404.html");
    if (isFile(notFoundPage)) {
      sendFile(res, notFoundPage, 404);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  });
}

// CLI entry: `node scripts/serve-dist.mjs --port 4184` (404 mode, for Playwright).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const portFlag = process.argv.indexOf("--port");
  const port = portFlag !== -1 ? Number(process.argv[portFlag + 1]) : 4184;
  const root = join(process.cwd(), "dist");

  if (!isFile(join(root, "index.html"))) {
    console.error(`[serve-dist] ${root}\\index.html not found — run \`npm run build\` first.`);
    process.exit(1);
  }

  createDistServer({ root, spaFallback: false }).listen(port, "127.0.0.1", () => {
    console.log(`[serve-dist] serving ${root} at http://127.0.0.1:${port} (404 mode)`);
  });
}
