import pg from "pg";
export function connect(cfg) { return new pg.Pool({ connectionString: cfg.databaseUrl, max: 4 }); }
export async function getWatermark(pool) {
  const { rows } = await pool.query("select value from sync_state where key = 'invoice_watermark'");
  return rows[0]?.value ?? "1970-01-01T00:00:00Z";
}
export async function upsertInvoice(pool, inv, summary) {
  await pool.query(
    `insert into analytics.invoices (id, customer_id, amount_cents, currency, settled_at, summary)
     values ($1,$2,$3,$4,$5,$6) on conflict (id) do update set summary = excluded.summary`,
    [inv.id, inv.customer_id, inv.amount_cents, inv.currency, inv.settled_at, summary]);
}
export async function setWatermark(pool, ts) {
  await pool.query(
    `insert into sync_state (key, value) values ('invoice_watermark', $1)
     on conflict (key) do update set value = excluded.value`, [ts]);
}
