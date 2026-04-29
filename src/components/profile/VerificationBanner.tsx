"use client";

import { ShieldCheck, ChevronRight } from "lucide-react";

export default function VerificationBanner({
	onClick,
}: {
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className="mb-3 flex w-full cursor-pointer items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-2 transition-colors hover:bg-green-100"
		>
			<div className="flex items-center gap-2">
				<span className="grid h-11 w-11 place-items-center rounded-full border border-green-200 bg-white shadow-sm">
					<ShieldCheck size={22} className="text-primary" />
				</span>
				<div className="text-left">
					<p className="text-sm font-extrabold text-green-800">
						Verifikasi Akun
					</p>
					<p className="text-xs text-green-700">
						Lengkapi data diri Anda
					</p>
				</div>
			</div>
			<ChevronRight size={20} className="text-green-700" />
		</button>
	);
}
