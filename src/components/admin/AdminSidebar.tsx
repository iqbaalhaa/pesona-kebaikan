"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Drawer from "@mui/material/Drawer";

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
import VrpanoIcon from "@mui/icons-material/Vrpano";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";

type MenuItem = {
	label: string;
	href: string;
	icon: React.ReactElement;
};

const menus: { title: string; items: MenuItem[] }[] = [
	{
		title: "Overview",
		items: [
			{ label: "Dashboard", href: "/admin", icon: <DashboardIcon fontSize="small" /> },
			{ label: "Carousel", href: "/admin/carousel", icon: <VrpanoIcon fontSize="small" /> },
			{ label: "Banner", href: "/admin/banner", icon: <ViewCarouselIcon fontSize="small" /> },
			{ label: "Campaign Pilihan", href: "/admin/campaign-pilihan", icon: <StarOutlineIcon fontSize="small" /> },
		],
	},
	{
		title: "Galang Dana",
		items: [
			{ label: "Campaign", href: "/admin/campaign", icon: <CampaignIcon fontSize="small" /> },
			{ label: "Verifikasi Campaign", href: "/admin/campaign/verifikasi", icon: <VerifiedRoundedIcon fontSize="small" /> },
			{ label: "Kategori Campaign", href: "/admin/campaign/kategori", icon: <CategoryRoundedIcon fontSize="small" /> },
			{ label: "Pengajuan Campaign", href: "/admin/pengajuan-campaign", icon: <TrendingUpRoundedIcon fontSize="small" /> },
		],
	},
	{
		title: "Donasi & Keuangan",
		items: [
			{ label: "Transaksi Donasi", href: "/admin/transaksi", icon: <ReceiptLongIcon fontSize="small" /> },
			{ label: "Pencairan Dana", href: "/admin/pencairan", icon: <AccountBalanceWalletRoundedIcon fontSize="small" /> },
		],
	},
	{
		title: "Konten",
		items: [
			{ label: "Blog", href: "/admin/blog", icon: <ArticleIcon fontSize="small" /> },
		],
	},
	{
		title: "User",
		items: [
			{ label: "Users", href: "/admin/users", icon: <PeopleIcon fontSize="small" /> },
			{ label: "Informasi Users", href: "/admin/infousers", icon: <PersonPinIcon fontSize="small" /> },
			{ label: "Notifikasi", href: "/admin/notifikasi", icon: <NotificationsIcon fontSize="small" /> },
			{ label: "Pusat Pengaduan", href: "/admin/pengaduan", icon: <AddTask fontSize="small" /> },
		],
	},
	{
		title: "Informasi",
		items: [
			{ label: "Pusat Bantuan", href: "/admin/bantuan", icon: <HelpOutlineIcon fontSize="small" /> },
			{ label: "Tentang Platform", href: "/admin/tentang", icon: <InfoOutlinedIcon fontSize="small" /> },
			{ label: "Syarat & Ketentuan", href: "/admin/syarat-ketentuan", icon: <DescriptionIcon fontSize="small" /> },
			{ label: "Akuntabilitas", href: "/admin/akuntabilitas", icon: <VerifiedUserIcon fontSize="small" /> },
			{ label: "Panduan Galang Dana", href: "/admin/panduan-galang-dana", icon: <HelpOutlineIcon fontSize="small" /> },
		],
	},
	{
		title: "System",
		items: [
			{ label: "Pengaturan", href: "/admin/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
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

	const [reviewCount, setReviewCount] = React.useState<number | null>(null);
	const [activeCampaignCount, setActiveCampaignCount] = React.useState<
		number | null
	>(null);

	React.useEffect(() => {
		let active = true;
		(async () => {
			try {
				const res = await fetch("/api/admin/campaign-review-count");
				if (!res.ok) return;
				const data = (await res.json()) as { count?: number };
				if (!active) return;
				setReviewCount(
					typeof data.count === "number" && data.count >= 0 ? data.count : 0,
				);
			} catch {}
		})();
		return () => {
			active = false;
		};
	}, []);

	React.useEffect(() => {
		let active = true;
		(async () => {
			try {
				const res = await fetch("/api/admin/campaign-active-count");
				if (!res.ok) return;
				const data = (await res.json()) as { count?: number };
				if (!active) return;
				setActiveCampaignCount(
					typeof data.count === "number" && data.count >= 0 ? data.count : 0,
				);
			} catch {}
		})();
		return () => {
			active = false;
		};
	}, []);

	const SidebarContent = (
		<div className="h-full flex flex-col">
			{/* Brand */}
			<div className="flex items-center gap-3 px-5 py-4">
				<div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50">
					<Image
						src="/brand/logo.png"
						alt="Pesona Kebaikan"
						fill
						className="object-contain p-1.5"
						sizes="40px"
						unoptimized
					/>
				</div>

				<div className="min-w-0">
					<div className="text-[15px] font-extrabold tracking-tight text-slate-900">
						Pesona Kebaikan
					</div>
					<div className="text-xs text-slate-500">
						Admin Panel
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-4 pb-4">
				<div className="mb-2 h-px bg-slate-200/70" />

				{menus.map((section) => (
					<div key={section.title} className="mb-3 last:mb-0">
						<div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
							{section.title}
						</div>

						<nav className="mt-1 space-y-0.5">
							{section.items.map((m) => {
								const isActive = pathname === m.href;
								const isCampaignMenu = m.href === "/admin/campaign";
								const isVerifyMenu = m.href === "/admin/campaign/verifikasi";
								return (
									<Link
										key={m.href}
										href={m.href}
										className={`
                      group flex items-center gap-3
                      rounded-xl px-3 py-1.5
                      transition-colors
                      ${
												isActive
													? "bg-slate-100 text-slate-900"
													: "text-slate-800 hover:bg-slate-50"
											}
                      ${
												isVerifyMenu
													? "border border-emerald-500/40 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/80"
													: "border border-transparent"
											}
                    `}
									>
										<span
											className={`
                        inline-flex h-9 w-9 flex-shrink-0 items-center justify-center
                        rounded-xl border border-slate-200/70
                        transition-colors
                        ${
													isActive
														? "bg-white shadow-sm"
														: "bg-white group-hover:bg-slate-50"
												}
                        ${
													isVerifyMenu
														? "bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-emerald-500/15 border-emerald-400/40"
														: ""
												}
                      `}
											style={{
												boxShadow: isActive
													? "0 4px 12px rgba(0,0,0,0.05)"
													: "0 8px 20px rgba(15,23,42,0.05)",
											}}
										>
											{React.cloneElement(m.icon as React.ReactElement<any>, {
												className: isVerifyMenu
													? isActive
														? "text-emerald-600"
														: "text-emerald-500 group-hover:text-emerald-600"
													: isActive
														? "text-green-600"
														: "text-slate-500 group-hover:text-slate-700",
											})}
										</span>

										<span className="min-w-0 flex-1">
											<span
												className={`block text-sm font-extrabold leading-tight ${
													isActive
														? "text-slate-900"
														: "text-slate-700"
												}`}
											>
												{m.label}
											</span>
											{isCampaignMenu && (
												<span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300/60">
													<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
													<span>
														{activeCampaignCount === null
															? "Memuat…"
															: `${activeCampaignCount} aktif`}
													</span>
												</span>
											)}
											{isVerifyMenu && reviewCount !== null && reviewCount > 0 && (
												<span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-500/40">
													<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
													<span>{reviewCount} antrian</span>
												</span>
											)}
										</span>

										{isActive && (
											<span
												className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
												style={{ background: "#0ba976" }}
											/>
										)}
									</Link>
								);
							})}
						</nav>
					</div>
				))}

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
          border border-slate-200/70
          bg-white/90
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
