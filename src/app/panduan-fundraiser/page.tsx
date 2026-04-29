import { Lightbulb, Megaphone, Heart, Shield } from "lucide-react";
import { getPageContent } from "@/actions/cms";

export default async function FundraiseGuidePage() {
	const content = await getPageContent("fundraiser_guide");

	const title = content?.title || "Panduan Menjadi Fundraiser";
	const html =
		content?.content ||
		`
    <h2>Apa itu Fundraiser?</h2>
    <p>Fundraiser adalah orang baik yang membantu menggalang dana untuk campaign orang lain. Kamu bisa menebar kebaikan tanpa perlu modal, cukup dengan membagikan link campaign.</p>
    <h2>Cara Menjadi Fundraiser</h2>
    <p>Pilih campaign yang ingin kamu bantu, klik tombol "Jadi Fundraiser", dan dapatkan link khusus untuk disebarkan.</p>
    <h2>Keuntungan Menjadi Fundraiser</h2>
    <p>Setiap donasi yang masuk melalui link kamu akan tercatat, dan kamu bisa melihat dampak kebaikan yang telah kamu sebarkan.</p>
  `;

	const tips = [
		{
			icon: <Lightbulb size={20} />,
			title: "Pilih campaign yang menyentuh hati",
			desc: "Pilih cerita yang menurutmu paling layak dibantu agar lebih semangat menyebarkannya.",
			color: "#10b981",
		},
		{
			icon: <Megaphone size={20} />,
			title: "Bagikan ke circle terdekat",
			desc: "Mulai dari keluarga dan teman dekat, mereka lebih mudah percaya rekomendasi kamu.",
			color: "#0ea5e9",
		},
		{
			icon: <Heart size={20} />,
			title: "Gunakan kata-kata personal",
			desc: "Tambahkan alasan kenapa kamu mendukung campaign ini saat membagikan link.",
			color: "#f59e0b",
		},
		{
			icon: <Shield size={20} />,
			title: "Pantau donasi masuk",
			desc: "Cek secara berkala dashboard fundraiser kamu untuk melihat perkembangan donasi.",
			color: "#8b5cf6",
		},
	];

	const steps = [
		"Buka halaman detail campaign yang ingin dibantu",
		"Klik tombol 'Jadi Fundraiser'",
		"Isi form singkat jika diperlukan",
		"Salin link fundraiser kamu",
		"Bagikan link ke media sosial dan grup chat",
	];

	return (
		<div className="bg-background">
			<div className="mx-auto max-w-2xl px-2 pb-8 pt-3">
				<div className="rounded-xl border border-divider bg-surface p-3">
					<span className="rounded border border-success/30 px-2 py-0.5 text-xs font-bold text-success">
						Panduan
					</span>
					<h1 className="mt-1 text-[22px] font-black text-foreground">
						{title}
					</h1>
					<p className="mt-0.5 text-[13px] text-text-secondary">
						Cara mudah menebar kebaikan dengan menjadi jembatan donasi
					</p>

					<div className="mt-4">
						<h2 className="mb-2 text-lg font-extrabold">Langkah-langkah</h2>
						<div className="flex flex-col gap-2">
							{steps.map((step, index) => (
								<div key={index} className="flex items-start gap-2">
									<span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
										{index + 1}
									</span>
									<p className="pt-0.5 text-[15px]">{step}</p>
								</div>
							))}
						</div>
					</div>

					<div className="mt-5">
						<h2 className="mb-2 text-lg font-extrabold">
							Tips Sukses Fundraiser
						</h2>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{tips.map((tip, index) => (
								<div
									key={index}
									className="rounded-2xl border p-2"
									style={{
										backgroundColor: `${tip.color}08`,
										borderColor: `${tip.color}20`,
									}}
								>
									<div className="mb-1 flex items-center gap-1.5">
										<span style={{ color: tip.color }}>{tip.icon}</span>
										<p className="text-[15px] font-bold text-slate-800">
											{tip.title}
										</p>
									</div>
									<p className="text-[13px] leading-snug text-slate-500">
										{tip.desc}
									</p>
								</div>
							))}
						</div>
					</div>

					<div className="mt-5">
						<div
							className="prose prose-sm max-w-none"
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
