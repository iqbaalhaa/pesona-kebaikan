import { Lightbulb, Megaphone, Heart, Shield } from "lucide-react";
import { getPageContent } from "@/actions/cms";
import CloseGuideButton from "./CloseGuideButton";

function parseGuideSections(source: string) {
	const regex = /<h2>([\s\S]*?)<\/h2>\s*<p>([\s\S]*?)<\/p>/gi;
	const sections: Array<{ title: string; body: string }> = [];
	let match: RegExpExecArray | null;

	match = regex.exec(source);
	while (match) {
		sections.push({
			title: match[1].trim(),
			body: match[2].trim(),
		});
		match = regex.exec(source);
	}

	return sections;
}

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

	const guideSections = parseGuideSections(html);
	const introSection = guideSections[0];
	const howToSection = guideSections[1];
	const benefitSection = guideSections[2];

	return (
		<div className="min-h-dvh bg-slate-950/10">
			<div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]">
				<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
					<div className="flex items-start justify-between gap-3 px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))]">
						<div className="min-w-0">
							<span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
								Panduan
							</span>
							<h1 className="mt-2 text-[22px] font-black leading-tight text-slate-900">
								{title}
							</h1>
							<p className="mt-1 text-[13px] leading-relaxed text-slate-500">
								Cara mudah menebar kebaikan dengan menjadi jembatan donasi
							</p>
						</div>
						<CloseGuideButton />
					</div>
				</header>

				<div className="flex-1 overflow-y-auto">
					<div className="px-4 pb-[calc(32px+env(safe-area-inset-bottom))] pt-4">
						<section className="rounded-[28px] bg-[linear-gradient(135deg,#0ba976_0%,#059669_100%)] p-4 text-white shadow-[0_20px_40px_-20px_rgba(11,169,118,0.7)]">
							<p className="text-sm font-semibold text-white/90">
								Jadi penghubung kebaikan
							</p>
							<p className="mt-2 text-[15px] leading-relaxed text-white/90">
								Bantu campaign menjangkau lebih banyak orang. Kamu cukup pilih
								campaign, buat link fundraiser, lalu sebarkan dengan cerita versimu
								sendiri.
							</p>
						</section>

						<section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
							<h2 className="mb-3 text-lg font-extrabold text-slate-900">
								Langkah-langkah
							</h2>
							<div className="flex flex-col gap-3">
								{steps.map((step, index) => (
									<div key={index} className="flex items-start gap-3">
										<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
											{index + 1}
										</span>
										<p className="pt-1 text-[15px] leading-relaxed text-slate-700">
											{step}
										</p>
									</div>
								))}
							</div>
						</section>

						<section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
							<h2 className="mb-3 text-lg font-extrabold text-slate-900">
								Tips Sukses Fundraiser
							</h2>
							<div className="grid grid-cols-1 gap-3">
								{tips.map((tip, index) => (
									<div
										key={index}
										className="rounded-2xl border p-3"
										style={{
											backgroundColor: `${tip.color}08`,
											borderColor: `${tip.color}20`,
										}}
									>
										<div className="mb-1.5 flex items-center gap-2">
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
						</section>

						{introSection && (
							<section className="mt-5 overflow-hidden rounded-[28px] border border-emerald-200/70 bg-[linear-gradient(180deg,#f7fffb_0%,#ffffff_100%)] shadow-[0_18px_46px_-30px_rgba(16,185,129,0.45)]">
								<div className="px-4 pt-4">
									<span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
										Apa itu fundraiser
									</span>
								</div>
								<div className="px-4 pb-5 pt-3">
									<h2 className="max-w-[16ch] text-[24px] font-black leading-[1.05] tracking-[-0.03em] text-slate-950">
										{introSection.title}
									</h2>
									<div className="mt-4 grid gap-4 rounded-[24px] bg-white/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-emerald-100">
										<p className="text-[16px] font-semibold leading-[1.7] text-slate-700">
											Fundraiser adalah jembatan yang membantu sebuah campaign
											menjangkau lebih banyak hati.
										</p>
										<p
											className="text-[14px] leading-7 text-slate-600"
											dangerouslySetInnerHTML={{ __html: introSection.body }}
										/>
									</div>
								</div>
							</section>
						)}

						{howToSection && (
							<section className="mt-5 overflow-hidden rounded-[28px] border border-sky-200/70 bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_100%)] shadow-[0_18px_46px_-30px_rgba(14,165,233,0.35)]">
								<div className="px-4 pt-4">
									<span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-sky-700">
										Cara menjadi fundraiser
									</span>
								</div>
								<div className="px-4 pb-5 pt-3">
									<div className="grid gap-4">
										<div>
											<h2 className="text-[24px] font-black leading-[1.05] tracking-[-0.03em] text-slate-950">
												{howToSection.title}
											</h2>
											<p
												className="mt-3 text-[14px] leading-7 text-slate-600"
												dangerouslySetInnerHTML={{ __html: howToSection.body }}
											/>
										</div>
										<div className="rounded-[24px] bg-slate-950 px-4 py-4 text-white">
											<p className="text-[12px] font-black uppercase tracking-[0.16em] text-white/60">
												Alurnya sederhana
											</p>
											<div className="mt-3 flex items-center gap-2 text-[13px] font-semibold leading-6 text-white/85">
												<span className="rounded-full bg-white/10 px-2 py-1">
													Pilih campaign
												</span>
												<span className="text-white/35">•</span>
												<span className="rounded-full bg-white/10 px-2 py-1">
													Buat link
												</span>
												<span className="text-white/35">•</span>
												<span className="rounded-full bg-white/10 px-2 py-1">
													Sebarkan
												</span>
											</div>
										</div>
									</div>
								</div>
							</section>
						)}

						{benefitSection && (
							<section className="mt-5 rounded-[24px] border border-amber-200/70 bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_100%)] p-4 shadow-[0_18px_46px_-30px_rgba(245,158,11,0.35)]">
								<span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
									Dampak yang kamu buat
								</span>
								<h2 className="mt-3 text-[22px] font-black leading-tight tracking-[-0.02em] text-slate-950">
									{benefitSection.title}
								</h2>
								<p
									className="mt-3 text-[14px] leading-7 text-slate-600"
									dangerouslySetInnerHTML={{ __html: benefitSection.body }}
								/>
							</section>
						)}

						{guideSections.length === 0 && (
							<section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
								<div
									className="prose prose-sm max-w-none prose-headings:mb-3 prose-headings:text-[22px] prose-headings:font-black prose-headings:tracking-[-0.02em] prose-headings:text-slate-950 prose-p:text-[14px] prose-p:leading-7 prose-p:text-slate-600"
									dangerouslySetInnerHTML={{ __html: html }}
								/>
							</section>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
