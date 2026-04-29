# Migrate MUI → Tailwind Only

## Phase 1: Foundation
- [x] CSS variables for theme colors (light/dark) in `globals.css`
- [x] Tailwind `@theme` config: `surface`, `divider`, `text-secondary`, `success`, `warning`, `error`, `info`
- [x] Install `lucide-react` + `@headlessui/react`
- [x] Create utility components in `src/components/ui/tw/` (Button, Input, Paper, Chip, Dialog, Alert)
- [x] Create `src/components/ui/SocialIcons.tsx` (brand icons not in lucide)

## Migrated files (MUI-free)
- [x] `src/app/not-found.tsx`
- [x] `src/app/kategori/page.tsx`
- [x] `src/app/blog/[id]/page.tsx`
- [x] `src/app/blog/BlogListClient.tsx`
- [x] `src/app/panduan-fundraiser/page.tsx`
- [x] `src/app/notifikasi/page.tsx`
- [x] `src/app/profil/page.tsx`
- [x] `src/app/profil/syarat-ketentuan/page.tsx`
- [x] `src/app/profil/akuntabilitas/page.tsx`
- [x] `src/app/profil/bantuan/page.tsx`
- [x] `src/app/profil/tentang/page.tsx`
- [x] `src/app/initiator/[id]/page.tsx`
- [x] `src/app/sahabat-baik/[id]/page.tsx`
- [x] `src/components/blog/CopyLinkButton.tsx`
- [x] `src/components/common/CampaignCard.tsx`
- [x] `src/components/ui/SocialIcons.tsx` (brand SVGs)

## Phase 2: Remaining public pages (heavier — need shared component migration)
- [ ] `src/app/profil/keamanan/page.tsx` (30 MUI — forms, dialogs)
- [ ] `src/app/donasi/page.tsx`
- [ ] `src/app/donasi/[slug]/page.tsx`
- [ ] `src/app/donasi-saya/page.tsx`
- [ ] `src/app/galang-dana/page.tsx`
- [ ] `src/app/galang-dana/buat/page.tsx`
- [ ] `src/app/galang-dana/[slug]/page.tsx`
- [ ] `src/app/galang-dana/[slug]/pencairan/client.tsx`
- [ ] `src/app/page.tsx` (home)

## Phase 3: Shared components
- [ ] `src/components/home/*` (HeroCarousel, QuickMenu, UrgentSection, etc.)
- [ ] `src/components/layout/AppBar.tsx`
- [ ] `src/components/layout/BottomNavigation.tsx`
- [ ] `src/components/layout/AppShell.tsx`
- [ ] `src/components/campaign/*`
- [ ] `src/components/donation/*`
- [ ] `src/components/profile/*`

## Phase 4: Admin pages (last)
- [ ] `src/app/admin/**`
- [ ] `src/components/admin/**`

## Phase 5: Core deps to migrate
- [ ] `src/lib/categoryIcons.tsx` → lucide icons
- [ ] `src/lib/systemIcons.tsx` → lucide icons
- [ ] `src/theme.ts` → delete
- [ ] `src/components/layout/ThemeWrapper.tsx` → simplify
- [ ] `src/app/layout.tsx` → remove `AppRouterCacheProvider`

## Phase 6: Final cleanup
- [ ] Remove MUI packages: `@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`, `@emotion/react`, `@emotion/styled`, `@fontsource/roboto`

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
