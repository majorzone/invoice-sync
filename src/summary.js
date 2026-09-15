import { request } from "undici";
// Summarise an invoice's line items with the internal model gateway.
export async function summariseLineItems(cfg, items, log) {
  const prompt = items.map((i) => `${i.quantity}x ${i.description}`).join("\n");
  try {
    const res = await request(`${cfg.summaryModelBaseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${cfg.summaryModelKey}` },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          { role: "system", content: "Summarise these invoice line items in one line." },
          { role: "user", content: prompt },
        ],
        max_tokens: 60, stream: false,
      }),
    });
    if (res.statusCode !== 200) { log.warn({ status: res.statusCode }, "summary model returned non-200"); return null; }
    const body = await res.body.json();
    return body.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) { log.warn({ err: err.message }, "summary model call failed"); return null; }
}
