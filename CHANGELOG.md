# Changelog

## [Unreleased] - 2026-07-25

### Added
- `STAFF` role with granular `AdminPermission[]` (`MANAGE_BLOG`, `MANAGE_WITHDRAWALS`, `APPROVE_CAMPAIGNS`) so admins can grant scoped access instead of full ADMIN rights.
- Central permission→route mapping (`src/lib/admin-access.ts`), shared by `src/proxy.ts`, `AdminSidebar.tsx`, and blog API routes.
- `/admin/users` now splits "Donatur & Pemilik Campaign" vs "Administrator" into separate tabs, with a permission checklist in the Add/Edit dialogs for STAFF accounts.
- Role editing (with permission checklist) from the user detail page (`/admin/users/[id]`).
- Shared `src/components/admin/PermissionChecklist.tsx` component used by both the users list and user detail page.

### Changed
- Removed the `BLOGGER` role entirely — existing BLOGGER accounts were migrated to `STAFF` + `MANAGE_BLOG`. Blog-management access is now checked via `hasBlogAccess()`.
- Added caller-authorization checks to several server actions that previously had none or an incomplete role check: `src/actions/pencairan.ts` (all withdrawal actions), `src/actions/campaign-admin.ts` (`updateCampaignStatus`, `resolveCampaignChangeRequest`, `getCampaignChangeRequests`).

### Removed
- Cancelled the DOKU Payout ("Kirim DOKU") automated withdrawal-disbursement integration per client decision — withdrawal disbursement is manual only (admin transfers from Pesona's bank account to the beneficiary's account, then records it in the system). Deleted `src/lib/doku-payout.ts`, the OTP-gated approval dialog (`OtpVerificationDialog.tsx`, `AdminPhoneDialog.tsx`), `getPayoutsCapability()`, and the related `DOKU_PAYOUT_*` / `DOKU_PAYOUTS_ENABLED` / `NEXT_PUBLIC_DISBURSEMENT_BYPASS_*` env vars.

## [Unreleased] - 2026-02-27

### Added
- Unit tests for Dashboard components (`tests/dashboard.test.ts`).
- Standalone "Fee Yayasan" section in Campaign Admin page with mandatory validation.

### Changed
- Refactored "Fee Yayasan" from tabs to a standalone section before approval in `src/app/admin/campaign/[id]/page.tsx`.
- Updated Dashboard components to use real-time data and removed placeholder labels.
- Removed dummy data fallbacks in `DashboardClient.tsx`.
