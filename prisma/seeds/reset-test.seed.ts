/**
 * Reset seed — 3 campaign aktif milik miqbalhanafi977@gmail.com, dengan donasi PAID.
 * Hapus semua user/campaign lain (kecuali admin).
 * Jalankan: npx tsx prisma/seeds/reset-test.seed.ts
 */

import "dotenv/config";
import { prisma } from "../../src/lib/prisma";
import * as bcrypt from "bcryptjs";
import { CampaignStatus, CampaignMediaType, PaymentMethod } from "@prisma/client";

const ADMIN_EMAIL = "admin@pesonakebaikan.id";
const IQBAL_EMAIL = "miqbalhanafi977@gmail.com";

const ICON_KEY: Record<string, string> = {
  bencana: "thunderstorm",
  medis: "medical_services",
  pendidikan: "school",
  kemanusiaan: "volunteer_activism",
  infrastruktur: "construction",
  lingkungan: "forest",
  rumah_ibadah: "temple_buddhist",
  usaha: "storefront",
  sosial: "group",
  difabel: "accessible",
  lainnya: "category",
};

async function upsertCategory(name: string, slug: string) {
  const existing = await prisma.campaignCategory.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) {
    return prisma.campaignCategory.update({
      where: { id: existing.id },
      data: { name, slug, icon: ICON_KEY[slug] ?? "category", isActive: true },
    });
  }
  return prisma.campaignCategory.create({
    data: { name, slug, icon: ICON_KEY[slug] ?? "category", isActive: true },
  });
}

