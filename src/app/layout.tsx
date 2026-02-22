import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ThemeWrapper from "@/components/layout/ThemeWrapper";
import { auth } from "@/auth";
import NextAuthProvider from "@/components/providers/NextAuthProvider";

const siteName = "Pesona Kebaikan";
const siteUrl =
	process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.id";
const siteDescription =
	"Pesona Kebaikan adalah platform donasi dan galang dana online untuk membantu sesama dengan transparan dan terpercaya.";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: `${siteName} – Platform Donasi dan Galang Dana`,
		template: `%s | ${siteName}`,
	},
	description: siteDescription,
	keywords: [
		"donasi online",
		"galang dana",
		"sedekah",
		"zakat",
		"wakaf",
		"amal",
		"pesona kebaikan",
	],
	openGraph: {
		title: `${siteName} – Platform Donasi dan Galang Dana`,
		description: siteDescription,
		url: "/",
		siteName,
		images: [
			{
				url: "/defaultimg.webp",
				width: 1200,
				height: 630,
				alt: siteName,
			},
		],
		locale: "id_ID",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: `${siteName} – Platform Donasi dan Galang Dana`,
		description: siteDescription,
		images: ["/defaultimg.webp"],
	},
	robots: {
		index: true,
		follow: true,
	},
	alternates: {
		canonical: "/",
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	return (
		<html lang="id" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
				/>
			</head>
			<body className="antialiased" suppressHydrationWarning>
				<NextAuthProvider session={session}>
					<AppRouterCacheProvider options={{ enableCssLayer: true }}>
						<ThemeWrapper>
							<div className="min-h-dvh bg-[#F1F5F9] dark:bg-[#0b1220] px-0 sm:px-3 py-0 sm:py-[3px] transition-colors duration-300">
								<AppShell>{children}</AppShell>
							</div>
						</ThemeWrapper>
					</AppRouterCacheProvider>
				</NextAuthProvider>
			</body>
		</html>
	);
}
