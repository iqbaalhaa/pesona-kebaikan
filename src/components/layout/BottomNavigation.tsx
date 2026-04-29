"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, Receipt, Megaphone, User } from "lucide-react";

const menus = [
	{ label: "Home", path: "/", icon: Home },
	{ label: "Blog", path: "/blog", icon: FileText },
	{ label: "Donasi Saya", path: "/donasi-saya", icon: Receipt },
	{ label: "Galang Dana", path: "/galang-dana", icon: Megaphone },
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
			<nav className="flex h-[72px] items-center justify-around px-2">
				{menus.map((menu) => {
					const active = isActive(pathname, menu.path);
					const Icon = menu.icon;
					return (
						<button
							key={menu.path}
							onClick={() => router.push(menu.path)}
							className={[
								"flex cursor-pointer flex-col items-center gap-0.5 rounded-full px-2 py-1.5 transition-all duration-150",
								active
									? "text-primary"
									: "text-foreground/60 hover:bg-foreground/4",
							].join(" ")}
						>
							<Icon
								size={24}
								className={`transition-transform duration-150 ${active ? "scale-105 drop-shadow-[0_10px_18px_var(--color-primary-shadow)]" : ""}`}
							/>
							<span
								className={`text-[10px] ${active ? "font-bold text-primary" : ""}`}
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
