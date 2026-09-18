import { test } from "node:test";
import assert from "node:assert";
import { loadConfig } from "../src/config.js";
test("loadConfig throws when required vars are missing", () => {
  assert.throws(() => loadConfig({}), /missing config/);
});
test("loadConfig strips trailing slashes from base URLs", () => {
  const cfg = loadConfig({ DATABASE_URL: "postgres://x", BILLING_API_BASE: "https://api.example.com/v2/",
    BILLING_API_KEY: "k", SUMMARY_MODEL_BASE_URL: "http://gw.internal:8000/v1/", SUMMARY_MODEL_KEY: "k" });
  assert.strictEqual(cfg.billingApiBase, "https://api.example.com/v2");
  assert.strictEqual(cfg.summaryModelBaseUrl, "http://gw.internal:8000/v1");
});
