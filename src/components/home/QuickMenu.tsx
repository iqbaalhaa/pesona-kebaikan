"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Building, Megaphone, CalendarClock, X } from "lucide-react";

type MenuStatus = "new" | "soon";
type MenuItem = {
	id: string;
	label: string;
	href?: string;
	status?: MenuStatus;
	icon: React.ElementType;
};

const MENUS: readonly MenuItem[] = [
	{ id: "donasi", label: "Donasi", href: "/donasi", status: "new", icon: Heart },
	{ id: "zakat", label: "Zakat", status: "soon", icon: Building },
	{ id: "galang-dana", label: "Galang Dana", href: "/galang-dana", icon: Megaphone },
	{ id: "donasi-otomatis", label: "Donasi Otomatis", status: "soon", icon: CalendarClock },
];

export default function QuickMenu() {
	const router = useRouter();
	const [toast, setToast] = React.useState<string | null>(null);
	const timerRef = React.useRef<number | null>(null);

	const showToast = React.useCallback((text: string) => {
		setToast(text);
		if (timerRef.current) window.clearTimeout(timerRef.current);
		timerRef.current = window.setTimeout(() => setToast(null), 2200);
	}, []);

	React.useEffect(() => {
		return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
	}, []);

	const handleActivate = React.useCallback(
		(m: MenuItem) => {
			if (m.href) { router.push(m.href); return; }
			showToast(`${m.label} — fitur segera hadir`);
		},
		[router, showToast],
	);

	return (
		<div className="relative z-2 mt-5 px-4">
			<h2 className="mb-3 text-[15px] font-black text-foreground">
				Mau berbuat baik apa hari ini?
			</h2>

			<div className="grid grid-cols-2 gap-2.5">
				{MENUS.map((m) => {
					const Icon = m.icon;
					const inner = (
						<button
							onClick={() => handleActivate(m)}
							className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-divider bg-white py-5 text-center transition-all active:scale-[0.98]"
						>
							<div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
								<Icon size={26} className="text-primary" />
							</div>

							<span className="mt-2 text-[12px] font-bold leading-tight text-foreground">
								{m.label}
							</span>

							{m.status && (
								<span
									className={`absolute right-2.5 top-2.5 rounded px-1 py-px text-[8px] font-black text-white ${m.status === "soon" ? "bg-red-500" : "bg-green-500"}`}
								>
									{m.status === "soon" ? "SOON" : "NEW"}
								</span>
							)}
						</button>
					);

					return m.href ? (
						<Link key={m.id} href={m.href} className="no-underline">{inner}</Link>
					) : (
						<div key={m.id}>{inner}</div>
					);
				})}
			</div>

			<div className="mt-2 h-px bg-divider" />

			{/* Toast */}
			{toast && (
				<div
					className="fixed inset-0 z-[13000] flex items-center justify-center bg-foreground/6 p-2"
					onClick={() => setToast(null)}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="relative flex min-w-[220px] max-w-[min(420px,calc(100vw-32px))] items-center gap-1 overflow-hidden rounded-xl border border-primary/28 bg-surface px-2 py-[5px] shadow-[0_14px_34px_rgba(15,23,42,0.14)] animate-in fade-in zoom-in-95"
					>
						<div className="absolute bottom-0 left-0 top-0 w-1.5 bg-primary" />
						<p className="flex-1 text-[13px] font-extrabold leading-tight text-foreground">
							{toast}
						</p>
						<button
							onClick={() => setToast(null)}
							className="shrink-0 rounded-lg p-1 text-foreground/70 transition-colors hover:bg-primary/10"
						>
							<X size={16} />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
