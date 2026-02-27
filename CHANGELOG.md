# Changelog

## [Unreleased] - 2026-02-27

### Added
- Unit tests for Dashboard components (`tests/dashboard.test.ts`).
- Standalone "Fee Yayasan" section in Campaign Admin page with mandatory validation.

### Changed
- Refactored "Fee Yayasan" from tabs to a standalone section before approval in `src/app/admin/campaign/[id]/page.tsx`.
- Updated Dashboard components to use real-time data and removed placeholder labels.
- Removed dummy data fallbacks in `DashboardClient.tsx`.
