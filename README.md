# DukaSmart — Jua biashara yako

Sales & inventory management MVP for small Tanzanian retail shops (starting
with hardware shops). Built with Next.js (App Router), Tailwind CSS, and
PostgreSQL.

> **Note on stack:** the spec called for Prisma, but Prisma's engine binaries
> are fetched from `binaries.prisma.sh` at install/build time, which isn't
> reachable in this build environment. So this MVP talks to Postgres directly
> through `pg` (node-postgres) with hand-written SQL migrations in `db/schema.sql`.
> Same database, same guarantees, one less moving part — and it drops in fine
> on Railway/Render/Supabase. Swap in Prisma later if you want an ORM; the
> `src/lib/db.ts` query layer is the only place that would need to change.

## Stack

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS 4
- **Backend:** Next.js Route Handlers (`src/app/api/**`)
- **Database:** PostgreSQL (raw SQL via `pg`, see `db/schema.sql`)
- **Auth:** email/password (bcrypt) + JWT session cookie (`jose`), role-based
  (Owner / Employee) via `src/proxy.ts` (Next's middleware/proxy convention)

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start local PostgreSQL** — Docker Compose creates the `dukasmart`
   database and applies the schema automatically on its first start. Copy the
   environment template, choose a local database password and generate a JWT
   secret:
   ```bash
   cp .env.example .env
   # edit POSTGRES_PASSWORD, DATABASE_URL (same password), and JWT_SECRET
   npm run db:up
   ```

   Confirm that it is ready with `docker compose ps`. The database is retained
   in the named `dukasmart_postgres_data` volume when the container stops.
   To use an existing local Postgres server instead, set `DATABASE_URL` and
   run `npm run db:push`.

3. **Create the schema** (only when using an existing Postgres server; Docker
   Compose already does this)
   ```bash
   npm run db:push
   ```

4. **Seed demo data** (creates one demo shop with an Owner + Employee login)
   ```bash
   npm run seed
   ```

5. **Run it**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to see the landing page. New businesses can
   create their own shop and Owner account at `/signup`; the account is signed
   in immediately and redirected to its dashboard.

   **Demo logins:**

   | Role     | Email                     | Password    |
   |----------|---------------------------|-------------|
   | Owner    | owner@dukasmart.test      | owner123    |
   | Employee | employee@dukasmart.test   | employee123 |

## Project layout

```
db/schema.sql          Hand-written Postgres schema (tables, enums, indexes)
db/seed.ts               Seeds demo shop, 20 products, 5 purchases, 30 sales
src/lib/db.ts             Postgres connection pool + query() helper
src/lib/auth.ts            Password hashing, JWT session create/verify
src/lib/reports.ts          Shared daily/monthly report query helpers
src/lib/money.ts             TZS currency formatting
src/proxy.ts               Route protection (login required, owner-only pages)
src/app/login/            Login page
src/app/api/auth/           login / logout / me / register (owner adds staff)
src/app/api/products/        list+create, get/update/delete by id
src/app/api/sales/            list recent sales, create (transactional)
src/app/api/purchases/         list recent purchases, create (transactional)
src/app/api/dashboard/          summary (totals/profit/top/low-stock), chart
src/app/api/reports/             daily, monthly, export (CSV/PDF)
src/app/(app)/              Authenticated pages behind the shared AppShell:
  dashboard/                  Owner dashboard — totals, chart, alerts
  sales/new/                   Record-a-sale — cart, stock, payment status
  products/                     Product catalogue — search/filter/CRUD
  purchases/                     Restocking — form + purchase history
  reports/                        Daily/monthly report + CSV/PDF export
src/components/AppShell.tsx  Shared nav (sidebar on desktop, bottom nav + top
                              bar on mobile), role-aware menu, logout
```

## Data model (`db/schema.sql`)

- `shops` — one row per shop (multi-tenant-ready, though MVP only seeds one)
- `users` — belongs to a shop, `role` is `OWNER` or `EMPLOYEE`
- `products` — name, category, unit, cost price, sell price, stock, low-stock
  threshold
- `sales` / `sale_items` — a sale has one or more line items; each line item
  freezes the `unit_price` and `unit_cost` at time of sale (so later cost
  changes don't distort historical profit)
- `purchases` / `purchase_items` — stock received from suppliers

## Production readiness

The application has tenant-scoped database queries, password hashing, signed
HTTP-only session cookies, role checks at the route and API layer, SQL
parameterization, input validation, and baseline browser security headers.

Before serving real customers, use a managed Postgres provider with backups,
set a strong unique `JWT_SECRET`, serve the application over HTTPS, and set
`NODE_ENV=production`. Do not seed demo data in a production database. The
included Docker Compose setup is for local development only.

## Status — MVP complete ✅

All seven core features from the spec are built and were verified end-to-end
against a real Postgres instance (not just code review):

1. **Product catalogue** — add/edit, search, category filter, low-stock
   filter. Deleting a product with sale/purchase history is blocked (set
   stock to 0 instead) so historical reports never break.
2. **Sales recording** — cart-style product picker, quantity, payment status
   (paid/credit), optional customer name/phone. Stock decrements atomically
   inside a DB transaction with row locking, and overselling is rejected
   (verified: a 99999-unit sale against 72 in stock correctly returns 409).
3. **Purchases/restocking** — record stock received; updates stock and moves
   the product's cost price to the new unit cost.
4. **Low-stock alerts** — per-product configurable threshold, surfaced on the
   dashboard and filterable in the product list.
5. **Owner dashboard** — today's/month's sales, estimated profit
   (revenue − COGS), top-selling products, low-stock list, and a 14-day sales
   chart (Recharts).
6. **Reports** — daily and monthly sales views with revenue, estimated
   profit, and outstanding credit totals; exportable as CSV or PDF
   (PDF generated server-side with `pdfkit` — no headless browser needed).
7. **Roles** — Owner sees everything; Employee can record sales/purchases
   but is redirected away from `/dashboard` and `/reports` (both server-side
   middleware and API-level checks, not just hidden nav links).

**Demo data:** 20 realistic hardware-shop products, 5 restock purchases, and
30 sample sales spread across the last ~3 weeks (mix of paid/credit, with
and without a customer name) — so the dashboard, chart, and reports all show
something real the moment you log in.

**Known simplifications (documented, not hidden):**
- No accounting/bookkeeping, multi-branch, WhatsApp/website integration, AI
  features, or payment gateway — all explicitly out of scope per the spec.
- Cost basis on restock uses "latest cost" (not weighted-average) — simplest
  correct approach for an MVP; a weighted-average COGS model would be a
  natural v2 upgrade.
- No automated test suite — verification here was manual (curl-driven API
  tests plus a build/typecheck pass) rather than a checked-in test file.
  Worth adding before this goes further than a live demo.
# SmartDuka
