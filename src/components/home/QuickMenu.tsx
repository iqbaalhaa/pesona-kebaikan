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
		<div className="relative z-2 mt-2 px-2">
			<h2 className="mb-1.5 text-base font-extrabold text-foreground">
				Mau berbuat baik apa hari ini?
			</h2>

			<div className="grid grid-cols-4 gap-[5px]">
				{MENUS.map((m) => {
					const Icon = m.icon;
					const inner = (
						<button
							onClick={() => handleActivate(m)}
							className="relative block w-full cursor-pointer rounded-lg py-1 text-center transition-transform active:scale-[0.98]"
						>
							<div className="mx-auto grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-full border border-primary/12 bg-primary/8 shadow-[0_4px_12px_rgba(11,169,118,0.08)]">
								<Icon size={34} className="text-primary" />
							</div>

							{m.status && (
								<span
									className={`absolute right-2.5 top-1 z-2 rounded px-[2px] py-px text-[0.5rem] font-black text-white shadow ${m.status === "soon" ? "bg-red-500" : "bg-green-500"}`}
								>
									{m.status === "soon" ? "SOON" : "NEW"}
								</span>
							)}

							<p className="mt-[3px] line-clamp-2 px-0.5 text-[11px] font-bold leading-tight text-foreground">
								{m.label}
							</p>
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
