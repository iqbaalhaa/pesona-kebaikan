"use client";

import { useRouter } from "next/navigation";
import { Pencil, ShieldCheck } from "lucide-react";

type UserCardData = {
	name?: string | null;
	email?: string | null;
	image?: string | null;
	verifiedAt?: string | Date | null;
	verifiedAs?: "personal" | "organization" | null;
	verificationRequests?: { status: string }[];
};

export default function ProfileCard({ user }: { user: UserCardData }) {
	const router = useRouter();
	const isVerified = Boolean(user?.verifiedAt);
	const isPending = user?.verificationRequests?.[0]?.status === "PENDING";
	const isRejected = user?.verificationRequests?.[0]?.status === "REJECTED";
	const statusLabel = isVerified
		? `Terverifikasi: ${user?.verifiedAs === "organization" ? "organization" : "personal"}`
		: isPending
			? "Menunggu Verifikasi"
			: isRejected
				? "Verifikasi Ditolak"
				: "Belum Terverifikasi";

	const statusColor = isVerified
		? "text-primary"
		: isPending
			? "text-amber-500"
			: isRejected
				? "text-red-600"
				: "text-slate-500";

	const dotColor = isVerified
		? "bg-primary"
		: isPending
			? "bg-amber-500"
			: isRejected
				? "bg-red-500"
				: "bg-slate-200";

	return (
		<div className="relative mb-3 flex items-center gap-2 overflow-hidden rounded-2xl border border-foreground/8 bg-white p-2.5">
			{user?.image ? (
				<img
					src={user.image}
					alt={user.name || ""}
					className="h-18 w-18 shrink-0 rounded-full border-3 border-white bg-primary object-cover shadow-md"
				/>
			) : (
				<div className="grid h-18 w-18 shrink-0 place-items-center rounded-full border-3 border-white bg-primary text-[28px] font-extrabold text-white shadow-md">
					{user?.name?.[0]?.toUpperCase() || "A"}
				</div>
			)}

			<div
				className="flex-1 cursor-pointer"
				onClick={() => router.push("/profil/akun")}
			>
				<div className="flex items-center gap-0.5">
					<span className="text-lg font-black text-foreground">
						{user?.name || "User"}
					</span>
					{isVerified && (
						<span title="Terverifikasi"><ShieldCheck size={18} className="text-blue-500" /></span>
					)}
					{isVerified && user?.verifiedAs === "organization" && (
						<span className="ml-0.5 rounded border border-blue-200 bg-blue-50 px-1.5 py-px text-[10px] font-extrabold text-blue-700">
							ORG
						</span>
					)}
				</div>
				<p className="text-sm text-foreground/60">{user?.email}</p>
				<div className="mt-0.5 flex items-center gap-0.5">
					<span className={`h-2 w-2 rounded-full ${dotColor}`} />
					<span className={`text-xs font-bold ${statusColor}`}>
						{statusLabel}
					</span>
				</div>
			</div>

			<button
				onClick={() => router.push("/profil/akun")}
				className="rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-slate-700 transition-colors hover:bg-slate-100"
			>
				<Pencil size={18} />
			</button>
		</div>
	);
}
