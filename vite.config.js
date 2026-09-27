import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import handleBarcodeRequest from "./api/barcode.js";
import handlePhotoIdentifyRequest from "./api/photo-identify.js";

function barcodeApiPlugin() {
  return {
    name: "barcode-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/barcode")) {
          next();
          return;
        }

        const origin = `http://${req.headers.host ?? "localhost"}`;
        const request = new Request(new URL(req.url, origin), {
          method: req.method,
        });
        const response = await handleBarcodeRequest(request);
        const body = await response.text();

        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(body);
      });
    },
  };
}

function photoApiPlugin() {
  return {
    name: "photo-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/photo-identify")) {
          next();
          return;
        }

        const origin = `http://${req.headers.host ?? "localhost"}`;
        const chunks = [];

        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk));
        }

        const request = new Request(new URL(req.url, origin), {
          method: req.method,
          headers: req.headers,
          body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
        });
        const response = await handlePhotoIdentifyRequest(request);
        const body = await response.text();

        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(body);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), barcodeApiPlugin(), photoApiPlugin()],
  define: {
    // Build-day ISO date, consumed by ToolFooter's "Last updated" line (Spec §4 P2-7).
    "import.meta.env.VITE_BUILD_DATE": JSON.stringify(
      new Date().toISOString().slice(0, 10),
    ),
  },
  // JSON modules ship as JSON.parse("…"), which parses far faster than the
  // equivalent object literal (gi.json is ~280 KB). Named imports from JSON
  // stop working under this flag — default imports only (perf spec PF-02, D8).
  json: {
    stringify: true,
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      output: {
        // Asset URLs are public: no chunk name may contain "glcalc" in any
        // case (perf spec D11), which Rollup's default [name] would produce
        // for GlCalculatorPage. The entry keeps its index-[hash].js name.
        chunkFileNames: (chunk) =>
          chunk.name === "GlCalculatorPage"
            ? "assets/gl-calculator-[hash].js"
            : "assets/[name]-[hash].js",
      },
    },
  },
});
