"use client";

import { ChevronRight } from "lucide-react";

export default function ProfileMenu({
	icon,
	label,
	onClick,
	danger = false,
}: {
	icon: React.ReactNode;
	label: string;
	onClick?: () => void;
	danger?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className={[
				"mb-0.5 flex w-full cursor-pointer items-center rounded-lg px-2 py-2.5 text-left transition-colors",
				danger ? "hover:bg-red-500/8" : "hover:bg-foreground/4",
			].join(" ")}
		>
			<span
				className={`mr-2.5 shrink-0 ${danger ? "text-red-500" : "text-foreground/60"}`}
			>
				{icon}
			</span>
			<span
				className={`flex-1 text-sm font-semibold ${danger ? "text-red-500" : "text-foreground"}`}
			>
				{label}
			</span>
			<ChevronRight size={20} className="text-foreground/30" />
		</button>
	);
}
