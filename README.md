# invoice-sync

Pulls settled invoices from the billing provider and upserts them into the
`analytics.invoices` table in the warehouse. Runs every 15 minutes as a cron
job on the data platform.

## Setup

```sh
cp .env.example .env     # fill in the values
npm install
npm start
```

## Configuration

All configuration is read from the environment (see `.env.example`):

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | Postgres connection string for the warehouse |
| `BILLING_API_BASE` | Base URL of the billing provider API |
| `BILLING_API_KEY` | Read-only key for the billing provider |
| `SUMMARY_MODEL_BASE_URL` | Internal LLM gateway, used to summarise line items |
| `SUMMARY_MODEL_KEY` | Key for the summary model gateway |
| `LOG_LEVEL` | `debug`, `info` (default) or `warn` |

## How it works

1. Fetch invoices settled since the last watermark.
2. For each invoice, generate a one-line summary of its line items.
3. Upsert into `analytics.invoices`, advancing the watermark.

Line-item summaries use the internal model gateway so we don't ship raw
customer descriptions to a third party.

## Runbook

- Logs go to stdout (JSON, via pino). The platform ships them to the log store.
- The job is idempotent; a failed run is retried on the next tick.
- Watermark lives in `sync_state`. To re-run a window, roll it back by hand.
