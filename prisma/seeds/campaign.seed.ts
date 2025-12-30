import { prisma } from "../../src/lib/prisma";
import { CampaignStatus, CampaignMediaType } from "@/generated/prisma";

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

export async function seedCampaigns(adminId: string) {
  /* ===== CAMPAIGN ===== */
  const kesehatan = await upsertCampaignCategory("Kesehatan");
  const pendidikan = await upsertCampaignCategory("Pendidikan");
  const bencana = await upsertCampaignCategory("Bencana Alam");
  const kemanusiaan = await upsertCampaignCategory("Kemanusiaan");

  await Promise.all([
    ensureCampaign({
      title: "Bantu Adik Rizky Berjuang Melawan Kelainan Jantung Bawaan",
      categoryId: kesehatan.id,
      createdById: adminId,
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
      createdById: adminId,
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
      createdById: adminId,
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
      `,
    }),
  ]);
}
