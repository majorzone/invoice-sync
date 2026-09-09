import pino from "pino";
import { loadConfig } from "./config.js";
import { fetchSettledInvoices } from "./billing.js";
import { summariseLineItems } from "./summary.js";
import { connect, getWatermark, upsertInvoice, setWatermark } from "./db.js";
const log = pino({ level: process.env.LOG_LEVEL || "info" });
async function main() {
  const cfg = loadConfig();
  const pool = connect(cfg);
  const since = await getWatermark(pool);
  const invoices = await fetchSettledInvoices(cfg, since, log);
  let latest = since;
  for (const inv of invoices) {
    const summary = await summariseLineItems(cfg, inv.line_items ?? [], log);
    await upsertInvoice(pool, inv, summary);
    if (inv.settled_at > latest) latest = inv.settled_at;
  }
  if (latest !== since) await setWatermark(pool, latest);
  log.info({ synced: invoices.length, watermark: latest }, "sync complete");
  await pool.end();
}
main().catch((err) => { log.error({ err: err.message }, "sync failed"); process.exit(1); });
