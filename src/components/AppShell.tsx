"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import SimpleAppBar from "@/components/AppBar";
import SimpleBottomNavigation from "@/components/BottomNavigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isHome = pathname === "/";

	const scrollRef = React.useRef<HTMLDivElement | null>(null);
	const [scrolled, setScrolled] = React.useState(false);

	React.useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		const onScroll = () => {
			setScrolled(el.scrollTop > 28);
		};

		onScroll();
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, []);

	const appBarVariant = isHome ? (scrolled ? "solid" : "overlay") : "solid";

	return (
		<div className="relative w-full max-w-md h-screen max-h-screen rounded-2xl shadow-2xl overflow-hidden flex flex-col">
			<SimpleAppBar variant={appBarVariant} />

			<div
				ref={scrollRef}
				className={[
					"flex-1 overflow-y-auto no-scrollbar",
					"bg-white",
					"pb-24",
					isHome ? "pt-0" : "pt-2",
				].join(" ")}
			>
				{children}
			</div>

			<SimpleBottomNavigation />
		</div>
	);
}
