const required = ["DATABASE_URL","BILLING_API_BASE","BILLING_API_KEY","SUMMARY_MODEL_BASE_URL","SUMMARY_MODEL_KEY"];
export function loadConfig(env = process.env) {
  const missing = required.filter((k) => !env[k]);
  if (missing.length) throw new Error(`missing config: ${missing.join(", ")}`);
  return {
    databaseUrl: env.DATABASE_URL,
    billingApiBase: env.BILLING_API_BASE.replace(/\/$/, ""),
    billingApiKey: env.BILLING_API_KEY,
    summaryModelBaseUrl: env.SUMMARY_MODEL_BASE_URL.replace(/\/$/, ""),
    summaryModelKey: env.SUMMARY_MODEL_KEY,
    logLevel: env.LOG_LEVEL || "info",
  };
}
