import { defineConfig } from "@playwright/test";

const port = process.env.E2E_PORT ?? "4183";
const baseURL = `http://127.0.0.1:${port}/`;

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL,
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
