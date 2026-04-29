"use client";

import Link from "next/link";
import { ShieldCheck, RefreshCw, Receipt } from "lucide-react";

const items = [
	{
		icon: ShieldCheck,
		title: "Verifikasi Penggalang",
		desc: "Identitas penggalang dana terverifikasi valid",
	},
	{
		icon: RefreshCw,
		title: "Update Rutin Kampanye",
		desc: "Kabar terbaru penggunaan dana secara berkala",
	},
	{
		icon: Receipt,
		title: "Laporan Transparan",
		desc: "Bukti penyaluran dana dapat diakses publik",
	},
];

function TrustItem({
	icon: Icon,
	title,
	desc,
}: {
	icon: React.ElementType;
	title: string;
	desc: string;
}) {
	return (
		<div className="group flex w-full gap-2 rounded-xl border border-transparent p-2 text-left transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/4 hover:shadow-[0_4px_12px_rgba(11,169,118,0.08)]">
			<div className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
				<Icon size={24} />
			</div>
			<div className="flex min-w-0 flex-col justify-center">
				<p className="mb-0.5 text-sm font-bold leading-tight tracking-tight text-slate-800">
					{title}
				</p>
				<p className="text-xs leading-snug text-slate-500">{desc}</p>
			</div>
		</div>
	);
}

export default function TrustStrip() {
	return (
		<div className="mt-3 px-2">
			<div className="border border-slate-100 bg-white p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
				<div className="mb-2 flex items-center gap-1.5 px-1">
					<div className="h-6 w-1 rounded bg-primary" />
					<h3 className="text-base font-extrabold tracking-tight text-foreground">
						Aman & Transparan
					</h3>
				</div>
				<div className="grid grid-cols-1 gap-1.5">
					{items.map((item) => (
						<TrustItem key={item.title} {...item} />
					))}
				</div>
			</div>
		</div>
	);
}
