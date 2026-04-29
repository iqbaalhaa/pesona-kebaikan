"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function CloseGuideButton() {
	const router = useRouter();

	return (
		<button
			type="button"
			aria-label="Tutup panduan fundraiser"
			onClick={() => {
				if (window.history.length > 1) {
					router.back();
					return;
				}
				router.push("/");
			}}
			className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
		>
			<X size={20} />
		</button>
	);
}
