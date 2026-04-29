# Migrate MUI → Tailwind Only

## Phase 1: Foundation
- [ ] Replace `ThemeProvider` + Emotion with Tailwind CSS variables
- [ ] Create Tailwind utility components (`Button`, `TextField`, `Paper`, `Chip`, `Stack`, `Box`, `Typography`)
- [ ] Replace `alpha()`, `useTheme()` with Tailwind opacity/CSS vars

## Phase 2: Layout components
- [ ] Replace `Grid` → Tailwind grid/flex
- [ ] Replace `Stack` → `flex flex-col gap-*` / `flex flex-row gap-*`
- [ ] Replace `Box` → `div` with Tailwind classes
- [ ] Replace `Paper` → `div rounded shadow bg-white`
- [ ] Replace `Container` → `max-w-* mx-auto px-*`

## Phase 3: Form components
- [ ] Replace `TextField` → styled `<input>` / `<textarea>`
- [ ] Replace `Select`, `MenuItem` → headless UI or custom
- [ ] Replace `Dialog` → `@headlessui/react` dialog
- [ ] Replace `Autocomplete` → headless combobox

## Phase 4: Data display
- [ ] Replace `Table` components → HTML `<table>` + Tailwind
- [ ] Replace `Tabs` → custom tabs
- [ ] Replace `Pagination` → custom pagination
- [ ] Replace `Chip` → `<span>` badge classes

## Phase 5: Feedback/overlay
- [ ] Replace `Snackbar`, `Alert` → toast lib or custom
- [ ] Replace `Drawer` → headless UI or custom
- [ ] Replace `Menu`, `Popover` → headless UI
- [ ] Replace `CircularProgress`, `LinearProgress` → CSS animations
- [ ] Replace `Tooltip` → CSS-only or tiny lib

## Phase 6: Icons & cleanup
- [ ] Replace `@mui/icons-material` → `lucide-react`
- [ ] Remove MUI packages: `@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`, `@emotion/react`, `@emotion/styled`, `@fontsource/roboto`
- [ ] Delete `theme.ts`, `ThemeWrapper`, MUI provider code

## Add
- `@headlessui/react` — Dialog, Menu, Combobox, Tabs
- `lucide-react` — icons

## Remove
- `@mui/material`
- `@mui/icons-material`
- `@mui/material-nextjs`
- `@emotion/react`
- `@emotion/styled`
- `@fontsource/roboto`
