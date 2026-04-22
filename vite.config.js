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
  build: {
    outDir: resolve(__dirname, "dist"),
  },
});
