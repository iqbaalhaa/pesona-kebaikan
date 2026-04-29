"use client";

import { Wallet, Building2, CreditCard, Receipt, Shield } from "lucide-react";

const PRIMARY = "#0ba976";

function PayChip({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
	return (
		<div className="group flex min-w-[140px] shrink-0 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-1.5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_4px_12px_rgba(11,169,118,0.08)]">
			<div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
				<Icon size={18} />
			</div>
			<p className="text-[13px] font-bold leading-tight text-slate-800">{label}</p>
		</div>
	);
}

export default function DonationBanner() {
	const MIN_DONATION = Number(process.env.NEXT_PUBLIC_MIN_DONATION ?? 1);

	return (
		<div className="mt-5 px-4">
			<div className="relative overflow-hidden border border-slate-100 bg-white p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
				<div className="pointer-events-none absolute -right-5 -top-5 h-[100px] w-[100px] rounded-full bg-primary/3" />

				<div className="relative z-1 flex items-start justify-between gap-2">
					<div>
						<div className="mb-1 flex items-center gap-1">
							<Shield size={16} className="text-primary" />
							<span className="text-xs font-bold uppercase tracking-wider text-primary">
								Donasi Aman
							</span>
						</div>
						<p className="mb-0.5 text-[13px] font-semibold text-slate-500">
							Minimum Donasi Mulai
						</p>
						<p className="text-[28px] font-extrabold leading-none tracking-tight text-foreground">
							Rp{MIN_DONATION.toLocaleString("id-ID")}
						</p>
					</div>
					<div className="hidden rounded-2xl bg-primary/6 p-1.5 text-primary sm:block">
						<Shield size={32} />
					</div>
				</div>

				<div className="my-3 h-px w-full bg-slate-200/60" />

				<div className="relative z-1">
					<p className="mb-2 text-sm font-bold text-slate-800">
						Metode Pembayaran Lengkap
					</p>
					<div className="-mx-1 flex flex-wrap gap-1.5 px-1 pb-1">
						<PayChip label="E-Wallet" icon={Wallet} />
						<PayChip label="Virtual Account" icon={Receipt} />
						<PayChip label="Bank Transfer" icon={Building2} />
						<PayChip label="Kartu Kredit" icon={CreditCard} />
					</div>
				</div>
			</div>
		</div>
	);
}
