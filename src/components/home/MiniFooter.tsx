"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

// Custom TikTok Icon since it might not be available in all MUI versions
function TikTokIcon(props: any) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			fill="currentColor"
			{...props}
		>
			<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
		</svg>
	);
}

const SOCIALS = [
	{ icon: FacebookIcon, href: "#" },
	{ icon: TwitterIcon, href: "#" },
	{ icon: InstagramIcon, href: "#" },
	{ icon: YouTubeIcon, href: "#" },
	{ icon: TikTokIcon, href: "#" },
	{ icon: LinkedInIcon, href: "#" },
];

function FooterLink({
	label,
	href,
	isLast = false,
}: {
	label: string;
	href: string;
	isLast?: boolean;
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "center" }}>
			<Link href={href} style={{ textDecoration: "none" }}>
				<Typography
					sx={{
						fontSize: 14,
						color: "#64748b",
						transition: "color 0.2s",
						"&:hover": { color: "#0ba976" },
						cursor: "pointer",
					}}
				>
					{label}
				</Typography>
			</Link>
			{!isLast && (
				<Typography sx={{ mx: 1.5, color: "#cbd5e1", fontSize: 14 }}>
					|
				</Typography>
			)}
		</Box>
	);
}

export default function MiniFooter() {
	return (
		<Box
			component="footer"
			sx={{
				mt: "auto",
				py: 6,
				px: 2,
				bgcolor: "#fff",
				borderTop: "1px solid rgba(15,23,42,0.06)",
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 4,
				}}
			>
				{/* Top Row: Links */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexWrap: "wrap",
						gap: 0.5,
					}}
				>
					<FooterLink label="Tentang Pesona Kebaikan" href="/profil/tentang" />
					<FooterLink
						label="Syarat & Ketentuan"
						href="/profil/syarat-ketentuan"
					/>
					<FooterLink label="Pusat Bantuan" href="/profil/bantuan" isLast />
				</Box>

				{/* Middle Row: Social Icons */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 2,
						flexWrap: "wrap",
					}}
				>
					{SOCIALS.map((social, index) => (
						<Box
							key={index}
							component="a"
							href={social.href}
							sx={{
								width: 40,
								height: 40,
								borderRadius: "50%",
								bgcolor: "#f1f5f9",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#475569",
								transition: "all 0.2s ease",
								cursor: "pointer",
								"&:hover": {
									bgcolor: "#e2e8f0",
									color: "#1e293b",
									transform: "translateY(-2px)",
								},
							}}
						>
							<social.icon sx={{ fontSize: 20 }} />
						</Box>
					))}
				</Box>

				{/* Bottom Row: Copyright */}
				<Typography
					sx={{
						fontSize: 13,
						color: "#94a3b8",
						textAlign: "center",
					}}
				>
					Copyright © {new Date().getFullYear()} Pesona Kebaikan. All Rights
					Reserved
				</Typography>
			</Box>
		</Box>
	);
}
