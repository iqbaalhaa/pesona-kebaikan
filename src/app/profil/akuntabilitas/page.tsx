"use client";

import * as React from "react";
import { ShieldCheck, BarChart3, Landmark, Download, Loader2 } from "lucide-react";
import { getPageContent } from "@/actions/cms";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PageContainer from "@/components/profile/PageContainer";

interface AccountabilityData {
	hero: { title: string; description: string };
	cards: { icon: string; title: string; description: string }[];
	reports: { year: string; title: string; size: string; url: string }[];
}

export default function AccountabilityPage() {
	const [loading, setLoading] = React.useState(true);
	const [data, setData] = React.useState<AccountabilityData | null>(null);

	React.useEffect(() => {
		async function load() {
			try {
				const page = await getPageContent("accountability");
				if (page?.data) setData(page.data as any);
			} catch (e) {
				console.error("Failed to load accountability data", e);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 size={24} className="animate-spin text-primary" />
			</div>
		);
	}

	if (!data) return null;

	return (
		<PageContainer>
			<ProfileHeader title="Akuntabilitas" />

			<div className="mb-4 flex flex-col items-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-3 text-center text-white">
				<ShieldCheck size={48} className="mb-2 text-primary" />
				<h2 className="mb-1 text-xl font-extrabold">{data.hero.title}</h2>
				<p className="text-sm leading-relaxed opacity-80">
					{data.hero.description}
				</p>
			</div>

			<div className="mb-4 grid grid-cols-2 gap-2">
				{data.cards.map((card, idx) => (
					<div
						key={idx}
						className="flex h-full flex-col items-center rounded-xl border border-divider p-2 text-center"
					>
						{card.icon === "audit" ? (
							<BarChart3 size={32} className="mb-1 text-primary" />
						) : (
							<Landmark size={32} className="mb-1 text-primary" />
						)}
						<p className="mb-0.5 text-sm font-bold">{card.title}</p>
						<p className="text-xs text-foreground/60">{card.description}</p>
					</div>
				))}
			</div>

			<h3 className="mb-2 text-lg font-extrabold text-foreground">
				Laporan Tahunan
			</h3>

			<div className="flex flex-col gap-2">
				{data.reports.map((report, idx) => (
					<div
						key={idx}
						className="flex items-center justify-between rounded-xl border border-divider p-2"
					>
						<div>
							<p className="text-base font-bold text-foreground">
								{report.title}
							</p>
							<p className="text-xs text-foreground/60">
								PDF • {report.size}
							</p>
						</div>
						<a
							href={report.url}
							target="_blank"
							rel="noopener noreferrer"
							className="grid h-9 w-9 place-items-center rounded-lg text-primary transition-colors hover:bg-primary/10"
						>
							<Download size={20} />
						</a>
					</div>
				))}
			</div>
		</PageContainer>
	);
}
