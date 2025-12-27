import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

// Enums defined locally to avoid generator issues
const Role = {
	USER: "USER",
	ADMIN: "ADMIN",
} as const;

const BlogMediaType = {
	image: "image",
	video: "video",
	file: "file",
} as const;

const CampaignStatus = {
	PENDING: "PENDING",
	ACTIVE: "ACTIVE",
	REJECTED: "REJECTED",
	COMPLETED: "COMPLETED",
	DRAFT: "DRAFT",
} as const;

type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

const CampaignMediaType = {
	IMAGE: "IMAGE",
	VIDEO: "VIDEO",
} as const;

type CampaignMediaType = (typeof CampaignMediaType)[keyof typeof CampaignMediaType];

const PaymentMethod = {
	EWALLET: "EWALLET",
	VIRTUAL_ACCOUNT: "VIRTUAL_ACCOUNT",
	TRANSFER: "TRANSFER",
	CARD: "CARD",
} as const;

const NotificationType = {
	KABAR: "KABAR",
	PESAN: "PESAN",
} as const;

/* =========================
   HELPERS (IDEMPOTENT)
========================= */

async function upsertPageContent(params: {
	key: string;
	title: string;
	content: string;
	data?: Record<string, unknown>;
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

type BlogMediaType = "image" | "video" | "file";

async function ensureBlog(params: {
	title: string;
	content: string;
	categoryId?: string | null;
	createdById: string;
	heroImage?: string;
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
   ADDRESS SEED
========================= */
async function seedAddress() {
	console.log("Seeding Address...");

	const readCsv = (filename: string) => {
		const filePath = path.join(process.cwd(), "prisma", filename);
		if (!fs.existsSync(filePath)) {
			console.warn(`File not found: ${filename}`);
			return [];
		}
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const lines = fileContent.split("\n").filter((l) => l.trim() !== "");
		// Skip header
		return lines.slice(1).map((line) => {
			const parts = line.split(",");
			const clean = (s: string) => (s ? s.trim().replace(/^"|"$/g, "") : "");
			return parts.map(clean);
		});
	};

	try {
		const provinces = readCsv("_Province__202512271348.csv");
		if (provinces.length > 0) {
			await prisma.province.createMany({
				data: provinces.map((p) => ({
					id: p[0],
					code: p[1],
					name: p[2],
				})),
				skipDuplicates: true,
			});
			console.log(`Seeded ${provinces.length} provinces`);
		}

		const regencies = readCsv("_Regency__202512271348.csv");
		if (regencies.length > 0) {
			await prisma.regency.createMany({
				data: regencies.map((p) => ({
					id: p[0],
					code: p[1],
					name: p[2],
					provinceId: p[3],
				})),
				skipDuplicates: true,
			});
			console.log(`Seeded ${regencies.length} regencies`);
		}

		const districts = readCsv("_District__202512271348.csv");
		if (districts.length > 0) {
			for (let i = 0; i < districts.length; i += 1000) {
				const chunk = districts.slice(i, i + 1000);
				await prisma.district.createMany({
					data: chunk.map((p) => ({
						id: p[0],
						code: p[1],
						name: p[2],
						regencyId: p[3],
					})),
					skipDuplicates: true,
				});
			}
			console.log(`Seeded ${districts.length} districts`);
		}

		const villages = readCsv("_Village__202512271348.csv");
		/*
		if (villages.length > 0) {
			for (let i = 0; i < villages.length; i += 1000) {
				const chunk = villages.slice(i, i + 1000);
				await prisma.village.createMany({
					data: chunk.map((p) => ({
						id: p[0],
						code: p[1],
						name: p[2],
						districtId: p[3],
					})),
					skipDuplicates: true,
				});
			}
			console.log(`Seeded ${villages.length} villages`);
		}
		*/
	} catch (error) {
		console.error("Error seeding address:", error);
	}
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
	// Categories: Edukasi, Cerita, Transparansi, Update, Panduan
	const catEdukasi = await upsertBlogCategory("Edukasi");
	const catCerita = await upsertBlogCategory("Cerita");
	const catTransparansi = await upsertBlogCategory("Transparansi");
	const catUpdate = await upsertBlogCategory("Update");
	const catPanduan = await upsertBlogCategory("Panduan");

	await ensureBlog({
		title: "Kenapa Transparansi Penting dalam Donasi: Membangun Kepercayaan di Era Digital",
		createdById: admin.id,
		categoryId: catTransparansi.id,
		heroImage: "https://picsum.photos/1200/800?1",
		content: `
      <h2>Pentingnya Transparansi dalam Berdonasi</h2>
      <p>Di era digital saat ini, transparansi menjadi kunci utama dalam membangun kepercayaan antara donatur dan lembaga pengelola donasi. Masyarakat semakin cerdas dan kritis dalam memilih kemana mereka akan menyalurkan bantuan. Oleh karena itu, platform donasi harus mampu menyajikan data yang terbuka dan dapat dipertanggungjawabkan.</p>
      
      <p>Transparansi bukan hanya soal menampilkan angka, tetapi juga menceritakan dampak nyata dari setiap rupiah yang disumbangkan. Ketika donatur bisa melihat update berkala, foto dokumentasi penyaluran, dan laporan keuangan yang jelas, rasa percaya mereka akan tumbuh. Hal ini akan mendorong mereka untuk terus berpartisipasi dalam misi kebaikan.</p>

      <h3>Apa yang Pesona Kebaikan Lakukan?</h3>
      <p>Pesona Kebaikan berkomitmen untuk menjaga amanah donatur dengan:</p>
      <ul>
        <li>Menyediakan laporan penyaluran dana secara berkala pada setiap campaign.</li>
        <li>Melakukan verifikasi ketat terhadap penggalang dana untuk mencegah penipuan.</li>
        <li>Menampilkan bukti transfer dan dokumentasi kegiatan secara real-time.</li>
      </ul>

      <p>Dengan adanya transparansi, kita tidak hanya membantu penerima manfaat, tetapi juga menjaga niat baik para donatur agar tepat sasaran. Mari bersama-sama wujudkan ekosistem donasi yang jujur, aman, dan berdampak luas.</p>
      
      <img src="https://picsum.photos/1200/800?1" alt="Ilustrasi Transparansi" />
    `,
		gallery: [
			{ type: "image", url: "https://picsum.photos/1200/800?1" },
		],
	});

	await ensureBlog({
		title: "Panduan Mudah Berdonasi di Pesona Kebaikan",
		createdById: admin.id,
		categoryId: catPanduan.id,
		heroImage: "https://picsum.photos/1200/800?2",
		content: `
			<h2>Langkah-langkah Berdonasi</h2>
			<p>Berdonasi di Pesona Kebaikan sangat mudah dan cepat. Ikuti langkah-langkah berikut:</p>
			<ol>
				<li>Pilih campaign yang ingin Anda bantu.</li>
				<li>Klik tombol "Donasi Sekarang".</li>
				<li>Masukkan nominal donasi.</li>
				<li>Pilih metode pembayaran (Transfer Bank, E-Wallet, dll).</li>
				<li>Selesaikan pembayaran dan konfirmasi.</li>
			</ol>
			<p>Semoga panduan ini membantu Anda dalam menyalurkan kebaikan!</p>
		`,
		gallery: [
			{ type: "image", url: "https://picsum.photos/1200/800?2" },
		],
	});

	await ensureBlog({
		title: "Cerita Inspiratif: Dari Kebaikan Kecil Menjadi Dampak Besar",
		createdById: admin.id,
		categoryId: catCerita.id,
		heroImage: "https://picsum.photos/1200/800?3",
		content: `
			<p>Setiap donasi, sekecil apapun, memiliki dampak yang luar biasa bagi mereka yang membutuhkan. Mari simak cerita inspiratif dari para penerima manfaat...</p>
			<p>Bersama kita bisa membuat perubahan nyata.</p>
		`,
		gallery: [
			{ type: "image", url: "https://picsum.photos/1200/800?3" },
		],
	});

  await ensureBlog({
    title: "Cara Memilih Campaign yang Terpercaya dan Amanah",
    createdById: admin.id,
    categoryId: catEdukasi.id,
    content: `
      <h2>Panduan Memilih Campaign Donasi</h2>
      <p>Banyaknya platform donasi online memberikan kemudahan bagi kita untuk berbagi. Namun, di sisi lain, risiko penyalahgunaan dana juga semakin besar. Bagaimana cara memastikan donasi kita sampai ke tangan yang berhak? Berikut adalah beberapa tips cerdas dalam memilih campaign donasi.</p>

      <h3>1. Cek Verifikasi Identitas Penggalang Dana</h3>
      <p>Pastikan penggalang dana telah melalui proses verifikasi identitas (KYC). Platform terpercaya biasanya memberikan tanda khusus seperti centang biru atau label "Verified". Jangan ragu untuk membaca profil penggalang dana dan rekam jejak mereka sebelumnya.</p>

      <h3>2. Perhatikan Detail Cerita dan Rencana Anggaran</h3>
      <p>Campaign yang baik akan menyertakan cerita yang detail, kronologis, dan masuk akal. Selain itu, perhatikan juga Rencana Anggaran Biaya (RAB). Apakah target donasi relevan dengan kebutuhan? Jika ada rincian biaya pengobatan atau pembangunan, pastikan angkanya logis.</p>

      <h3>3. Lihat Update dan Kabar Terbaru</h3>
      <p>Penggalang dana yang amanah akan rajin memberikan kabar terbaru (update) mengenai kondisi penerima manfaat atau progres kegiatan. Jika sebuah campaign sudah berjalan lama namun minim update, Anda patut waspada.</p>

      <p>Ingat, kepedulian kita sangat berharga. Jangan sampai niat baik kita dimanfaatkan oleh oknum tidak bertanggung jawab. Selalu teliti sebelum memberi, agar kebaikan kita benar-benar membawa perubahan.</p>
      
      <img src="https://picsum.photos/1200/800?2" alt="Memilih Campaign" />
    `,
    gallery: [
      { type: BlogMediaType.image, url: "https://picsum.photos/1200/800?2" },
    ],
  });

  await ensureBlog({
    title: "Kisah Inspiratif: Dari Recehan Menjadi Harapan Baru",
    createdById: admin.id,
    categoryId: catCerita.id,
    content: `
      <h2>Kekuatan Gotong Royong</h2>
      <p>Seringkali kita merasa bahwa bantuan kecil tidak berarti apa-apa. "Hanya sepuluh ribu rupiah, bisa buat apa?" pikir kita. Namun, kisah kali ini membuktikan sebaliknya. Berawal dari gerakan recehan yang diinisiasi oleh sekelompok pemuda di desa kecil, sebuah sekolah yang nyaris roboh akhirnya bisa berdiri tegak kembali.</p>

      <p>Pak Budi, seorang guru honorer, tak pernah menyangka bahwa postingan sederhananya di media sosial akan menggerakkan ribuan hati. Ia hanya memotret atap kelas yang bocor saat hujan deras, di mana murid-muridnya terpaksa belajar sambil memegang payung. Foto itu viral, dan bantuan pun mengalir deras.</p>

      <p>Dalam waktu kurang dari satu bulan, dana yang terkumpul mencapai ratusan juta rupiah. Bukan dari satu donatur besar, melainkan dari ribuan orang yang menyisihkan uang jajan mereka. Ada yang menyumbang 5 ribu, 10 ribu, hingga 50 ribu. Semuanya bersatu menjadi kekuatan besar.</p>
      
      <p>Kini, sekolah itu telah direnovasi total. Tidak ada lagi atap bocor. Tidak ada lagi lantai tanah yang becek. Anak-anak bisa belajar dengan nyaman dan penuh semangat. Ini adalah bukti nyata bahwa kebaikan, sekecil apapun, jika dilakukan bersama-sama, akan menciptakan dampak yang luar biasa.</p>
    `,
  });

  await ensureBlog({
    title: "Update Penyaluran Donasi: Bantuan Telah Tiba di Lokasi Bencana",
    createdById: admin.id,
    categoryId: catUpdate.id,
    content: `
      <h2>Laporan Penyaluran Donasi</h2>
      <p>Alhamdulillah, berkat bantuan dari #OrangBaik semua, tim relawan Pesona Kebaikan telah berhasil menyalurkan bantuan tahap pertama untuk korban banjir bandang di Kabupaten X.</p>

      <p>Bantuan yang disalurkan meliputi:</p>
      <ul>
        <li>500 paket sembako</li>
        <li>200 selimut tebal</li>
        <li>Obat-obatan dan vitamin</li>
        <li>Perlengkapan bayi</li>
      </ul>

      <p>Tim kami menempuh perjalanan darat selama 8 jam, dilanjutkan dengan perahu karet untuk menembus daerah yang masih terisolir. Warga menyambut kedatangan bantuan dengan penuh haru.</p>

      <p>Terima kasih atas kepedulian Anda. Kami akan terus memberikan update berkala mengenai kondisi di lapangan dan penyaluran bantuan selanjutnya.</p>
    `,
    heroImage: "https://picsum.photos/1200/800?4",
    gallery: [
      { type: "image", url: "https://picsum.photos/1200/800?4" },
    ],
  });

  /* ===== CAMPAIGN ===== */
  const kesehatan = await upsertCampaignCategory("Kesehatan");
  const pendidikan = await upsertCampaignCategory("Pendidikan");
  const bencana = await upsertCampaignCategory("Bencana Alam");
  const kemanusiaan = await upsertCampaignCategory("Kemanusiaan");

  const campaigns = await Promise.all([
    ensureCampaign({
      title: "Bantu Adik Rizky Berjuang Melawan Kelainan Jantung Bawaan",
      categoryId: kesehatan.id,
      createdById: admin.id,
      target: 100_000_000,
      story: `
        <p>Hai Orang Baik,</p>
        <p>Perkenalkan, nama saya Andi, ayah dari <strong>Rizky (5 tahun)</strong>. Saat ini, putra kecil kami sedang berjuang melawan penyakit jantung bawaan yang dideritanya sejak lahir. Rizky adalah anak yang ceria dan aktif, namun belakangan ini kondisinya semakin menurun.</p>

        <p>Awalnya, Rizky sering mengeluh sesak napas dan cepat lelah saat bermain. Kulitnya sering membiru jika ia terlalu banyak beraktivitas. Setelah kami bawa ke rumah sakit rujukan di Jakarta, dokter mendiagnosa Rizky mengalami kebocoran pada katup jantungnya dan harus segera menjalani operasi.</p>

        <h3>Kenapa Kami Menggalang Dana?</h3>
        <p>Biaya operasi dan perawatan pasca-operasi sangatlah besar. Meskipun kami memiliki BPJS, ada banyak biaya lain yang tidak tercover, seperti obat-obatan khusus, susu penunjang nutrisi, serta biaya akomodasi selama kami harus tinggal di Jakarta menunggu jadwal operasi. Sebagai buruh harian lepas, penghasilan saya tidak menentu dan jauh dari cukup untuk menutupi kebutuhan tersebut.</p>

        <p>Kami sangat berharap bantuan dan doa dari teman-teman semua agar Rizky bisa segera dioperasi dan kembali bermain seperti anak-anak lainnya. Setiap rupiah yang teman-teman donasikan akan sangat berarti bagi kesembuhan Rizky.</p>

        <p>Rencana penggunaan dana:</p>
        <ul>
          <li>Biaya obat-obatan dan vitamin penunjang: Rp 20.000.000</li>
          <li>Biaya operasional & akomodasi di Jakarta: Rp 15.000.000</li>
          <li>Biaya pendampingan medis & check-up rutin: Rp 15.000.000</li>
          <li>Dana darurat pasca operasi: Rp 50.000.000</li>
        </ul>

        <p>Terima kasih atas kebaikan hati teman-teman semua. Semoga Tuhan membalas kebaikan kalian dengan berlipat ganda.</p>
      `,
      media: [
        {
          type: CampaignMediaType.IMAGE,
          url: "https://picsum.photos/800/600?10",
          isThumbnail: true,
        },
        {
          type: CampaignMediaType.IMAGE,
          url: "https://picsum.photos/800/600?20",
          isThumbnail: false,
        },
      ],
    }),
    ensureCampaign({
      title: "Bangun Sekolah Impian untuk Anak-Anak Desa Mekar Jaya",
      categoryId: pendidikan.id,
      createdById: admin.id,
      target: 250_000_000,
      story: `
        <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
        <p>Di pelosok Desa Mekar Jaya, terdapat sebuah sekolah dasar kayu yang sudah berdiri sejak 30 tahun lalu. Kondisinya kini sangat memprihatinkan. Dinding-dinding kayunya mulai lapuk dimakan rayap, atapnya bocor di banyak titik, dan lantainya masih berupa tanah yang akan menjadi lumpur saat musim hujan tiba.</p>

        <p>Sekolah ini adalah satu-satunya harapan bagi 150 siswa di desa tersebut untuk menuntut ilmu. Jarak ke sekolah lain terdekat mencapai 10 kilometer dengan medan jalan yang sulit dilalui. Meski dengan kondisi fasilitas yang serba terbatas, semangat belajar anak-anak ini tak pernah surut. Mereka tetap datang setiap pagi dengan senyum merekah, membawa mimpi-mimpi besar mereka.</p>

        <h3>Mimpi Kami</h3>
        <p>Kami, Karang Taruna Desa Mekar Jaya, berinisiatif untuk merenovasi sekolah ini agar layak dan aman digunakan. Kami ingin membangun:</p>
        <ul>
          <li>3 Ruang kelas baru yang permanen</li>
          <li>1 Ruang guru dan perpustakaan</li>
          <li>Fasilitas MCK yang bersih dan layak</li>
        </ul>

        <p>Total biaya yang dibutuhkan diperkirakan mencapai Rp 250.000.000. Kami mengajak Sahabat Kebaikan semua untuk ikut ambil bagian dalam mencerdaskan kehidupan bangsa, dimulai dari Desa Mekar Jaya. Satu bata yang Anda sumbangkan adalah pondasi bagi masa depan mereka.</p>

        <p>Mari wujudkan sekolah impian mereka!</p>
      `,
      media: [
        {
          type: CampaignMediaType.IMAGE,
          url: "https://picsum.photos/800/600?11",
          isThumbnail: true,
        },
      ],
    }),
    ensureCampaign({
      title: "Darurat Banjir Bandang: Ribuan Warga Kehilangan Tempat Tinggal",
      categoryId: bencana.id,
      createdById: admin.id,
      target: 150_000_000,
      story: `
        <p><strong>URGENT: Bantuan Kemanusiaan untuk Korban Banjir Bandang</strong></p>
        <p>Hujan deras yang mengguyur wilayah Kabupaten X selama tiga hari berturut-turut telah menyebabkan sungai meluap dan memicu banjir bandang yang dahsyat. Ribuan rumah terendam lumpur, akses jalan terputus, dan listrik padam total. Data sementara mencatat 500 KK mengungsi di posko-posko darurat dengan kondisi yang sangat terbatas.</p>

        <p>Para pengungsi saat ini sangat membutuhkan bantuan mendesak berupa:</p>
        <ul>
          <li>Makanan siap saji & air bersih</li>
          <li>Selimut & pakaian layak pakai</li>
          <li>Obat-obatan & vitamin</li>
          <li>Perlengkapan bayi (popok, susu, bubur bayi)</li>
          <li>Alat kebersihan untuk membersihkan lumpur pasca banjir</li>
        </ul>

        <p>Tim relawan kami sudah berada di lokasi untuk melakukan evakuasi dan mendirikan dapur umum. Namun, persediaan logistik semakin menipis. Kami mengetuk hati Anda untuk berbagi sedikit rezeki demi meringankan beban saudara-saudara kita yang sedang tertimpa musibah.</p>

        <p>Berapapun bantuan Anda, akan sangat berarti untuk menyambung hidup mereka di tengah bencana ini. Mari bersolidaritas, mari bantu sesama!</p>
      `,
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

	/* ===== ADDRESS ===== */
	await seedAddress();

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
