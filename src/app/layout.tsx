import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import AppShell from "@/components/AppShell";

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
			<body className={`${pjs.variable} antialiased`}>
				<AppRouterCacheProvider options={{ enableCssLayer: true }}>
					{/* Background luar */}
					<div className="flex min-h-dvh items-center justify-center bg-gray-100 px-3 py-4">
						{/* Semua logika header overlay + scroll + bottomnav ada di AppShell */}
						<AppShell>{children}</AppShell>
					</div>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
