"use client";

import Link from "next/link";
import {
	InstagramIcon,
	YoutubeIcon,
} from "@/components/ui/SocialIcons";

function TikTokIcon({ size = 20 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
			<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
		</svg>
	);
}

function ThreadsIcon({ size = 20 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
			<path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.287 3.263-.809 .993-1.927 1.558-3.322 1.682-1.04.092-2.09-.094-2.958-.525-1.058-.527-1.746-1.378-1.935-2.396-.307-1.647.525-3.095 2.285-3.977.996-.499 2.262-.755 3.905-.797l.294-.003c.045 0 .09 0 .135.002-.233-1.157-.838-1.764-1.942-1.922-.813-.116-1.653.091-2.274.42l-.86-1.734c.856-.457 2.044-.772 3.218-.716 1.694.081 3.014.726 3.823 1.87.733 1.035 1.058 2.404 1.012 4.163.547.312 1.037.697 1.45 1.147.977 1.066 1.397 2.46 1.212 4.023-.218 1.853-1.186 3.445-2.797 4.6C17.574 23.297 15.168 23.98 12.186 24zm2.14-9.95c-1.36.027-2.387.222-3.08.582-.958.498-1.199 1.198-1.108 1.684.127.673.864 1.192 1.782 1.192.09 0 .181-.005.274-.014.948-.084 1.715-.46 2.28-1.118.443-.515.777-1.27.94-2.268-.363-.04-.727-.058-1.088-.058z" />
		</svg>
	);
}

const SOCIALS = [
	{ icon: InstagramIcon, href: "https://www.instagram.com/pesonakebaikan/", label: "Instagram" },
	{ icon: TikTokIcon, href: "https://www.tiktok.com/@pesonakebaikan", label: "TikTok" },
	{ icon: ThreadsIcon, href: "https://www.threads.com/@pesonakebaikan", label: "Threads" },
	{ icon: YoutubeIcon, href: "https://www.youtube.com/@yayasanpesonakebaikanindonesia", label: "YouTube" },
];

const LINKS = [
	{ label: "Tentang Pesona Kebaikan", href: "/profil/tentang" },
	{ label: "Syarat & Ketentuan", href: "/profil/syarat-ketentuan" },
	{ label: "Pusat Bantuan", href: "/profil/bantuan" },
];

export default function MiniFooter() {
	return (
		<footer className="mt-auto border-t border-foreground/6 bg-white px-4 py-6">
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
							aria-label={`Ikuti kami di ${social.label}`}
							className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-slate-200 hover:text-slate-900"
						>
							<social.icon size={20} aria-hidden="true" />
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
