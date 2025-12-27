import "dotenv/config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  Role,
  BlogMediaType,
  CampaignStatus,
  CampaignMediaType,
  PaymentMethod,
  NotificationType,
} from "@/generated/prisma/enums";

/* =========================
   HELPERS (IDEMPOTENT)
========================= */

async function upsertPageContent(params: {
  key: string;
  title: string;
  content: string;
  data?: any;
}) {
  return prisma.pageContent.upsert({
    where: { key: params.key },
    update: {
      title: params.title,
      content: params.content,
      data: params.data ?? undefined,
    },
    create: {
      key: params.key,
      title: params.title,
      content: params.content,
      data: params.data ?? undefined,
    },
  });
}

async function upsertBlogCategory(name: string) {
  return prisma.blogCategory.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function ensureBlog(params: {
  title: string;
  content: string;
  categoryId?: string | null;
  createdById: string;
  gallery?: {
    type: BlogMediaType;
    url: string;
  }[];
}) {
  const exists = await prisma.blog.findFirst({
    where: { title: params.title, createdById: params.createdById },
  });

  if (exists) return exists;

  return prisma.blog.create({
    data: {
      title: params.title,
      content: params.content,
      categoryId: params.categoryId ?? null,
      createdById: params.createdById,
      heroImage: params.heroImage ?? null,
      gallery: params.gallery?.length
        ? {
            create: params.gallery.map((g) => ({
              type: g.type,
              url: g.url,
            })),
          }
        : undefined,
    },
  });
}

async function upsertCampaignCategory(name: string) {
  return prisma.campaignCategory.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function ensureCampaign(params: {
  title: string;
  story: string;
  target: number;
  categoryId: string;
  createdById: string;
  isEmergency?: boolean;
  status?: CampaignStatus;
  media?: {
    type: CampaignMediaType;
    url: string;
    isThumbnail?: boolean;
  }[];
}) {
  const exists = await prisma.campaign.findFirst({
    where: { title: params.title },
  });

  if (exists) return exists;

  return prisma.campaign.create({
    data: {
      title: params.title,
      story: params.story,
      target: params.target, // ✅ number langsung
      categoryId: params.categoryId,
      createdById: params.createdById,
      isEmergency: params.isEmergency ?? false,
      status: params.status ?? CampaignStatus.ACTIVE,
      start: new Date(),
      media: params.media?.length
        ? {
            create: params.media.map((m) => ({
              type: m.type,
              url: m.url,
              isThumbnail: m.isThumbnail ?? false,
            })),
          }
        : undefined,
    },
  });
}

/* =========================
   MAIN SEED
========================= */

async function main() {
  const password = await bcrypt.hash("password123", 10);

  /* ===== USERS ===== */
  const admin = await prisma.user.upsert({
    where: { email: "admin@pesonakebaikan.id" },
    update: { role: Role.ADMIN },
    create: {
      email: "admin@pesonakebaikan.id",
      name: "Super Admin",
      role: Role.ADMIN,
      password,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@pesonakebaikan.id" },
    update: {},
    create: {
      email: "user@pesonakebaikan.id",
      name: "Normal User",
      role: Role.USER,
      password,
    },
  });

  /* ===== PAGE CONTENT ===== */
  await upsertPageContent({
    key: "about",
    title: "Tentang Pesona Kebaikan",
    content: `<p>Platform donasi transparan & terpercaya.</p>`,
  });

  await upsertPageContent({
    key: "terms",
    title: "Syarat & Ketentuan",
    content: `<p>Dengan menggunakan layanan ini, Anda setuju dengan aturan kami.</p>`,
  });

  /* ===== BLOG ===== */
  const edukasi = await upsertBlogCategory("Edukasi");

  await ensureBlog({
    title: "Kenapa Transparansi Penting dalam Donasi",
    createdById: admin.id,
    categoryId: edukasi.id,
    content: `<p>Transparansi membangun kepercayaan.</p>`,
    gallery: [
      { type: BlogMediaType.image, url: "https://picsum.photos/1200/800?1" },
    ],
  });

  await ensureBlog({
    title: "Cara Memilih Campaign yang Terpercaya",
    createdById: admin.id,
    categoryId: edukasi.id,
    content: `<p>Pilih campaign yang diverifikasi.</p>`,
    gallery: [
      { type: BlogMediaType.image, url: "https://picsum.photos/1200/800?2" },
    ],
  });

  await ensureBlog({
    title: "Laporan Donasi dan Akuntabilitas",
    createdById: admin.id,
    categoryId: edukasi.id,
    content: `<p>Laporan rutin adalah kunci kepercayaan.</p>`,
  });

  /* ===== CAMPAIGN ===== */
  const kesehatan = await upsertCampaignCategory("Kesehatan");
  const pendidikan = await upsertCampaignCategory("Pendidikan");

  const campaigns = await Promise.all([
    ensureCampaign({
      title: "Bantu Adik Rizky Operasi Jantung",
      categoryId: kesehatan.id,
      createdById: admin.id,
      target: 100_000_000,
      story: `<p>Butuh bantuan untuk operasi jantung.</p>`,
      media: [
        {
          type: CampaignMediaType.IMAGE,
          url: "https://picsum.photos/800/600?10",
          isThumbnail: true,
        },
      ],
    }),
    ensureCampaign({
      title: "Bangun Sekolah di Desa Terpencil",
      categoryId: pendidikan.id,
      createdById: admin.id,
      target: 250_000_000,
      story: `<p>Mari bangun sekolah bersama.</p>`,
      media: [
        {
          type: CampaignMediaType.IMAGE,
          url: "https://picsum.photos/800/600?11",
          isThumbnail: true,
        },
      ],
    }),
    ensureCampaign({
      title: "Bantu Korban Banjir",
      categoryId: kesehatan.id,
      createdById: admin.id,
      target: 150_000_000,
      story: `<p>Bantuan darurat untuk korban banjir.</p>`,
      isEmergency: true,
      media: [
        {
          type: CampaignMediaType.IMAGE,
          url: "https://picsum.photos/800/600?12",
          isThumbnail: true,
        },
      ],
    }),
  ]);

  /* ===== DONATIONS ===== */
  for (const campaign of campaigns) {
    for (const amount of [50_000, 100_000, 250_000]) {
      const fingerprint = `seed-${campaign.id}-${amount}`;

      const exists = await prisma.donation.findFirst({
        where: { message: fingerprint },
      });

      if (!exists) {
        await prisma.donation.create({
          data: {
            campaignId: campaign.id,
            donorName: "Seeder",
            amount,
            paymentMethod: PaymentMethod.TRANSFER,
            status: "COMPLETED",
            message: fingerprint,
            isAnonymous: false,
            userId: user.id,
          },
        });
      }
    }
  }

  /* ===== NOTIFICATIONS ===== */
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "Selamat Datang!",
        message: "Terima kasih telah bergabung di Pesona Kebaikan.",
        type: NotificationType.KABAR,
      },
      {
        userId: admin.id,
        title: "Campaign Baru Dibuat",
        message: "Beberapa campaign berhasil dibuat oleh seeder.",
        type: NotificationType.PESAN,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed lengkap & aman dijalankan");
}

/* ========================= */

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
