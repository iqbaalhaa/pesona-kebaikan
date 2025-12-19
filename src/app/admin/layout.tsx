import Link from "next/link";
import Image from "next/image";
// import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import ThemeWrapper from "@/components/layout/ThemeWrapper";
import { Avatar } from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArticleIcon from "@mui/icons-material/Article";
import PeopleIcon from "@mui/icons-material/People";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddTask from "@mui/icons-material/AddTask";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";

export const metadata = {
	title: "Admin - Pesona Kebaikan",
};

type MenuItem = {
	label: string;
	href: string;
	icon: React.ReactNode;
	desc?: string;
};

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// const session = await auth();

	// if (!session?.user) {
	// 	redirect("/auth/login");
	// }

	const menus: { title: string; items: MenuItem[] }[] = [
		{
			title: "Overview",
			items: [
				{
					label: "Dashboard",
					href: "/admin",
					icon: <DashboardIcon fontSize="small" />,
					desc: "Ringkasan data & status",
				},
			],
		},
		{
			title: "Galang Dana",
			items: [
				{
					label: "Campaign",
					href: "/admin/campaign",
					icon: <CampaignIcon fontSize="small" />,
					desc: "Kelola campaign/penggalangan",
				},
				{
					label: "Verifikasi Campaign",
					href: "/admin/campaign/verifikasi",
					icon: <VerifiedRoundedIcon fontSize="small" />,
					desc: "Review dokumen & approval",
				},
				{
					label: "Kategori Campaign",
					href: "/admin/campaign/kategori",
					icon: <CategoryRoundedIcon fontSize="small" />,
					desc: "Struktur kategori (lainnya)",
				},
			],
		},
		{
			title: "Donasi & Keuangan",
			items: [
				{
					label: "Transaksi Donasi",
					href: "/admin/donasi",
					icon: <ReceiptLongIcon fontSize="small" />,
					desc: "List transaksi & status",
				},
				{
					label: "Pencairan Dana",
					href: "/admin/pencairan",
					icon: <AccountBalanceWalletRoundedIcon fontSize="small" />,
					desc: "Request & penyaluran",
				},
			],
		},
		{
			title: "Konten",
			items: [
				{
					label: "Blog",
					href: "/admin/blog",
					icon: <ArticleIcon fontSize="small" />,
					desc: "Artikel & edukasi",
				},
			],
		},
		{
			title: "Pengguna",
			items: [
				{
					label: "Users",
					href: "/admin/users",
					icon: <PeopleIcon fontSize="small" />,
					desc: "Akun, role, status",
				},
			],
		},
		{
			title: "System",
			items: [
				{
					label: "Settings",
					href: "/admin/settings",
					icon: <SettingsOutlinedIcon fontSize="small" />,
					desc: "Konfigurasi platform",
				},
			],
		},
	];

	return (
		<AppRouterCacheProvider options={{ enableCssLayer: true }}>
			<ThemeWrapper>
				<div
					className="min-h-[100lvh] w-full bg-[#F6F8FC] dark:bg-[#0b1220] transition-colors duration-300"
					style={
						{
							["--brand" as any]: "#61ce70",
							["--radius" as any]: "16px",
						} as React.CSSProperties
					}
				>
					<div className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-6">
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
							{/* Sidebar */}
							<aside
								className="
									h-fit overflow-hidden
									rounded-[var(--radius)]
									border border-slate-200/70 dark:border-slate-800/70
									bg-white/90 dark:bg-[#0f172a]/80
									backdrop-blur
									shadow-[0_10px_28px_rgba(15,23,42,0.06)]
								"
							>
								{/* Brand */}
								<div className="flex items-center gap-3 px-4 py-4">
									<div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50 dark:border-slate-800/70 dark:bg-[#0b1324]">
										<Image
											src="/brand/logo.png"
											alt="Pesona Kebaikan"
											fill
											className="object-contain p-1.5"
											sizes="40px"
										/>
									</div>

									<div className="min-w-0">
										<div className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
											Pesona Kebaikan
										</div>
										<div className="text-xs text-slate-500 dark:text-slate-400">
											Admin Panel (Role: Admin)
										</div>
									</div>
								</div>

								<div className="px-4 pb-4">
									<div className="mb-4 h-px bg-slate-200/70 dark:bg-slate-800/70" />

									{menus.map((section) => (
										<div key={section.title} className="mb-5 last:mb-0">
											<div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
												{section.title}
											</div>

											<nav className="mt-2 space-y-1">
												{section.items.map((m) => (
													<Link
														key={m.href}
														href={m.href}
														className="
															group flex items-start gap-3
															rounded-xl px-3 py-2.5
															text-slate-800 dark:text-slate-100
															hover:bg-slate-50 dark:hover:bg-[#0b1324]
															transition-colors
														"
													>
														<span
															className="
																inline-flex h-9 w-9 flex-shrink-0 items-center justify-center
																rounded-xl border border-slate-200/70 dark:border-slate-800/70
																bg-white dark:bg-[#0f172a]
																group-hover:bg-slate-50 dark:group-hover:bg-[#0b1324]
																transition-colors
															"
															style={{
																boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
															}}
														>
															{m.icon}
														</span>

														<span className="min-w-0 flex-1">
															<span className="block text-sm font-extrabold leading-tight">
																{m.label}
															</span>
															{m.desc ? (
																<span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
																	{m.desc}
																</span>
															) : null}
														</span>

														<span
															className="
																mt-1.5 h-2 w-2 flex-shrink-0 rounded-full opacity-0
																group-hover:opacity-100 transition-opacity
															"
															style={{ background: "var(--brand)" }}
														/>
													</Link>
												))}
											</nav>
										</div>
									))}

									{/* Quick action - sesuai alur admin */}
									<div
										className="
											mt-4 rounded-xl
											border border-slate-200/70 dark:border-slate-800/70
											bg-gradient-to-b from-white to-slate-50
											dark:from-[#0f172a] dark:to-[#0b1324]
											p-3
										"
									>
										<div className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
											Quick Actions
										</div>

										<div className="mt-2 grid grid-cols-1 gap-2">
											<Link
												href="/admin/campaign/create"
												className="
													flex items-center justify-between
													rounded-xl px-3 py-2.5
													border border-slate-200/70 dark:border-slate-800/70
													bg-white dark:bg-[#0f172a]
													hover:bg-slate-50 dark:hover:bg-[#0b1324]
													transition-colors
												"
											>
												<span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-800 dark:text-slate-100">
													<AddTask fontSize="small" />
													Buat Campaign
												</span>
												<span
													className="h-2 w-2 rounded-full"
													style={{ background: "var(--brand)" }}
												/>
											</Link>

											<Link
												href="/admin/campaign/verifikasi"
												className="
													flex items-center justify-between
													rounded-xl px-3 py-2.5
													border border-slate-200/70 dark:border-slate-800/70
													bg-white dark:bg-[#0f172a]
													hover:bg-slate-50 dark:hover:bg-[#0b1324]
													transition-colors
												"
											>
												<span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
													Review Verifikasi
												</span>
												<span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
													(placeholder)
												</span>
											</Link>
										</div>
									</div>
								</div>
							</aside>

							{/* Main */}
							<div className="space-y-4">
								{/* Topbar */}
								<div className="sticky top-0 z-20">
									<div
										className="
											rounded-[var(--radius)]
											border border-slate-200/70 dark:border-slate-800/70
											bg-white/85 dark:bg-[#0f172a]/75
											backdrop-blur
											shadow-[0_10px_28px_rgba(15,23,42,0.06)]
											p-3
										"
									>
										<div className="flex items-center gap-3">
											{/* Search */}
											<div
												className="
													flex-1 flex items-center gap-2
													rounded-xl
													bg-slate-50 dark:bg-[#0b1324]
													border border-slate-200/70 dark:border-slate-800/70
													px-3 py-2
												"
											>
												<SearchIcon
													fontSize="small"
													className="text-slate-500 dark:text-slate-400"
												/>
												<input
													placeholder="Cari campaign, user, transaksi..."
													className="
														w-full bg-transparent text-sm outline-none
														text-slate-800 dark:text-slate-100
														placeholder:text-slate-500 dark:placeholder:text-slate-400
													"
												/>
											</div>

											<button
												className="
													h-10 w-10 inline-flex items-center justify-center
													rounded-xl
													border border-slate-200/70 dark:border-slate-800/70
													bg-white/70 dark:bg-[#0f172a]/60
													hover:bg-slate-50 dark:hover:bg-[#0b1324]
													transition-colors
												"
											>
												<NotificationsNoneIcon
													fontSize="small"
													className="text-slate-700 dark:text-slate-300"
												/>
											</button>

											<button
												className="
													h-10 w-10 inline-flex items-center justify-center
													rounded-xl
													border border-slate-200/70 dark:border-slate-800/70
													bg-white/70 dark:bg-[#0f172a]/60
													hover:bg-slate-50 dark:hover:bg-[#0b1324]
													transition-colors
												"
											>
												<SettingsOutlinedIcon
													fontSize="small"
													className="text-slate-700 dark:text-slate-300"
												/>
											</button>

											<div className="flex items-center gap-2">
												<Avatar sx={{ width: 34, height: 34 }} />
											</div>
										</div>
									</div>
								</div>

								{/* Content */}
								<main
									className="
										rounded-[var(--radius)]
										border border-slate-200/70 dark:border-slate-800/70
										bg-white dark:bg-[#0f172a]
										shadow-[0_10px_28px_rgba(15,23,42,0.06)]
										p-5 md:p-6
									"
								>
									{children}
								</main>
							</div>
						</div>
					</div>
				</div>
			</ThemeWrapper>
		</AppRouterCacheProvider>
	);
}
