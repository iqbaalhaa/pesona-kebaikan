"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";

export function CopyLinkButton({ url }: { url: string }) {
	const [copied, setCopied] = React.useState(false);

	const onClick = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			setCopied(false);
		}
	};

	return (
		<button
			onClick={onClick}
			aria-label={copied ? "Link disalin" : "Salin link"}
			className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-foreground/12 transition-colors hover:bg-foreground/5"
			style={{ color: copied ? "#0ba976" : "rgba(15,23,42,.7)" }}
		>
			{copied ? <Check size={18} /> : <Copy size={18} />}
		</button>
	);
}