async function main() {
  console.log("🧹 Membersihkan data lama...");

  // Hapus dalam urutan yang aman (FK constraints)
  await prisma.donation.deleteMany({});
  await prisma.withdrawal.deleteMany({});
  await prisma.campaignUpdate.deleteMany({});
  await prisma.campaignMedia.deleteMany({});
  await (prisma as any).report?.deleteMany({}).catch(() => {});
  await (prisma as any).campaignChangeRequest?.deleteMany({}).catch(() => {});
  await prisma.fundraiser.deleteMany({}).catch(() => {});
  await prisma.campaign.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.loginActivity.deleteMany({});
  await prisma.amiin.deleteMany({}).catch(() => {});

  // Hapus semua user kecuali admin dan iqbal
  await prisma.user.deleteMany({
    where: {
      email: { notIn: [ADMIN_EMAIL, IQBAL_EMAIL] },
    },
  });

  console.log("✅ Data lama dihapus.");

  // ── Admin ──
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "ADMIN", name: "Super Admin" },
    create: {
      email: ADMIN_EMAIL,
      name: "Super Admin",
      role: "ADMIN",
      password,
    },
  });

  // ── Iqbal (pemilik campaign) ──
  const iqbal = await prisma.user.upsert({
    where: { email: IQBAL_EMAIL },
    update: { name: "Iqbal Hanafi", role: "USER" },
    create: {
      email: IQBAL_EMAIL,
      name: "Iqbal Hanafi",
      role: "USER",
      password,
    },
  });

  console.log(`👤 Admin: ${admin.email}`);
  console.log(`👤 Iqbal: ${iqbal.email}`);

  // ── Kategori — sequential untuk hindari race condition ──
  const CATS = [
    { slug: "medis",       name: "Bantuan Medis & Kesehatan" },
    { slug: "pendidikan",  name: "Bantuan Pendidikan" },
    { slug: "bencana",     name: "Bencana Alam" },
    { slug: "sosial",      name: "Kegiatan Sosial" },
    { slug: "kemanusiaan", name: "Kemanusiaan" },
    { slug: "lingkungan",  name: "Lingkungan" },
    { slug: "rumah_ibadah",name: "Rumah Ibadah" },
    { slug: "difabel",     name: "Difabel" },
    { slug: "infrastruktur",name: "Infrastruktur Umum" },
    { slug: "usaha",       name: "Karya Kreatif & Modal Usaha" },
  ];
  for (const c of CATS) {
    await upsertCategory(c.name, c.slug);
  }

  const catMedis      = await prisma.campaignCategory.findFirst({ where: { slug: "medis" } });
  const catPendidikan = await prisma.campaignCategory.findFirst({ where: { slug: "pendidikan" } });
  const catBencana    = await prisma.campaignCategory.findFirst({ where: { slug: "bencana" } });

  if (!catMedis || !catPendidikan || !catBencana) throw new Error("Kategori tidak ditemukan");

  // ── 3 Donor fiktif ──
  const donorNames = [
    { name: "Budi Santoso",  phone: "6281234567001" },
    { name: "Siti Rahayu",   phone: "6281234567002" },
    { name: "Ahmad Fauzi",   phone: "6281234567003" },
    { name: "Dewi Lestari",  phone: "6281234567004" },
    { name: "Reza Pratama",  phone: "6281234567005" },
    { name: "Hamba Allah",   phone: "6281234567006" },
    { name: "Nuri Handayani",phone: "6281234567007" },
    { name: "Yusuf Ibrahim", phone: "6281234567008" },
  ];

  // Buat user donor supaya bisa tes history donasi
  const donorUsers: { id: string; name: string }[] = [];
  for (const d of donorNames) {
    const u = await prisma.user.upsert({
      where: { email: `${d.phone}@donor.test` },
      update: {},
      create: {
        email: `${d.phone}@donor.test`,
        name: d.name,
        role: "USER",
        password,
        phone: d.phone,
      },
    });
    donorUsers.push({ id: u.id, name: d.name });
  }

  const now = new Date();
  const future = (days: number) => new Date(now.getTime() + days * 86_400_000);

  // ── Campaign 1: Medis ──
  const campaign1 = await prisma.campaign.create({
    data: {
      title: "Bantu Biaya Operasi Ibu Siti — Kanker Stadium 3",
      slug: "bantu-operasi-ibu-siti",
      story: `<p>Ibu Siti (52 tahun) didiagnosa kanker payudara stadium 3. Biaya operasi dan kemoterapi sangat besar sementara keluarga tidak mampu. Kami membutuhkan bantuan sesegera mungkin.</p><p>Dana akan digunakan untuk biaya operasi di RSUP Dr. Sardjito, sesi kemoterapi, dan obat-obatan pascaoperasi.</p>`,
      target: 80_000_000,
      categoryId: catMedis.id,
      createdById: iqbal.id,
      status: CampaignStatus.ACTIVE,
      start: now,
      end: future(45),
      verifiedAt: now,
      phone: "6281234567890",
      foundationFee: 5,
      metadata: {
        purposeKey: "orang_tua",
        ktpName: "Iqbal Hanafi",
        receiverName: "Siti Rahayu",
        soc: "instagram",
        socHandle: "iqbalhanafi",
        job: "Karyawan Swasta",
        workplace: "PT Maju Bersama",
      },
      media: {
        create: [
          {
            type: CampaignMediaType.IMAGE,
            url: "https://picsum.photos/seed/medis1/800/600",
            isThumbnail: true,
          },
        ],
      },
    },
  });

  // ── Campaign 2: Pendidikan ──
  const campaign2 = await prisma.campaign.create({
    data: {
      title: "Beasiswa SMP untuk Anak Yatim Desa Sukamaju",
      slug: "beasiswa-smp-anak-yatim-sukamaju",
      story: `<p>Sebanyak 12 anak yatim piatu di Desa Sukamaju terancam putus sekolah karena tidak memiliki biaya untuk melanjutkan ke SMP. Kami menggalang dana untuk membantu mereka tetap bisa mengenyam pendidikan.</p><p>Dana digunakan untuk biaya daftar ulang, seragam, alat tulis, dan uang saku selama satu tahun ajaran.</p>`,
      target: 36_000_000,
      categoryId: catPendidikan.id,
      createdById: iqbal.id,
      status: CampaignStatus.ACTIVE,
      start: now,
      end: future(60),
      verifiedAt: now,
      phone: "6281234567890",
      foundationFee: 5,
      metadata: {
        purposeKey: "sosial",
        ktpName: "Iqbal Hanafi",
        receiverName: "Anak-anak Yatim Desa Sukamaju",
        soc: "instagram",
        socHandle: "iqbalhanafi",
        job: "Karyawan Swasta",
        workplace: "PT Maju Bersama",
      },
      media: {
        create: [
          {
            type: CampaignMediaType.IMAGE,
            url: "https://picsum.photos/seed/pendidikan1/800/600",
            isThumbnail: true,
          },
        ],
      },
    },
  });

  // ── Campaign 3: Bencana ──
  const campaign3 = await prisma.campaign.create({
    data: {
      title: "Bantuan Darurat Korban Banjir Bandang Cianjur",
      slug: "bantuan-banjir-bandang-cianjur",
      story: `<p>Banjir bandang melanda Cianjur pada Senin pagi dan merendam ratusan rumah warga. Ribuan warga mengungsi tanpa cukup logistik, air bersih, dan pakaian layak.</p><p>Dana akan disalurkan untuk paket sembako, air mineral, selimut, dan perbaikan darurat rumah yang paling terdampak.</p>`,
      target: 120_000_000,
      categoryId: catBencana.id,
      createdById: iqbal.id,
      status: CampaignStatus.ACTIVE,
      start: now,
      end: future(30),
      verifiedAt: now,
      phone: "6281234567890",
      foundationFee: 5,
      isEmergency: true,
      metadata: {
        purposeKey: "bencana",
        ktpName: "Iqbal Hanafi",
        receiverName: "Korban Banjir Cianjur",
        soc: "instagram",
        socHandle: "iqbalhanafi",
        job: "Karyawan Swasta",
        workplace: "PT Maju Bersama",
      },
      media: {
        create: [
          {
            type: CampaignMediaType.IMAGE,
            url: "https://picsum.photos/seed/bencana1/800/600",
            isThumbnail: true,
          },
        ],
      },
    },
  });

  console.log(`📣 Campaign 1: ${campaign1.title}`);
  console.log(`📣 Campaign 2: ${campaign2.title}`);
  console.log(`📣 Campaign 3: ${campaign3.title}`);

  // ── Donasi untuk tiap campaign ──
  const methods = [PaymentMethod.VIRTUAL_ACCOUNT, PaymentMethod.EWALLET, PaymentMethod.TRANSFER];
  const statuses = ["PAID", "PAID", "PAID", "SETTLED", "SETTLED"] as const;

  type DonationInput = {
    donorName: string;
    donorPhone: string;
    message?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: string;
    campaignId: string;
    userId: string;
    allowContact: boolean;
    fee: number;
  };

  function makeDonations(campaignId: string, amounts: number[]): DonationInput[] {
    return amounts.map((amount, i) => {
      const donor = donorUsers[i % donorUsers.length];
      const method = methods[i % methods.length];
      const status = statuses[i % statuses.length];
      const fee = Math.round(amount * 0.02);
      return {
        donorName: donor.name,
        donorPhone: donorNames[i % donorNames.length].phone,
        message: i % 3 === 0 ? "Semoga lekas sembuh, tetap semangat!" : i % 3 === 1 ? "Sedikit yang saya bisa, semoga bermanfaat." : undefined,
        amount,
        paymentMethod: method,
        status,
        campaignId,
        userId: donor.id,
        allowContact: i % 4 !== 0,
        fee,
      };
    });
  }

  const donations1 = makeDonations(campaign1.id, [
    500_000, 1_000_000, 250_000, 2_000_000, 750_000,
    300_000, 1_500_000, 100_000, 5_000_000, 200_000,
    3_000_000, 450_000,
  ]);

  const donations2 = makeDonations(campaign2.id, [
    200_000, 500_000, 1_000_000, 150_000, 300_000,
    750_000, 250_000, 100_000, 400_000, 600_000,
  ]);

  const donations3 = makeDonations(campaign3.id, [
    1_000_000, 2_000_000, 500_000, 5_000_000, 300_000,
    750_000, 1_500_000, 250_000, 10_000_000, 400_000,
    200_000, 3_000_000, 150_000, 800_000,
  ]);

  for (const d of [...donations1, ...donations2, ...donations3]) {
    await prisma.donation.create({ data: d as any });
  }

  const total1 = donations1.reduce((s, d) => s + d.amount, 0);
  const total2 = donations2.reduce((s, d) => s + d.amount, 0);
  const total3 = donations3.reduce((s, d) => s + d.amount, 0);

  console.log(`💰 Campaign 1: ${donations1.length} donasi, total Rp${total1.toLocaleString("id-ID")}`);
  console.log(`💰 Campaign 2: ${donations2.length} donasi, total Rp${total2.toLocaleString("id-ID")}`);
  console.log(`💰 Campaign 3: ${donations3.length} donasi, total Rp${total3.toLocaleString("id-ID")}`);

  // ── Kabar terbaru untuk campaign 1 ──
  await prisma.campaignUpdate.create({
    data: {
      campaignId: campaign1.id,
      title: "Ibu Siti Sudah Masuk Rumah Sakit",
      content: "Alhamdulillah, berkat doa dan dukungan semua donatur, Ibu Siti sudah berhasil masuk RSUP Dr. Sardjito dan menjalani pemeriksaan awal. Operasi direncanakan 3 hari lagi. Mohon doanya.",
      amount: 15_000_000,
    },
  });

  console.log("\n✅ Seeding selesai!");
  console.log("─────────────────────────────────");
  console.log(`Admin  : ${ADMIN_EMAIL} / password123`);
  console.log(`Iqbal  : ${IQBAL_EMAIL} / password123`);
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
