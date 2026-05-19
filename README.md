# Talos Ledger

Talos Ledger is a full-stack SaaS web app for CA firms to manage client-wise invoice workflows, AI extraction, GST review, and Excel-ready reporting.

## Stack

- Next.js 15 App Router
- TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- Gemini API for GST invoice extraction
- XLSX export generation

## Core workflow

1. Admin creates a firm workspace and staff users.
2. Clients are added with GST and contact metadata.
3. PDFs are uploaded client-wise.
4. Talos Ledger stores the file, creates invoice records, and runs Gemini extraction.
5. Team reviews extracted fields with confidence scores and validations.
6. Approved invoices flow into dashboard analytics, GST reports, and Excel exports.

## Environment

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`
- `SESSION_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `NEXT_PUBLIC_APP_URL`

Default extraction model is set to `gemini-2.5-flash` to match the requested build, but it is fully configurable through environment variables.

## Local setup

Start Postgres if needed:

```bash
docker compose up -d postgres
```

Then:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Seeded demo login

- Admin: `admin@talosledger.demo`
- Staff: `staff@talosledger.demo`
- Password: `Password123!`

The seeded sample clients and invoices belong only to the dedicated demo firm. Because all app data is scoped by `firmId`, those sample records are visible only when logged into the demo credentials above, and not to any newly created CA firm account.

## Notes

- Uploads are stored under `public/uploads` in this starter.
- Extraction currently uses direct PDF text extraction plus Gemini document parsing for scanned PDFs.
- For production rollout, wire `public/uploads` to object storage and connect password recovery to your email provider.
