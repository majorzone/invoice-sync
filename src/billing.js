import { request } from "undici";
export async function fetchSettledInvoices(cfg, since, log) {
  const url = `${cfg.billingApiBase}/invoices?status=paid&settled_since=${encodeURIComponent(since)}`;
  const res = await request(url, { headers: { authorization: `Bearer ${cfg.billingApiKey}` } });
  if (res.statusCode !== 200) throw new Error(`billing API ${res.statusCode}`);
  const body = await res.body.json();
  log.info({ count: body.data?.length ?? 0 }, "fetched settled invoices");
  return body.data ?? [];
}
