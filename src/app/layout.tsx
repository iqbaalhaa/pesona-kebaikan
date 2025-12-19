import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ThemeWrapper from "@/components/layout/ThemeWrapper";

const pjs = Plus_Jakarta_Sans({
	variable: "--font-pjs",
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
	title: "Pesona Kebaikan",
	description: "Created by Depati Digital",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="id" suppressHydrationWarning>
			<body className={`${pjs.variable} antialiased`} suppressHydrationWarning>
				<AppRouterCacheProvider options={{ enableCssLayer: true }}>
					<ThemeWrapper>
						{/* Background luar handled by Global CSS / Body now, but we keep wrapper for layout centering if needed */}
						<div className="flex min-h-dvh items-center justify-center bg-gray-100 dark:bg-[#0b1220] px-0 sm:px-3 py-0 sm:py-[3px] transition-colors duration-300">
							{/* Semua logika header overlay + scroll + bottomnav ada di AppShell */}
							<AppShell>{children}</AppShell>
						</div>
					</ThemeWrapper>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
