"use client";

import Link from "next/link";
import { Megaphone, ArrowRight, Heart } from "lucide-react";

export default function FundraiserCTA() {
	return (
		<div className="mt-7 mb-4 px-4">
			<div className="group relative overflow-hidden border border-primary/15 bg-gradient-to-br from-white to-green-50 p-2.5 shadow-[0_10px_30px_-10px_rgba(11,169,118,0.15)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_40px_-12px_rgba(11,169,118,0.25)]">
				{/* Decorative blobs */}
				<div className="pointer-events-none absolute -right-5 -top-5 h-[120px] w-[120px] rounded-full bg-[radial-gradient(circle,rgba(11,169,118,0.1)_0%,transparent_70%)]" />
				<div className="pointer-events-none absolute -bottom-[30px] -left-2.5 h-[100px] w-[100px] rounded-full bg-[radial-gradient(circle,rgba(11,169,118,0.08)_0%,transparent_70%)]" />

				<div className="relative z-1 flex items-center gap-2">
					<div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#067a54] text-white shadow-[0_8px_16px_rgba(11,169,118,0.25)]">
						<Megaphone size={28} />
					</div>

					<div className="min-w-0 flex-1">
						<h3 className="mb-0.5 text-[15px] font-black leading-tight tracking-tight text-slate-800">
							Jadi Fundraiser
						</h3>
						<p className="flex items-center gap-0.5 text-[13px] text-slate-500">
							Bantu sebarkan kebaikan
							<ArrowRight size={14} className="text-primary" />
						</p>
					</div>

					<Link
						href="/panduan-fundraiser"
						className="flex h-10 items-center gap-1 rounded-[40px] bg-primary/10 px-2.5 text-[13px] font-bold text-primary transition-all hover:scale-[1.02] hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(11,169,118,0.2)] active:scale-[0.98]"
					>
						Mulai
					</Link>
				</div>

				<div className="relative z-1 mt-2 flex items-center gap-1 border-t border-dashed border-primary/20 pt-1.5">
					<Heart size={16} className="text-primary" />
					<p className="text-xs font-medium text-slate-500">
						Ajak orang berdonasi & jadilah jembatan kebaikan
					</p>
				</div>
			</div>
		</div>
	);
}
