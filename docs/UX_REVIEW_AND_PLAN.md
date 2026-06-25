# UI/UX Review & Implementation Plan — Pesona Kebaikan

> Donation platform. Mobile-first (480px app shell, 960px desktop). Reviewed: layout/navigation, homepage + donation flow, auth + forms.
> Overall: solid foundation, strong trust UX, good mobile patterns. Main gaps: conversion friction, accessibility, dark-mode consistency.

---

## Severity Legend

| Level | Meaning |
|-------|---------|
| 🔴 Critical | Visible breakage or conversion/revenue loss. Fix first. |
| 🟠 High | Real UX harm or accessibility failure (WCAG). |
| 🟡 Medium | Polish, clarity, missing affordances. |
| 🟢 Good | Working well — preserve. |

---

## 🔴 Critical

### C1 — Dark mode broken in multiple places
- **AppBar overlay (home hero) ignores dark theme** — forces white/transparent. Dark-mode user on `/` sees a light header. `src/components/layout/AppBar.tsx:51-54`
- **Hardcoded colors don't adapt to dark:**
  - `src/components/.../NotificationPopover.tsx:104` — `bg-green-50` / `text-green-600`
  - `NotificationPopover.tsx:109` — `text-slate-500` on dark bg → ~3:1 contrast, **fails WCAG AA**
- **No system preference detection** — `prefers-color-scheme: dark` user gets light mode on first visit. `src/components/layout/ThemeWrapper.tsx:18`

### C2 — Phone field mandatory but not validated (donation flow)
- No format check (Indonesian `08xx`). Fails at payment gateway *after* user commits. Conversion killer. `src/components/.../DonationForm.tsx:91-94`

### C3 — Dead CSS on desktop header
- `lg:!bg-[var(--surface)] lg:border-b lg:border-divider` overridden by inline `backgroundColor` style → never applies. Desktop header styling broken. `src/components/layout/AppBar.tsx:47`

---

## 🟠 High

### Conversion friction (donation = core flow)
- **H1** — No payment-method UI; hardcoded `EWALLET`. Show choice or hint. `DonationForm.tsx:108`
- **H2** — Success = auto-close Snackbar (6s). User misses confirmation. Make persistent/dismissible. `CampaignDetailView.tsx:817`
- **H3** — Generic errors: same message for network / declined / validation. Differentiate. `DonationForm.tsx:171`
- **H4** — Errors shown as Snackbar only, no field-level highlight. User can't locate bad field.

### Accessibility (forms)
- **H5** — OTP digit boxes lack `aria-label` — screen readers can't identify each. `VerificationDialog.tsx:550-567`
- **H6** — Auth forms validate only on submit; no inline email/password feedback while typing. `auth/login`, `auth/register`
- **H7** — RadioGroups not wrapped in `<fieldset>/<legend>` — e.g. "Siapa yang sakit?" `galang-dana/buat/page.tsx:1166`
- **H8** — MUI label↔field association incomplete; Typography labels don't reference field IDs (click-label-to-focus broken).

### Readability
- **H9** — Bottom nav label `text-[10px]` = 71% of WCAG 14px min. Low-vision struggle. → 12px min. `BottomNavigation.tsx:74`

---

## 🟡 Medium

- **M1** — Empty states bare ("Belum ada donasi yang sesuai kriteria") — no icon / reset-filter action. `DonationExplorer.tsx:201`
- **M2** — Loading skeletons exist but not triggered on search/filter. Wire up during async. `DonationExplorer.tsx`
- **M3** — Fund transparency buried in modal. For charity, surface withdrawn/remaining summary on main detail view. `CampaignFundraiser.tsx:179`
- **M4** — No back-nav affordance on detail pages (nav hidden; only browser back). Add breadcrumb/back button.
- **M5** — Confirm-password has no live match feedback (only on submit). `auth/register`
- **M6** — No "Step X of Y" in multi-step flows (fundraiser, verification dialog).
- **M7** — Draft auto-save is silent. Add "Tersimpan" toast + timestamp. `galang-dana/buat/page.tsx:495`
- **M8** — Route strings duplicated (`/donasi-saya` etc.) across `AppShell` + `BottomNavigation`. Centralize in constants file.
- **M9** — SearchDropdown results not announced to screen readers. Add `aria-live="polite"` / `role="status"`. `SearchDropdown.tsx:111`
- **M10** — Custom donation amount has no max limit. `DonationForm.tsx`

---

