# Audit & Perbaikan Komponen Card: /kategori vs /donasi

## Ringkasan
- Masalah utama di halaman kategori adalah pola progress bar: track berwarna merah (`#e11d48`) yang menimbulkan ilusi "error" saat progress 0%. Komponen juga berbeda struktur dari halaman Jelajah Donasi sehingga gaya, chip, dan info pemilik tidak konsisten.
- Dua perbaikan diimplementasikan sekaligus:
  1) Penggabungan fungsionalitas kategori ke halaman Jelajah Donasi (`/donasi`) dengan query `category` (kompatibel dengan alias `kategori`).
  2) Standarisasi komponen kartu menjadi satu komponen universal yang dipakai oleh `/donasi`, dilengkapi error boundary dan loading skeleton.

## Temuan Audit
1) Struktur & properti
   - `/kategori/[id]`: Kartu inlined, progress track berwarna merah, overlay "hari" di gambar, tidak menampilkan verified badge/owner secara konsisten.
   - `/donasi`: Kartu lebih rapat, memakai MUI CardMedia, chip kategori dan verified badge konsisten, progress memakai LinearProgress dengan warna netral.
2) Data flow & state
   - Keduanya memakai `getCampaigns` yang memetakan `category: c.category.name`, `thumbnail`, `daysLeft`, dll.
   - `/kategori/[id]` melakukan render sendiri; `/donasi` menggunakan komponen eksplorasi dengan filter via URL.
3) Error pattern
   - Track progress merah pada `/kategori/[id]` menimbulkan kesan error meski data valid (terlebih saat 0%). Tidak ada fallback gambar di kartu kategori.

## Opsi 1 — Penggabungan Halaman
- `src/app/kategori/[id]/page.tsx` sekarang hanya melakukan redirect server-side ke `/donasi?category={NamaKategori}&sort={...}`. Nama kategori di-resolve lewat `CATEGORY_TITLE` atau fallback query ke database (prisma).
- `src/app/donasi/page.tsx` mendukung alias `kategori` di query untuk kompatibilitas.

## Opsi 2 — Standarisasi Komponen
- Komponen baru: `src/components/common/CampaignCard.tsx`
  - Menangani chip kategori, verified badge, ownerName, progress bar netral, dan fallback thumbnail.
  - Disertai Skeleton: `CampaignCardSkeleton` untuk loading state.
- Error Boundary: `src/components/common/ErrorBoundary.tsx` dipasang saat merender setiap kartu.
- `src/components/donation/DonationExplorer.tsx` direfaktor untuk memakai `CampaignCard`.

## Validasi & Testing
- Typecheck: `npm run typecheck` → OK.
- Test minimal dengan tsx (tanpa menambah framework baru):
  - File: `tests/run.ts`
  - Unit test: `normalizeCampaignToCard` memastikan fallback judul/kategori, clamp nilai negatif, fallback thumbnail.
  - Integration test: Server render `CampaignCard` dan periksa markup berisi judul & kategori.
- Hasil eksekusi:
  ```
  Running unit tests...
  ✓ normalizeCampaignToCard handles fallbacks and clamps values
  Running integration tests...
  ✓ CampaignCard server-render produces expected markup
  All tests passed.
  ```

## Dampak & Regressions
- Halaman `/donasi` aman: layout dan gaya tetap, hanya sumber kartu yang diwujudkan sebagai komponen universal.
- Halaman `/kategori/[id]` kini konsisten dengan `/donasi` melalui redirect, sehingga pola kartu menyatu dan error pattern hilang.
- Kinerja setara: komponen kartu ringan, tidak ada hook berat; penggabungan halaman mengurangi duplikasi render.

## Rute & File Kunci
- Redirect kategori → donasi:
  - `src/app/kategori/[id]/page.tsx`
- Dukungan alias query `kategori`:
  - `src/app/donasi/page.tsx`
- Komponen baru:
  - `src/components/common/CampaignCard.tsx`
  - `src/components/common/ErrorBoundary.tsx`
- Refaktor eksplorasi:
  - `src/components/donation/DonationExplorer.tsx`

## Catatan
- Lint mengandung isu baseline di proyek; file baru mengikuti gaya yang konsisten. Typecheck dan test lulus.

