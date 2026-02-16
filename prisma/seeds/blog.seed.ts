import { prisma } from "../../src/lib/prisma";
import { BlogMediaType } from "@prisma/client";

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
	categoryId: string;
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
			categoryId: params.categoryId,
			createdById: params.createdById,
			heroImage: params.heroImage || undefined,
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

export async function seedBlogs(adminId: string) {
	/* ===== BLOG ===== */
	// Categories: Edukasi, Cerita, Transparansi, Update, Panduan
	const catEdukasi = await upsertBlogCategory("Edukasi");
	const catCerita = await upsertBlogCategory("Cerita");
	const catTransparansi = await upsertBlogCategory("Transparansi");
	const catUpdate = await upsertBlogCategory("Update");
	const catPanduan = await upsertBlogCategory("Panduan");

	await ensureBlog({
		title: "Kenapa Transparansi Penting dalam Donasi: Membangun Kepercayaan di Era Digital",
		createdById: adminId,
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
		createdById: adminId,
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
		createdById: adminId,
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
    createdById: adminId,
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
    createdById: adminId,
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
    createdById: adminId,
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
}
