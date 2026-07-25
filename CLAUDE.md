# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000 (Turbopack)
pnpm dev2             # Start on 0.0.0.0 (LAN access)
pnpm build            # Production build
pnpm start            # Start production server

# Code quality
pnpm lint             # ESLint on src/**/*.{ts,tsx,js,jsx}
pnpm typecheck        # TypeScript check without emit

# Database
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma db push           # Push schema to DB without migration (use for local dev)
npx prisma migrate dev       # Create a new migration (use carefully — resets data on drift)
npx prisma studio            # GUI for database inspection

# Seeding
tsx prisma/seed.ts            # Full seed (users, campaigns, blogs, categories)
pnpm seed:categories          # Categories only
pnpm seed:address             # Indonesian address hierarchy only

# Tests
pnpm test                     # Run tests via tsx tests/run.ts
```

> **Important:** After any `prisma/schema.prisma` change, always run `npx prisma generate` to sync the client. If the dev server is running, kill all Node processes first (`Stop-Process -Name "node" -Force` on Windows) before generating — the DLL file will be locked otherwise.

## Environment Variables

Key variables needed in `.env.local`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth JWT signing secret |
| `PAYMENT_PROVIDER` | `doku` (only payment provider) |
| `DOKU_CLIENT_ID` / `DOKU_SECRET_KEY` | DOKU checkout credentials |
| `DOKU_PAYOUTS_ENABLED` / `DOKU_PAYOUT_*` | DOKU Payout (Kirim DOKU) — separate credentials, used for automated withdrawal disbursement |
| `S3_ENDPOINT`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Object storage |
| `S3_ROOT_DIR` | Upload prefix directory (e.g. `uploads`) |
| `EMAIL_SERVER_HOST/PORT/USER/PASSWORD` | SMTP for transactional email |
| `NEXT_PUBLIC_APP_URL` | Public-facing origin |
| `NEXT_PUBLIC_BYPASS_OTP` | Set `true` in dev to skip SMS OTP |

## Architecture Overview

### App Router Layout

This is a Next.js 16 App Router project. Pages are either server components (default) or client components (`"use client"`). Server actions live in `src/actions/` and are called directly from both server and client components.

- `/` — Homepage (server component, fetches banners + campaign lists)
- `/donasi/` — Public campaign listing & detail (`/donasi/[slug]`)
- `/galang-dana/` — Authenticated fundraiser management (create, list, detail)
- `/admin/` — Admin dashboard (role-guarded; campaign approval, user management, withdrawals, CMS)
- `/auth/` — Login, register, OTP, password reset
- `/api/` — Webhook endpoints and a few REST routes

**Route guard:** Middleware (`src/middleware.ts`) handles role-based access. Admin routes require `role === "ADMIN"`. Auth pages redirect if session already exists.

### Server Actions vs API Routes

Prefer **server actions** (`src/actions/*.ts`) for all user-triggered mutations. API routes (`src/app/api/`) are used for:
- Payment webhooks (DOKU: `/api/doku/notification`)
- Checkout initiation (`/api/payment/checkout`)
- Third-party integrations where POST from external services is needed

Server action return shape is always `{ success: boolean; error?: string; data?: T }`.

### Prisma & Database

Prisma client is instantiated as a singleton in `src/lib/prisma.ts` using the `@prisma/adapter-pg` adapter (raw `pg.Pool`) — **not** the default Prisma connection pooling. Always import `prisma` from `@/lib/prisma`, never instantiate `PrismaClient` directly in component files.

Key schema relationships:
- `Campaign` ← `CampaignMedia`, `Donation`, `Withdrawal`, `CampaignUpdate`, `Fundraiser`
- `Campaign.status`: `DRAFT → PENDING → ACTIVE | REJECTED`. When status changes `PENDING → ACTIVE`, `start` and `end` are reset from today (handled in `src/actions/campaign-admin.ts:updateCampaignStatus`).
- `Fundraiser` is a sub-campaign under a `Campaign`; donations can target either.
- `Donation.status`: `PENDING → PAID → SETTLED | FAILED | REFUNDED`
- `User.role`: `USER | ADMIN` — no other roles exist.

### Authentication

NextAuth v5 (beta) with JWT strategy. Auth is exported from `src/lib/auth.ts` (handlers, `auth`, `signIn`, `signOut`). The session callback adds `id` and `role` to the session user object. Always call `const session = await auth()` inside server actions to get the current user — never trust client-passed user IDs.

### Payment System

`src/lib/payment/` has a pluggable provider abstraction (currently only `DokuProvider`, implementing the `PaymentProvider` interface in `src/lib/payment/types.ts`) so a second provider could be added again later without touching call sites. `getPaymentProvider()` always returns `DokuProvider`. The webhook handler parses DOKU's notification and calls shared donation settlement logic.

Withdrawal disbursement (`src/actions/pencairan.ts`) is a separate concern from checkout — it optionally calls DOKU Payout (`src/lib/doku-payout.ts`, env-gated by `DOKU_PAYOUTS_ENABLED`) when approving a withdrawal; falls back to manual admin-recorded transfers otherwise.

### Image Uploads

All file uploads go through `src/actions/upload.ts`:
- `uploadImage(formData)` — general images, resized to max 1600×1600, converted to WebP
- `uploadCoverFile(formData)` — campaign cover, hard-cropped to **664×357 px** (`fit: cover`)
- Sharp is loaded dynamically (`await import("sharp")`) to avoid build-time issues
- `.rotate()` is called before resize to fix EXIF orientation from phone cameras
- Files are uploaded to S3-compatible storage; URL is returned as `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${key}`

When adding new upload use cases, extend `uploadFile(formData, imageOptions?)` — do not duplicate the S3 logic.

### Campaign Visibility Rules

Public-facing pages (`src/actions/campaign-public.ts`) always filter:
```ts
{ status: "ACTIVE", end: { gte: new Date() } }
```
Admin panel uses raw status counts without date filter — if active campaigns disappear from homepage but show in admin, the root cause is usually expired `end` dates (e.g., approved but `end` wasn't reset). The approval flow in `updateCampaignStatus` resets `start/end` automatically now, but historical data may need a one-off fix script.

Owner-facing campaign lists (`getCampaigns` in `src/actions/campaign.ts`) **skip** the end-date filter when `userId` is provided, so owners always see their own campaigns regardless of end date.

### UI Stack

- **MUI v7** for admin dashboard and complex UI (forms, tables, dialogs)
- **Tailwind CSS v4** for public-facing pages
- Both coexist — do not mix them in the same component unless necessary
- **SunEditor** (`suneditor-react`) is used as the rich text editor for campaign stories and admin blog editing
- **react-easy-crop** for image cropping in the upload flow

### Key Constants & Utilities

- `src/lib/constants.ts` — `CATEGORY_TITLE` map, `QUICK_DONATION_SLUG` (`"donasi-cepat"`) is a reserved campaign slug with special handling throughout the codebase
- `src/lib/currency.ts` — Indonesian Rupiah formatting helpers
- `src/lib/date.ts` — date-fns wrappers for localized date display
- `src/lib/fee-calculator.ts` — payment fee computation per method

### Cache Invalidation

After mutations, call `revalidatePath("/relevant-path")` in server actions. In client components, call `router.refresh()` before `router.push()` to bust the Next.js router cache — omitting this causes stale list pages after creation/update.
