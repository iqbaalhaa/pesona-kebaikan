"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Props = {
	title: string;
	container?: boolean;
	maxWidth?: "sm" | "md" | "lg" | "xl" | false;
};

const maxWidthMap = {
	sm: "max-w-sm",
	md: "max-w-2xl",
	lg: "max-w-4xl",
	xl: "max-w-6xl",
};

export default function ProfileHeader({
	title,
	container = false,
	maxWidth = "md",
}: Props) {
	const router = useRouter();
	const content = (
		<div className="flex items-center gap-1">
			<button
				onClick={() => router.back()}
				className="grid h-9 w-9 place-items-center rounded-lg text-foreground transition-colors hover:bg-foreground/5"
			>
				<ArrowLeft size={20} />
			</button>
			<h2 className="text-xl font-black text-foreground">{title}</h2>
		</div>
	);

	if (container) {
		return (
			<div
				className={`mx-auto px-2 pb-2 pt-2.5 ${maxWidth ? maxWidthMap[maxWidth] : ""}`}
			>
				{content}
			</div>
		);
	}
	return <div className="mb-3">{content}</div>;
}
