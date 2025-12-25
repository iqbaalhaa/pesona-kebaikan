"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArticleIcon from "@mui/icons-material/Article";
import PeopleIcon from "@mui/icons-material/People";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AddTask from "@mui/icons-material/AddTask";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import NotificationsIcon from "@mui/icons-material/Notifications";

type MenuItem = {
	label: string;
	href: string;
	icon: React.ReactNode;
	desc?: string;
};

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
				href: "/admin/transaksi",
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
			{
				label: "Notifikasi",
				href: "/admin/notifikasi",
				icon: <NotificationsIcon fontSize="small" />,
				desc: "Broadcast & pesan",
			},
			{
				label: "Pusat Pengaduan",
				href: "/admin/pengaduan",
				icon: <AddTask fontSize="small" />,
				desc: "Laporkan masalah",
			},
		],
	},
	{
		title: "Informasi",
		items: [
			{
				label: "Pusat Bantuan",
				href: "/admin/bantuan",
				icon: <HelpOutlineIcon fontSize="small" />,
				desc: "FAQ & panduan",
			},
			{
				label: "Tentang Platform",
				href: "/admin/tentang",
				icon: <InfoOutlinedIcon fontSize="small" />,
				desc: "Profil & visi misi",
			},
			{
				label: "Syarat & Ketentuan",
				href: "/admin/syarat-ketentuan",
				icon: <DescriptionIcon fontSize="small" />,
				desc: "Aturan & kebijakan",
			},
			{
				label: "Akuntabilitas",
				href: "/admin/akuntabilitas",
				icon: <VerifiedUserIcon fontSize="small" />,
				desc: "Laporan transparansi",
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

export default function AdminSidebar({
	mobileOpen,
	onClose,
}: {
	mobileOpen: boolean;
	onClose: () => void;
}) {
	const pathname = usePathname();

	const SidebarContent = (
		<div className="h-full flex flex-col">
			{/* Brand */}
			<div className="flex items-center gap-3 px-6 py-6">
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
						Admin Panel
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-4 pb-4">
				<div className="mb-4 h-px bg-slate-200/70 dark:bg-slate-800/70" />

				{menus.map((section) => (
					<div key={section.title} className="mb-5 last:mb-0">
						<div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							{section.title}
						</div>

						<nav className="mt-2 space-y-1">
							{section.items.map((m) => {
								const isActive = pathname === m.href;
								return (
									<Link
										key={m.href}
										href={m.href}
										className={`
                      group flex items-start gap-3
                      rounded-xl px-3 py-2.5
                      transition-colors
                      ${
												isActive
													? "bg-slate-100 dark:bg-[#1e293b] text-slate-900 dark:text-slate-50"
													: "text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#0b1324]"
											}
                    `}
									>
										<span
											className={`
                        inline-flex h-9 w-9 flex-shrink-0 items-center justify-center
                        rounded-xl border border-slate-200/70 dark:border-slate-800/70
                        transition-colors
                        ${
													isActive
														? "bg-white dark:bg-[#0f172a] shadow-sm"
														: "bg-white dark:bg-[#0f172a] group-hover:bg-slate-50 dark:group-hover:bg-[#0b1324]"
												}
                      `}
											style={{
												boxShadow: isActive
													? "0 4px 12px rgba(0,0,0,0.05)"
													: "0 8px 20px rgba(15,23,42,0.05)",
											}}
										>
											{React.cloneElement(m.icon as any, {
												className: isActive
													? "text-green-600 dark:text-green-400"
													: "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300",
											})}
										</span>

										<span className="min-w-0 flex-1">
											<span
												className={`block text-sm font-extrabold leading-tight ${
													isActive
														? "text-slate-900 dark:text-white"
														: "text-slate-700 dark:text-slate-200"
												}`}
											>
												{m.label}
											</span>
											{m.desc ? (
												<span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
													{m.desc}
												</span>
											) : null}
										</span>

										{isActive && (
											<span
												className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
												style={{ background: "#61ce70" }}
											/>
										)}
									</Link>
								);
							})}
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
								style={{ background: "#61ce70" }}
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
						</Link>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<>
			{/* Desktop Sidebar */}
			<aside
				className="
          hidden lg:block
          h-[calc(100vh-48px)] overflow-hidden sticky top-6
          rounded-[16px]
          border border-slate-200/70 dark:border-slate-800/70
          bg-white/90 dark:bg-[#0f172a]/80
          backdrop-blur
          shadow-[0_10px_28px_rgba(15,23,42,0.06)]
        "
			>
				{SidebarContent}
			</aside>

			{/* Mobile Drawer */}
			<Drawer
				variant="temporary"
				open={mobileOpen}
				onClose={onClose}
				ModalProps={{
					keepMounted: true, // Better open performance on mobile.
				}}
				sx={{
					display: { xs: "block", lg: "none" },
					"& .MuiDrawer-paper": {
						boxSizing: "border-box",
						width: 300,
						border: "none",
						bgcolor: "background.paper",
					},
				}}
			>
				{SidebarContent}
			</Drawer>
		</>
	);
}
