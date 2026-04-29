"use client";

import Link from "next/link";
import {
	FacebookIcon,
	TwitterIcon,
	InstagramIcon,
	YoutubeIcon,
	LinkedinIcon,
} from "@/components/ui/SocialIcons";

function TikTokIcon({ size = 20 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
			<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
		</svg>
	);
}

const SOCIALS = [
	{ icon: FacebookIcon, href: "#" },
	{ icon: TwitterIcon, href: "#" },
	{ icon: InstagramIcon, href: "#" },
	{ icon: YoutubeIcon, href: "#" },
	{ icon: TikTokIcon, href: "#" },
	{ icon: LinkedinIcon, href: "#" },
];

const LINKS = [
	{ label: "Tentang Pesona Kebaikan", href: "/profil/tentang" },
	{ label: "Syarat & Ketentuan", href: "/profil/syarat-ketentuan" },
	{ label: "Pusat Bantuan", href: "/profil/bantuan" },
];

export default function MiniFooter() {
	return (
		<footer className="mt-auto border-t border-foreground/6 bg-white px-2 py-6">
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-wrap items-center justify-center gap-0.5">
					{LINKS.map((link, i) => (
						<span key={link.href} className="flex items-center">
							<Link
								href={link.href}
								className="text-sm text-slate-500 transition-colors hover:text-primary"
							>
								{link.label}
							</Link>
							{i < LINKS.length - 1 && (
								<span className="mx-1.5 text-sm text-slate-300">|</span>
							)}
						</span>
					))}
				</div>

				<div className="flex flex-wrap items-center justify-center gap-2">
					{SOCIALS.map((social, i) => (
						<a
							key={i}
							href={social.href}
							className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-slate-200 hover:text-slate-900"
						>
							<social.icon size={20} />
						</a>
					))}
				</div>

				<p className="text-center text-[13px] text-slate-400">
					Copyright © {new Date().getFullYear()} Pesona Kebaikan. All Rights Reserved
				</p>
			</div>
		</footer>
	);
}
