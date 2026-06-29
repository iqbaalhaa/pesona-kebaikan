"use client";

import * as React from "react";
import { Bell, Megaphone, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getNotifications, markAsRead } from "@/actions/notification";

interface NotificationPopoverProps {
	overlay?: boolean;
	desktopSolid?: boolean;
}

export default function NotificationPopover({ overlay = false, desktopSolid = false }: NotificationPopoverProps) {
	const router = useRouter();
	const { data: session } = useSession();
	const [open, setOpen] = React.useState(false);
	const [tabValue, setTabValue] = React.useState<"KABAR" | "PESAN">("KABAR");
	const [notifications, setNotifications] = React.useState<any[]>([]);
	const [unreadCount, setUnreadCount] = React.useState(0);
	const ref = React.useRef<HTMLDivElement>(null);

	const fetchNotifications = React.useCallback(async () => {
		if (!session?.user?.id) return;
		const res = await getNotifications(session.user.id);
		setNotifications(res.notifications);
		setUnreadCount(res.unreadCount);
	}, [session?.user?.id]);

	React.useEffect(() => {
		if (session?.user?.id) fetchNotifications();
		else { setNotifications([]); setUnreadCount(0); }
	}, [session?.user?.id, fetchNotifications]);

	React.useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const displayed = notifications.filter((n) => n.type === tabValue);

	const iconBorder = overlay ? "border-white/18" : "border-foreground/10";
	const iconBg = overlay ? "bg-white/10" : "bg-foreground/5";
	const iconColor = overlay ? "text-white" : "text-foreground";

	return (
		<div ref={ref} className="relative shrink-0">
			<button
				aria-label={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"}
				aria-expanded={open}
				onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
				className={`relative grid h-10 w-10 place-items-center rounded-xl border backdrop-blur-lg ${iconBorder} ${iconBg} ${iconColor}`}
			>
				<Bell size={20} aria-hidden="true" />
				{unreadCount > 0 && (
					<span aria-hidden="true" className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className="fixed inset-x-0 top-[60px] z-[1200] mx-2 sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:mx-0 sm:w-96 overflow-hidden rounded-2xl bg-surface shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]">
					{/* Tabs */}
					<div className="flex border-b border-divider">
						{(["KABAR", "PESAN"] as const).map((t) => (
							<button
								key={t}
								onClick={() => setTabValue(t)}
								className={[
									"flex-1 py-3 text-sm font-bold transition-colors",
									tabValue === t ? "border-b-2 border-primary text-primary" : "text-foreground/50",
								].join(" ")}
							>
								{t === "KABAR" ? "Kabar" : "Pesan"}
							</button>
						))}
					</div>

					{/* List */}
					<div className="max-h-[400px] overflow-y-auto">
						{displayed.length === 0 ? (
							<p className="p-3 text-center text-sm text-foreground/50">
								Tidak ada notifikasi
							</p>
						) : (
							displayed.map((item) => (
								<React.Fragment key={item.id}>
									<button
										onClick={() => {
											const match = /CAMPAIGN_CHANGE_REQUEST:([a-zA-Z0-9-_]+)/.exec(item.message || "");
											if (match?.[1]) router.push(`/admin/campaign/${match[1]}`);
											if (!item.isRead) {
												markAsRead(item.id);
												setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, isRead: true } : n));
												setUnreadCount((prev) => Math.max(0, prev - 1));
											}
										}}
										className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors ${item.isRead ? "" : "bg-primary/5"}`}
									>
										<span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${item.type === "KABAR" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
											{item.type === "KABAR" ? <Megaphone size={18} /> : <ShieldCheck size={18} />}
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-bold text-foreground">{item.title}</p>
											<p className="mt-0.5 mb-0.5 text-xs leading-snug text-foreground/60 break-words">{item.message}</p>
											<p className="text-[11px] text-foreground/40">
												{item.isBroadcast ? "Untuk semua pengguna" : "Untuk Anda"}
												{" · "}
												{new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
											</p>
										</div>
									</button>
									<hr className="border-divider" />
								</React.Fragment>
							))
						)}
					</div>

					{/* Footer */}
					<div className="border-t border-divider bg-slate-50 p-1.5 text-center">
						<button
							onClick={() => { setOpen(false); router.push("/notifikasi"); }}
							className="cursor-pointer text-xs font-semibold text-primary hover:underline"
						>
							Lihat Semua Notifikasi
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
