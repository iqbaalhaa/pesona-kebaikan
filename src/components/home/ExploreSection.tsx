"use client";

import Link from "next/link";
import { ShieldCheck, Heart, Megaphone, Building2, ChevronRight } from "lucide-react";

const items = [
	{
		title: "Tentang Pesona Kebaikan",
		desc: "Pelajari pengelolaan dan dampak donasi via Pesona Kebaikan",
		icon: Building2,
		href: "/profil/tentang",
		color: "#0ba976",
	},
	{
		title: "Aman & Transparan",
		desc: "Identitas terverifikasi, laporan transparan, update rutin",
		icon: ShieldCheck,
		href: "/profil/tentang",
		color: "#0ea5e9",
	},
	{
		title: "Donasi Aman",
		desc: "Mulai dari Rp1, dengan metode pembayaran lengkap",
		icon: Heart,
		href: "/donasi",
		color: "#f43f5e",
	},
	{
		title: "Jadi Fundraiser",
		desc: "Bantu sebarkan kebaikan dan jadilah jembatan donasi",
		icon: Megaphone,
		href: "/panduan-fundraiser",
		color: "#f59e0b",
	},
];

export default function ExploreSection() {
	return (
		<div className="mt-7 px-4">
			<div className="mb-3 flex items-center gap-1.5">
				<div className="h-6 w-1 rounded bg-primary" />
				<h3 className="text-[15px] font-black tracking-tight text-foreground">
					Kenali Pesona Kebaikan
				</h3>
			</div>

			<div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)]">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.title}
							href={item.href}
							className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-50 first:rounded-t-2xl last:rounded-b-2xl"
						>
							<div
								className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
								style={{ backgroundColor: `${item.color}12` }}
							>
								<Icon size={24} style={{ color: item.color }} />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-bold leading-tight text-slate-800">
									{item.title}
								</p>
								<p className="mt-0.5 text-xs leading-snug text-slate-500">
									{item.desc}
								</p>
							</div>
							<ChevronRight size={18} className="shrink-0 text-slate-300" />
						</Link>
					);
				})}
			</div>
		</div>
	);
}
