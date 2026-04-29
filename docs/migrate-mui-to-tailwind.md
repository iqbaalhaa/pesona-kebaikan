# Migrate MUI → Tailwind Only

## Phase 1: Foundation
- [x] CSS variables for theme colors (light/dark) in `globals.css`
- [x] Tailwind `@theme` config: `surface`, `divider`, `text-secondary`, `success`, `warning`, `error`, `info`
- [x] Install `lucide-react` + `@headlessui/react`
- [x] Create utility components in `src/components/ui/tw/` (Button, Input)
- [ ] Create remaining: `Paper`, `Chip`, `Stack`, `Dialog`, `Alert`
- [ ] Replace `alpha()`, `useTheme()` with Tailwind opacity/CSS vars

## Migrated files (MUI-free)
- [x] `src/app/not-found.tsx` — server component, zero MUI
- [x] `src/app/kategori/page.tsx` — uses getCategoryIcon (still renders MUI icons internally)
- [x] `src/app/blog/[id]/page.tsx` — server component, lucide icons
- [x] `src/components/blog/CopyLinkButton.tsx` — lucide Copy/Check icons

## Phase 2: Public pages to migrate
- [ ] `src/app/blog/BlogListClient.tsx`
- [ ] `src/app/donasi/page.tsx`
- [ ] `src/app/donasi/[slug]/page.tsx`
- [ ] `src/app/donasi-saya/page.tsx`
- [ ] `src/app/galang-dana/page.tsx`
- [ ] `src/app/galang-dana/buat/page.tsx`
- [ ] `src/app/profil/*`
- [ ] `src/app/notifikasi/page.tsx`
- [ ] `src/components/common/CampaignCard.tsx`
- [ ] `src/components/home/*`
- [ ] `src/components/layout/AppBar.tsx`
- [ ] `src/components/layout/BottomNavigation.tsx`
- [ ] `src/components/layout/AppShell.tsx`
- [ ] `src/components/campaign/*`
- [ ] `src/components/donation/*`
- [ ] `src/components/profile/*`

## Phase 3: Admin pages (last)
- [ ] `src/app/admin/**`
- [ ] `src/components/admin/**`

## Phase 4: Shared deps to migrate
- [ ] `src/lib/categoryIcons.tsx` → lucide icons
- [ ] `src/lib/systemIcons.tsx` → lucide icons
- [ ] `src/theme.ts` → delete
- [ ] `src/components/layout/ThemeWrapper.tsx` → simplify (remove MUI ThemeProvider)
- [ ] `src/app/layout.tsx` → remove `AppRouterCacheProvider`

## Phase 5: Final cleanup
- [ ] Remove MUI packages: `@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`, `@emotion/react`, `@emotion/styled`, `@fontsource/roboto`
- [ ] Delete `theme.ts`

## Deps added
- `lucide-react` 1.13.0
- `@headlessui/react` 2.2.10

## Deps to remove (after full migration)
- `@mui/material`
- `@mui/icons-material`
- `@mui/material-nextjs`
- `@emotion/react`
- `@emotion/styled`
- `@fontsource/roboto`
