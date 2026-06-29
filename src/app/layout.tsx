import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ThemeWrapper from "@/components/layout/ThemeWrapper";
import { auth } from "@/auth";
import NextAuthProvider from "@/components/providers/NextAuthProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500", "600", "700", "800"],
	variable: "--font-plus-jakarta-sans",
});

const siteName = "Pesona Kebaikan";
const siteUrl =
	process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.com";
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
		locale: "id_ID",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: `${siteName} – Platform Donasi dan Galang Dana`,
		description: siteDescription,
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
			<body className={`${plusJakartaSans.className} antialiased`} suppressHydrationWarning>
				<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:outline-none">
					Langsung ke konten utama
				</a>
				<NextAuthProvider session={session}>
					<AppRouterCacheProvider options={{ enableCssLayer: true }}>
						<ThemeWrapper>
							<div className="min-h-dvh bg-[#F1F5F9]">
								<AppShell>{children}</AppShell>
							</div>
						</ThemeWrapper>
					</AppRouterCacheProvider>
				</NextAuthProvider>
			</body>
		</html>
	);
}
