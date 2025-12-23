import "dotenv/config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, BlogMediaType, CampaignStatus, CampaignMediaType, PaymentMethod, NotificationType } from "@/generated/prisma/enums";

async function upsertPageContent(params: { key: string; title: string; content: string; data?: any }) {
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

async function ensureBlogByTitle(params: {
  title: string;
  content: string;
  categoryId?: string | null;
  createdById: string;
  heroImage?: string;
  gallery?: Array<{
    type: BlogMediaType;
    url: string;
  }>;
}) {
  const existing = await prisma.blog.findFirst({
    where: { title: params.title, createdById: params.createdById },
    include: { gallery: true },
  });

  if (existing) return existing;

  return prisma.blog.create({
    data: {
      title: params.title,
      content: params.content,
      categoryId: params.categoryId ?? null,
      createdById: params.createdById,
      heroImage: params.heroImage ?? null,
      gallery: params.gallery?.length
        ? {
            create: params.gallery.map((m) => ({
              type: m.type,
              url: m.url,
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
  isEmergency?: boolean;
  status?: CampaignStatus;
  start?: Date;
  end?: Date;
  categoryId: string;
  createdById: string;
  media?: Array<{
    type: CampaignMediaType;
    url: string;
    isThumbnail?: boolean;
  }>;
}) {
  const existing = await prisma.campaign.findFirst({
    where: { title: params.title },
    include: { media: true },
  });

  if (existing) return existing;

  return prisma.campaign.create({
    data: {
      title: params.title,
      story: params.story,
      target: params.target,
      isEmergency: params.isEmergency ?? false,
      status: params.status ?? CampaignStatus.PENDING,
      start: params.start ?? new Date(),
      end: params.end,
      categoryId: params.categoryId,
      createdById: params.createdById,
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

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // ============
  // USERS
  // ============
  const admin = await prisma.user.upsert({
    where: { email: "admin@pesonakebaikan.id" },
    update: { role: Role.ADMIN },
    create: {
      email: "admin@pesonakebaikan.id",
      name: "Super Admin",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@pesonakebaikan.id" },
    update: { role: Role.USER },
    create: {
      email: "user@pesonakebaikan.id",
      name: "Normal User",
      password: hashedPassword,
      role: Role.USER,
    },
  });

  // ============
  // FAQs
  // ============
  const faqs = [
    {
      question: "Bagaimana cara berdonasi di Pesona Kebaikan?",
      answer:
        "1. Pilih campaign penggalangan dana yang ingin Anda bantu.\n2. Klik tombol 'Donasi Sekarang'.\n3. Masukkan nominal donasi yang diinginkan.\n4. Pilih metode pembayaran (Transfer Bank, E-Wallet, atau QRIS).\n5. Selesaikan pembayaran sesuai instruksi. Anda akan mendapatkan notifikasi via email/WhatsApp setelah donasi berhasil.",
      category: "Donasi",
    },
    {
      question: "Apa saja metode pembayaran yang tersedia?",
      answer:
        "Kami menyediakan berbagai metode pembayaran untuk kemudahan Anda:\n\n- Transfer Bank (BCA, Mandiri, BRI, BNI)\n- E-Wallet (GoPay, OVO, DANA, ShopeePay)\n- QRIS (Scan QR Code)\n- Kartu Kredit (Visa/Mastercard)",
      category: "Pembayaran",
    },
    {
      question: "Apakah ada potongan biaya administrasi?",
      answer:
        "Untuk menjaga keberlangsungan operasional platform dan biaya verifikasi campaign, kami mengenakan biaya administrasi sebesar 5% dari total donasi.\n\nKhusus untuk kategori Zakat dan Bencana Alam, biaya administrasi adalah 0% (Gratis).",
      category: "Biaya",
    },
    {
      question: "Apakah saya perlu mendaftar akun untuk berdonasi?",
      answer:
        "Tidak, Anda dapat berdonasi sebagai donatur tamu (anonim) tanpa perlu mendaftar. Namun, kami menyarankan Anda untuk mendaftar agar dapat memantau riwayat donasi dan mendapatkan update perkembangan dari campaign yang Anda bantu.",
      category: "Akun",
    },
    {
      question: "Bagaimana jika saya salah mentransfer nominal donasi?",
      answer:
        "Jangan khawatir. Silakan hubungi tim Customer Success kami melalui WhatsApp atau Email dengan melampirkan bukti transfer. Kami akan membantu memverifikasi dan menyesuaikan donasi Anda secara manual dalam waktu 1x24 jam kerja.",
      category: "Kendala",
    },
    {
      question: "Bagaimana prosedur pencairan dana oleh penggalang dana?",
      answer:
        "Pencairan dana dilakukan secara transparan dan akuntabel. Penggalang dana harus mengajukan permohonan pencairan dengan melampirkan rencana penggunaan dana dan bukti pendukung. Tim verifikasi kami akan mereview dalam 1-3 hari kerja sebelum dana disalurkan.",
      category: "Pencairan",
    },
  ];

  console.log("Seeding FAQs...");
  for (const faq of faqs) {
    const exists = await prisma.faq.findFirst({
      where: { question: faq.question },
    });

    if (!exists) {
      await prisma.faq.create({ data: faq });
    }
  }

  // ============
  // PAGE CONTENT (idempotent via unique key)
  // ============
  console.log("Seeding PageContent...");
  await upsertPageContent({
    key: "about",
    title: "Tentang Pesona Kebaikan",
    content:
      "Pesona Kebaikan adalah platform donasi yang membantu mempertemukan donatur dengan campaign yang terverifikasi.\n\nKami fokus pada transparansi, kemudahan berdonasi, dan pelaporan penggunaan dana.",
    data: {
      banner: "",
      highlight: ["Verifikasi penggalang dana", "Transparansi & laporan", "Kemudahan pembayaran"],
    },
  });

  await upsertPageContent({
    key: "terms",
    title: "Syarat & Ketentuan",
    content:
      "Dengan menggunakan layanan Pesona Kebaikan, Anda menyetujui syarat & ketentuan yang berlaku.\n\n1) Donasi bersifat sukarela.\n2) Penggalang dana wajib melengkapi dokumen verifikasi.\n3) Platform dapat melakukan peninjauan dan pembatasan pada campaign yang melanggar kebijakan.",
    data: { lastUpdated: new Date().toISOString() },
  });

  await upsertPageContent({
    key: "privacy",
    title: "Kebijakan Privasi",
    content:
      "Kami menghargai privasi Anda. Data pribadi digunakan untuk keperluan layanan, keamanan akun, dan komunikasi terkait donasi.\n\nKami tidak menjual data pengguna kepada pihak ketiga.",
    data: { lastUpdated: new Date().toISOString() },
  });

  await upsertPageContent({
    key: "accountability",
    title: "Akuntabilitas",
    content:
      "Kami mendorong pelaporan berkala dari penggalang dana dan menyediakan kanal pengaduan.\n\nSetiap pencairan dana dapat ditinjau dan diverifikasi sesuai kebijakan platform.",
    data: {
      contact: {
        email: "support@pesonakebaikan.id",
        whatsapp: "",
      },
    },
  });

  // ============
  // BLOG CATEGORY + SAMPLE BLOG
  // ============
  console.log("Seeding BlogCategory...");
  const catEdukasi = await upsertBlogCategory("Edukasi");
  const catUpdate = await upsertBlogCategory("Update");
  const catKisah = await upsertBlogCategory("Kisah Baik");

  console.log("Seeding Blogs...");
  await ensureBlogByTitle({
    title: "Kenapa Transparansi Itu Penting Dalam Donasi",
    content:
      "Transparansi adalah fondasi kepercayaan.\n\nDi Pesona Kebaikan, kami mendorong pelaporan, dokumentasi penggunaan dana, serta update berkala agar donatur merasa tenang dan yakin.",
    categoryId: catEdukasi.id,
    createdById: admin.id,
    gallery: [
      {
        type: BlogMediaType.image,
        url: "https://picsum.photos/1200/800?random=11",
      },
      {
        type: BlogMediaType.image,
        url: "https://picsum.photos/1200/800?random=12",
      },
    ],
  });

  await ensureBlogByTitle({
    title: "Update Platform: Fitur Riwayat Donasi & Notifikasi",
    content:
      "Kami menambahkan riwayat donasi dan notifikasi agar donatur bisa memantau kontribusinya dengan lebih mudah.\n\nSelanjutnya kami akan mengembangkan fitur laporan pencairan dan progress campaign yang lebih detail.",
    categoryId: catUpdate.id,
    createdById: admin.id,
    gallery: [
      {
        type: BlogMediaType.image,
        url: "https://picsum.photos/1200/800?random=21",
      },
    ],
  });

  await ensureBlogByTitle({
    title: "Kisah Baik: Donasi Kecil, Dampak Besar",
    content:
      "Terkadang, donasi kecil yang konsisten punya dampak luar biasa.\n\nTerima kasih sudah menjadi bagian dari kebaikan yang terus berjalan.",
    categoryId: catKisah.id,
    createdById: admin.id,
    gallery: [
      {
        type: BlogMediaType.image,
        url: "https://picsum.photos/1200/800?random=31",
      },
    ],
  });

  // ============
  // CAMPAIGN CATEGORY
  // ============
  console.log("Seeding CampaignCategory...");
  const campCatKesehatan = await upsertCampaignCategory("Kesehatan");
  const campCatPendidikan = await upsertCampaignCategory("Pendidikan");
  const campCatBencana = await upsertCampaignCategory("Bencana Alam");
  const campCatZakat = await upsertCampaignCategory("Zakat");

  // ============
  // CAMPAIGNS
  // ============
  console.log("Seeding Campaigns...");

  const campaignCategories = [campCatKesehatan, campCatPendidikan, campCatBencana, campCatZakat];
  const campaignTitles = [
    "Bantu Adik Rizky Sembuh dari Jantung Bocor",
    "Renovasi Sekolah Dasar di Desa Terpencil",
    "Paket Sembako untuk Lansia Dhuafa",
    "Bangun Jembatan Asa untuk Desa Seberang",
    "Operasi Katarak Gratis untuk Dhuafa",
    "Beasiswa Pendidikan Yatim Piatu",
    "Bantuan Korban Banjir Bandang",
    "Sedekah Air Bersih untuk Pesantren",
    "Bantu Bu Siti Melawan Kanker",
    "Wakaf Al-Quran untuk Pelosok Negeri",
    "Santunan Guru Ngaji di Pedalaman",
    "Modal Usaha untuk Janda Dhuafa",
    "Bedah Rumah Tak Layak Huni",
    "Ambulans Gratis untuk Masyarakat Miskin",
    "Bantu Pembangunan Masjid Desa",
    "Tebar Hewan Kurban ke Pelosok",
    "Bingkisan Lebaran untuk Yatim",
    "Bantu Biaya Persalinan Ibu Dhuafa",
    "Kursi Roda untuk Difabel",
    "Makanan Sehat untuk Balita Gizi Buruk",
  ];

  const generatedCampaigns = [];

  for (let i = 0; i < 20; i++) {
    const title = campaignTitles[i] || `Campaign Kebaikan #${i + 1}`;
    const category = campaignCategories[Math.floor(Math.random() * campaignCategories.length)];
    const isEmergency = Math.random() > 0.8; // 20% chance
    const target = (Math.floor(Math.random() * 20) + 1) * 5000000; // 5jt - 100jt

    // Status distribution
    let status: CampaignStatus = CampaignStatus.ACTIVE;
    const randStatus = Math.random();
    if (randStatus > 0.9) status = CampaignStatus.COMPLETED;
    else if (randStatus > 0.95) status = CampaignStatus.PENDING;

    const campaign = await ensureCampaign({
      title: title,
      story: `Ini adalah deskripsi detail untuk campaign "${title}". 
      
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Mohon doa dan dukungannya untuk kelancaran program ini. Terima kasih orang baik!`,
      target: target,
      isEmergency: isEmergency,
      status: status,
      categoryId: category.id,
      createdById: i % 2 === 0 ? admin.id : user.id,
      media: [
        {
          type: CampaignMediaType.IMAGE,
          url: `https://picsum.photos/800/600?random=${100 + i}`,
          isThumbnail: true,
        },
        {
          type: CampaignMediaType.IMAGE,
          url: `https://picsum.photos/800/600?random=${200 + i}`,
        },
      ],
    });
    generatedCampaigns.push(campaign);
  }

  // ============
  // DONATIONS
  // ============
  console.log("Seeding Donations...");

  // Clear existing donations if needed or just add more?
  // User asked for "ada 100 donation", implies total.
  // Let's create 100 new donations distributed across campaigns.

  const donorNames = [
    "Hamba Allah",
    "Andi Wijaya",
    "Siti Aminah",
    "Budi Santoso",
    "Dewi Lestari",
    "Rahmat Hidayat",
    "Putri Indah",
    "Agus Setiawan",
    "Ratna Sari",
    "Eko Prasetyo",
    "Anonim",
    "Donatur Dermawan",
    "Keluarga Besar X",
    "Alumni Angkatan 90",
    "Komunitas Peduli",
  ];

  const paymentMethods = [PaymentMethod.TRANSFER, PaymentMethod.EWALLET, PaymentMethod.VIRTUAL_ACCOUNT, PaymentMethod.CARD];

  const donationData = [];

  for (let i = 0; i < 100; i++) {
    const campaign = generatedCampaigns[Math.floor(Math.random() * generatedCampaigns.length)];
    const amount = (Math.floor(Math.random() * 20) + 1) * 50000; // 50rb - 1jt

    donationData.push({
      campaignId: campaign.id,
      donorName: donorNames[Math.floor(Math.random() * donorNames.length)],
      donorPhone: Math.random() > 0.5 ? `0812${Math.floor(Math.random() * 100000000)}` : null,
      amount: amount,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: "COMPLETED", // Assume all paid for popularity count
      isAnonymous: Math.random() > 0.7,
      message: Math.random() > 0.5 ? "Semoga berkah dan bermanfaat. Aamiin." : null,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
    });
  }

  await prisma.donation.createMany({
    data: donationData,
  });

  // ============
  // NOTIFICATIONS
  // ============
  console.log("Seeding Notifications...");
  await prisma.notification.deleteMany({ where: { userId: user.id } }); // Clear existing for user

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "Selamat Datang!",
        message: "Selamat datang di Pesona Kebaikan. Mulailah berbagi kebaikan hari ini.",
        type: NotificationType.KABAR,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago,
        isRead: true,
      },
      {
        userId: user.id,
        title: "Donasi Berhasil",
        message: "Terima kasih, donasi Anda untuk 'Bantu Adik Rizky' telah diterima.",
        type: NotificationType.PESAN,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago,
        isRead: false,
      },
      {
        userId: user.id,
        title: "Update Campaign",
        message: "Campaign 'Renovasi Sekolah Dasar' telah mencapai 50% target!",
        type: NotificationType.KABAR,
        createdAt: new Date(), // Just now,
        isRead: false,
      },
    ],
  });

  console.log("Seeding done.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
