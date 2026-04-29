"use client";

import * as React from "react";
import { ArrowLeft, Megaphone, ShieldCheck, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	getNotifications,
	markAsRead,
	markAllAsRead,
} from "@/actions/notification";

export default function NotificationPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const [tabValue, setTabValue] = React.useState<"KABAR" | "PESAN">("KABAR");
	const [notifications, setNotifications] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(true);

	const fetchNotifications = async () => {
		if (!session?.user?.id) return;
		try {
			setLoading(true);
			const { notifications } = await getNotifications(
				session.user.id,
				undefined,
				50,
			);
			setNotifications(notifications);
		} catch (error) {
			console.error("Failed to fetch notifications", error);
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		if (session?.user?.id) {
			fetchNotifications();
		} else {
			setNotifications([]);
			setLoading(false);
		}
	}, [session?.user?.id]);

	const handleMarkAsRead = async (id: string) => {
		await markAsRead(id);
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
		);
	};

	const handleMarkAllAsRead = async () => {
		if (!session?.user?.id) return;
		await markAllAsRead(session.user.id);
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
	};

	const displayedNotifications = notifications.filter(
		(n) => n.type === tabValue,
	);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();

		if (diff < 24 * 60 * 60 * 1000) {
			if (diff < 60 * 60 * 1000) {
				const minutes = Math.floor(diff / (60 * 1000));
				return `${minutes} menit yang lalu`;
			}
			const hours = Math.floor(diff / (60 * 60 * 1000));
			return `${hours} jam yang lalu`;
		}

		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const tabs = [
		{ key: "KABAR" as const, label: "Kabar" },
		{ key: "PESAN" as const, label: "Pesan" },
	];

	return (
		<div className="pb-10">
			{/* Header */}
			<div className="sticky top-0 z-10 flex items-center justify-between gap-1 border-b border-divider bg-surface p-2">
				<div className="flex items-center gap-1">
					<button
						onClick={() => router.back()}
						className="grid h-8 w-8 place-items-center rounded-lg text-foreground transition-colors hover:bg-foreground/5"
					>
						<ArrowLeft size={20} />
					</button>
					<h1 className="text-lg font-bold">Notifikasi</h1>
				</div>
				<button
					onClick={handleMarkAllAsRead}
					title="Tandai semua sudah dibaca"
					className="grid h-8 w-8 place-items-center rounded-lg text-primary transition-colors hover:bg-primary/10"
				>
					<CheckCheck size={20} />
				</button>
			</div>

			{/* Tabs */}
			<div className="sticky top-[65px] z-10 flex border-b border-divider bg-surface">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() => setTabValue(tab.key)}
						className={[
							"flex-1 py-3 text-sm font-bold transition-colors",
							tabValue === tab.key
								? "border-b-2 border-primary text-primary"
								: "text-foreground/50",
						].join(" ")}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Content */}
			<div>
				{loading ? (
					<p className="p-3 text-center text-sm text-text-secondary">
						Memuat notifikasi...
					</p>
				) : displayedNotifications.length === 0 ? (
					<p className="p-3 text-center text-sm text-text-secondary">
						Belum ada notifikasi
					</p>
				) : (
					<ul>
						{displayedNotifications.map((item) => (
							<li key={item.id}>
								<button
									onClick={() =>
										!item.isRead && handleMarkAsRead(item.id)
									}
									className={[
										"flex w-full items-start gap-3 border-b border-divider px-3 py-3 text-left transition-colors",
										item.isRead ? "bg-transparent" : "bg-primary/5",
									].join(" ")}
								>
									<span
										className={[
											"mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full",
											item.type === "KABAR"
												? "bg-green-50 text-green-600"
												: "bg-blue-50 text-blue-600",
										].join(" ")}
									>
										{item.type === "KABAR" ? (
											<Megaphone size={20} />
										) : (
											<ShieldCheck size={20} />
										)}
									</span>
									<div className="min-w-0 flex-1">
										<p
											className={`text-sm text-foreground ${item.isRead ? "font-medium" : "font-bold"}`}
										>
											{item.title}
										</p>
										<p className="mt-0.5 mb-0.5 text-[13px] leading-snug text-slate-500">
											{item.message}
										</p>
										<p className="text-[11px] text-slate-400">
											{item.isBroadcast
												? "Untuk semua pengguna"
												: "Untuk Anda"}{" "}
											· {formatDate(item.createdAt)}
										</p>
									</div>
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
