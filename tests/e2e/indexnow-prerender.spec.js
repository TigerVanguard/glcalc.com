// IndexNow key file (IndexNow spec v1, IN-01), static project: the built dist/
// must serve the public key file from the site root, its body exactly the
// key. The filename ends in "prerender.spec.js" so playwright.config.js routes
// it to the static project (testMatch /(prerender|seo)\.spec\.js/). The key is
// hardcoded here, independent of scripts/indexnow-submit.mjs.

import { test, expect } from "@playwright/test";

const KEY = "86029e40dc794a3b9a8fe1b14c762680";

test(`GET /${KEY}.txt returns 200 with exactly the key as its body`, async ({ request }) => {
  const response = await request.get(`/${KEY}.txt`, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(await response.text()).toBe(KEY);
});
