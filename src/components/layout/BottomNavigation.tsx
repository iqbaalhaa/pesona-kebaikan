"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, Receipt, Megaphone, User } from "lucide-react";

const menus = [
	{ label: "Home", path: "/", icon: Home },
	{ label: "Blog", path: "/blog", icon: FileText },
	{ label: "Galang Dana", path: "/galang-dana", icon: Megaphone, center: true },
	{ label: "Donasi Saya", path: "/donasi-saya", icon: Receipt },
	{ label: "Profil", path: "/profil", icon: User },
];

function isActive(pathname: string, path: string) {
	if (path === "/") return pathname === "/";
	return pathname === path || pathname.startsWith(path + "/");
}

export default function SimpleBottomNavigation() {
	const router = useRouter();
	const pathname = usePathname();
	const ref = React.useRef<HTMLDivElement | null>(null);

	React.useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;

		const setVar = () => {
			const h = el.getBoundingClientRect().height || 64;
			document.documentElement.style.setProperty(
				"--bottom-nav-h",
				`${Math.ceil(h)}px`,
			);
		};

		setVar();
		const ro = new ResizeObserver(() => setVar());
		ro.observe(el);
		window.addEventListener("resize", setVar);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", setVar);
		};
	}, []);

	return (
		<div
			ref={ref}
			className="fixed bottom-0 left-1/2 z-[1100] w-full max-w-[480px] -translate-x-1/2 overflow-hidden bg-white pb-[env(safe-area-inset-bottom)]"
		>
			<nav aria-label="Navigasi utama" className="mx-auto flex max-w-[480px] items-end justify-around px-2 py-3">
				{menus.map((menu) => {
					const active = isActive(pathname, menu.path);
					const Icon = menu.icon;

					// Center action: render as an elevated green circular FAB.
					if (menu.center) {
						return (
							<button
								key={menu.path}
								aria-label={menu.label}
								aria-current={active ? "page" : undefined}
								onClick={() => router.push(menu.path)}
								className="flex flex-1 cursor-pointer flex-col items-center gap-1.5"
							>
								<span className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-[0_8px_20px_var(--color-primary-shadow)] ring-4 ring-white transition-transform duration-150 active:scale-95">
									<Icon size={26} />
								</span>
								<span
									className={`whitespace-nowrap text-[11px] leading-none ${active ? "font-bold text-primary" : "text-foreground/60"}`}
								>
									{menu.label}
								</span>
							</button>
						);
					}

					return (
						<button
							key={menu.path}
							aria-label={menu.label}
							aria-current={active ? "page" : undefined}
							onClick={() => router.push(menu.path)}
							className={[
								"flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-full px-2 py-1.5 transition-all duration-150",
								active
									? "text-primary"
									: "text-foreground/60 hover:bg-foreground/4",
							].join(" ")}
						>
							<Icon
								size={28}
								className={`transition-transform duration-150 ${active ? "scale-105 drop-shadow-[0_10px_18px_var(--color-primary-shadow)]" : ""}`}
							/>
							<span
								className={`whitespace-nowrap text-[11px] leading-none ${active ? "font-bold text-primary" : ""}`}
							>
								{menu.label}
							</span>
						</button>
					);
				})}
			</nav>
		</div>
	);
}
