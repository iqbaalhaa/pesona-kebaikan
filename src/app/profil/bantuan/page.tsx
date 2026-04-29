"use client";

import * as React from "react";
import { HelpCircle, Search, ChevronDown } from "lucide-react";
import { getFaqs } from "@/actions/cms";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PageContainer from "@/components/profile/PageContainer";

export default function HelpCenterPage() {
	const [expanded, setExpanded] = React.useState<string | false>(false);
	const [faqs, setFaqs] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [search, setSearch] = React.useState("");

	React.useEffect(() => {
		const fetchFaqs = async () => {
			try {
				const data = await getFaqs();
				setFaqs(data);
			} catch (error) {
				console.error("Failed to load FAQs", error);
			} finally {
				setLoading(false);
			}
		};
		fetchFaqs();
	}, []);

	const filteredFaqs = faqs.filter(
		(faq) =>
			faq.question.toLowerCase().includes(search.toLowerCase()) ||
			faq.answer.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<PageContainer>
			<ProfileHeader title="Pusat Bantuan" />

			<div className="mb-4 rounded-2xl bg-primary p-2 text-center text-white">
				<HelpCircle size={40} className="mx-auto mb-1 opacity-90" />
				<h2 className="mb-0.5 text-lg font-extrabold">
					Halo, ada yang bisa kami bantu?
				</h2>
				<p className="mb-2 text-[13px] opacity-90">
					Temukan jawaban untuk pertanyaan Anda disini
				</p>
				<div className="relative">
					<Search
						size={18}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
					/>
					<input
						type="text"
						placeholder="Cari topik bantuan..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-lg bg-white py-2 pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-foreground/40"
					/>
				</div>
			</div>

			<h3 className="mb-2 text-base font-extrabold text-foreground">
				Pertanyaan Sering Diajukan
			</h3>

			<div>
				{loading ? (
					Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="mb-1 h-14 animate-pulse rounded-xl bg-foreground/5"
						/>
					))
				) : filteredFaqs.length > 0 ? (
					filteredFaqs.map((faq) => (
						<div
							key={faq.id}
							className="mb-1 overflow-hidden rounded-xl border border-foreground/8"
						>
							<button
								onClick={() =>
									setExpanded(expanded === faq.id ? false : faq.id)
								}
								className="flex w-full cursor-pointer items-center justify-between p-3 text-left"
							>
								<span className="text-sm font-semibold">{faq.question}</span>
								<ChevronDown
									size={18}
									className={`shrink-0 text-foreground/50 transition-transform duration-200 ${expanded === faq.id ? "rotate-180" : ""}`}
								/>
							</button>
							{expanded === faq.id && (
								<div className="border-t border-foreground/8 px-3 pb-3 pt-2">
									<p className="text-[13px] leading-relaxed text-foreground/70">
										{faq.answer}
									</p>
								</div>
							)}
						</div>
					))
				) : (
					<p className="py-4 text-center text-sm text-text-secondary">
						{search
							? "Tidak ada pertanyaan yang cocok dengan pencarian Anda"
							: "Belum ada FAQ yang ditambahkan"}
					</p>
				)}
			</div>
		</PageContainer>
	);
}
