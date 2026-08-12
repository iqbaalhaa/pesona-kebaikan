"use client";

import { ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";

export default function VerificationBanner({
	onClick,
	rejected = false,
	reason,
}: {
	onClick: () => void;
	rejected?: boolean;
	reason?: string | null;
}) {
	if (rejected) {
		return (
			<button
				onClick={onClick}
				className="mb-3 flex w-full cursor-pointer flex-col gap-1.5 rounded-2xl border border-red-200 bg-red-50 p-2 text-left transition-colors hover:bg-red-100"
			>
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="grid h-11 w-11 place-items-center rounded-full border border-red-200 bg-white shadow-sm">
							<ShieldAlert size={22} className="text-red-600" />
						</span>
						<div>
							<p className="text-sm font-extrabold text-red-800">
								Verifikasi Ditolak
							</p>
							<p className="text-xs text-red-700">Ketuk untuk ajukan ulang</p>
						</div>
					</div>
					<ChevronRight size={20} className="text-red-700" />
				</div>
				{reason && (
					<p className="rounded-xl bg-white/70 px-2 py-1.5 text-xs text-red-800">
						<span className="font-bold">Alasan: </span>
						{reason}
					</p>
				)}
			</button>
		);
	}

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
