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
- **Auth:** Supabase Auth email/password sessions with shop roles stored in
   PostgreSQL and protected through `src/proxy.ts`

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase.** Copy the environment template and replace its
   placeholders with the Supabase project URL, publishable key, service-role key, and
   Transaction Pooler connection string:
   ```bash
   cp .env.example .env.local
   ```
   The Supabase secret key is server-only; never expose it through a `NEXT_PUBLIC_`
   variable or commit it. Supabase Auth must be enabled for email/password.

3. **Create the schema.** Run `db/schema.sql` in the Supabase SQL Editor. If
   applying this auth change to an existing DukaSmart database, run
   `db/migrations/20260928_supabase_auth.sql` instead.

4. **Run it**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to see the landing page. New businesses can
   create their own shop and Owner account at `/signup`; the account is signed
   in immediately and redirected to its dashboard.

## Deploy to Vercel + Supabase

1. **Create a Supabase project.** Enable email/password authentication. In the
   SQL Editor, run `db/schema.sql` for a new database, or
   `db/migrations/20260928_supabase_auth.sql` for an existing DukaSmart
   database. Existing users can sign in with their current password once;
   that first successful login links their profile to Supabase Auth.

2. **Copy the database connection string.** In Supabase, open **Connect** and
   select the **Transaction pooler** connection string. It is intended for
   serverless applications and typically uses port `6543`. Keep the supplied
   `sslmode=require` setting, and URL-encode any reserved characters in the
   database password if you build the URL yourself. The app uses ordinary
   parameterized queries and explicit transactions, which are supported by
   the transaction pooler.

3. **Import the repository into Vercel.** Keep the detected Next.js settings
   and add these Project Environment Variables for Production (and Preview if
   those deployments should use a database):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Supabase Transaction pooler connection string |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase API settings |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
   | `SUPABASE_SECRET_KEY` | Supabase secret key; server-only |
   | `NEXT_PUBLIC_SITE_URL` | Canonical production origin, e.g. `https://dukasmart.online` (no trailing slash) |

   Do not include quotation marks around the values in Vercel. Keep
   production and preview databases separate where possible. Never expose or
   commit the service-role key.

4. **Connect your domain and enable indexing.** Add the purchased domain to the Vercel project and configure the DNS records Vercel provides. Once HTTPS works on the preferred host, set `NEXT_PUBLIC_SITE_URL` to that exact origin (for example `https://dukasmart.online`, without a trailing slash) in Vercel's Production Environment Variables, then redeploy. Use one preferred host and configure the other host to redirect to it. The app uses this value for canonical URLs, Open Graph URLs, and `sitemap.xml`; without it, the sitemap is empty and canonical URLs are omitted. After deployment, open `/robots.txt` and `/sitemap.xml`, then submit the sitemap in Google Search Console and Bing Webmaster Tools. Search engines decide when and how pages appear; metadata cannot guarantee rankings.

5. **Deploy.** Vercel runs `npm run build` and serves the Next.js app. The
   production database pool is limited to one connection per serverless
   instance to reduce connection pressure; use Supabase's Transaction pooler
   rather than a direct database connection. After deployment, verify signup,
   login, product creation, and a sale in the production environment.

Do not run `db/seed.ts` against a production project; it creates demo accounts
and shop data. Never put production secrets in source control.

## Project layout

```
db/schema.sql          Hand-written Postgres schema (tables, enums, indexes)
db/seed.ts               Seeds demo shop, 20 products, 5 purchases, 30 sales
src/lib/db.ts             Postgres connection pool + query() helper
src/lib/auth.ts            Supabase Auth session and shop-profile lookup
src/lib/supabase/          Supabase SSR and server-only admin clients
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
- `users` — belongs to a shop, links to a Supabase Auth identity, and stores
   the `OWNER` or `EMPLOYEE` role
- `products` — name, category, unit, cost price, sell price, stock, low-stock
  threshold
- `sales` / `sale_items` — a sale has one or more line items; each line item
  freezes the `unit_price` and `unit_cost` at time of sale (so later cost
  changes don't distort historical profit)
- `purchases` / `purchase_items` — stock received from suppliers

## Production readiness

The application has tenant-scoped database queries, Supabase Auth-managed
HTTP-only sessions, role checks at the route and API layer, SQL
parameterization, input validation, and baseline browser security headers.

Before serving real customers, use a managed Postgres provider with backups,
keep the service-role key private, serve the application over HTTPS, and set
`NODE_ENV=production`. Do not seed demo data in a production database.

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