## 🟢 Done well (preserve)

- Skip-to-content link, `aria-current="page"`, semantic `nav`/`header`/`main`
- `safe-area-inset-bottom` for notch; ResizeObserver for dynamic nav height (`--bottom-nav-h`)
- 16px inputs (prevents iOS zoom-on-focus); `prefers-reduced-motion` respected
- Trust signals: progress bar, donor count, verified badge, fund breakdown modal, report button, animated urgent badge
- Password strength checklist + show/hide toggles on register
- Quick-donate preset amounts at top — low-friction entry point
- localStorage draft persistence for fundraiser story
- Fixed bottom CTA + "Pembayaran aman & terenkripsi" badge in payment

---

# Implementation Plan

Four phases, ordered by impact ÷ effort. Each phase self-contained and shippable.

## Phase 1 — Dark mode + dead CSS (fast, self-contained) ✅ DONE
**Goal:** No visible breakage in dark mode; desktop header renders correctly.
- [x] C3 — Removed conflicting inline `backgroundColor`; bg now fully Tailwind (responsive + dark-adaptive via `--surface`). `AppBar.tsx`
- [x] C1a — AppBar overlay variant: desktop always solid surface; mobile overlay `dark:bg-black/20`. `AppBar.tsx`
- [x] C1b — Hardcoded `bg-green-50`/`bg-blue-50`/`text-slate-500/400` → `dark:` variants + `text-foreground/60,40`. `NotificationPopover.tsx`
- [x] C1c — Detect `prefers-color-scheme: dark` on first load (before localStorage fallback). `ThemeWrapper.tsx`
- **Verify:** typecheck clean. Manual: toggle dark mode on `/`, `/donasi`, notifications popover; check contrast ≥4.5:1.

## Phase 2 — Donation conversion (protect revenue)
**Goal:** Reduce drop-off + payment-gateway failures.
- [ ] C2 — Validate phone format (`08xx`, min 10 digits) before submit; inline error. `DonationForm.tsx:91`
- [ ] H4 — Field-level error highlight (not just Snackbar). `DonationForm.tsx:407`
- [ ] H3 — Distinct error messages: network vs declined vs validation. `DonationForm.tsx:171`
- [ ] H2 — Persistent/dismissible success confirmation (not 6s auto-close). `CampaignDetailView.tsx:817`
- [ ] H1 — Payment-method selection UI (or explicit hint if single method). `DonationForm.tsx:108`
- [ ] M10 — Add max donation amount guard.
- **Verify:** submit with bad phone, simulate gateway error, complete happy path.

## Phase 3 — Accessibility batch
**Goal:** Pass WCAG AA on forms + nav.
- [ ] H5 — `aria-label` per OTP digit input. `VerificationDialog.tsx:550`
- [ ] H7 — Wrap RadioGroups in `<fieldset>/<legend>`. `buat/page.tsx:1166`
- [ ] H8 — Associate MUI labels with field IDs (`htmlFor` / MUI label prop).
- [ ] H6 — Inline validation on auth forms (email format, password live). `auth/login`, `auth/register`
- [ ] M5 — Live confirm-password match feedback. `auth/register`
- [ ] H9 — Bottom nav label `text-[10px]` → `text-[12px]`. `BottomNavigation.tsx:74`
- [ ] M9 — `aria-live="polite"` on search results. `SearchDropdown.tsx:111`
- **Verify:** keyboard tab-through; screen reader (NVDA/VoiceOver) on OTP + search.

## Phase 4 — Polish
**Goal:** Clarity + perceived quality.
- [ ] M1 — Rich empty states (icon + reset-filter CTA). `DonationExplorer.tsx:201`
- [ ] M2 — Trigger skeletons during search/filter async. `DonationExplorer.tsx`
- [ ] M3 — Surface fund withdrawn/remaining summary on detail view. `CampaignFundraiser.tsx`
- [ ] M4 — Back-nav affordance on nav-hidden detail pages.
- [ ] M6 — "Step X of Y" in multi-step flows.
- [ ] M7 — "Tersimpan" draft-save toast. `buat/page.tsx:495`
- [ ] M8 — Centralize route constants (shared by AppShell + BottomNav).
- **Verify:** empty search, slow network skeletons, long-form step indicator.

---

## Suggested start
**Phase 1** (dark mode + dead CSS) — fast, isolated, removes visible breakage. Then **Phase 2** if revenue is priority, or **Phase 3** if accessibility/compliance is priority.
