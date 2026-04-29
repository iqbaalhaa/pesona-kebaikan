"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
	Heart,
	Megaphone,
	Calendar,
	HelpCircle,
	Info,
	LogOut,
	LogIn,
	FileText,
	Shield,
} from "lucide-react";
import ProfileMenu from "@/components/profile/ProfileMenu";
import ProfileCard from "@/components/profile/ProfileCard";
import VerificationBanner from "@/components/profile/VerificationBanner";
import VerificationDialog from "@/components/profile/VerificationDialog";
import { getMyProfile } from "@/actions/user";

export default function ProfilePage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const user = session?.user;
	const isDummy = user?.email === "tamu@pesonakebaikan.id";

	const [openVerification, setOpenVerification] = React.useState(false);

	const [myProfile, setMyProfile] = React.useState<{
		id: string;
		name: string | null;
		email: string;
		image: string | null;
		verifiedAs: "personal" | "organization" | null;
		verifiedAt: string | Date | null;
		verificationRequests?: { status: string }[];
	} | null>(null);

	const loadProfile = React.useCallback(async () => {
		const p = await getMyProfile();
		if (p) {
			setMyProfile({
				id: p.id,
				name: p.name ?? null,
				email: p.email,
				image: p.image ?? null,
				verifiedAs:
					(p.verifiedAs as "personal" | "organization" | null) ?? null,
				verifiedAt: p.verifiedAt ?? null,
				verificationRequests: p.verificationRequests,
			});
		} else {
			setMyProfile(null);
		}
	}, []);

	React.useEffect(() => {
		if (status === "authenticated") loadProfile();
	}, [status, loadProfile]);

	return (
		<div className="px-2 pb-10 pt-2.5">
			<div className="mb-3">
				<h1 className="text-2xl font-black text-foreground">Profil Saya</h1>
			</div>

			{status === "loading" ? (
				<div className="flex justify-center p-4">
					<p className="text-text-secondary">Memuat profil...</p>
				</div>
			) : !user ? (
				<button
					onClick={() => router.push("/auth/login")}
					className="mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-green-500 p-2 text-base font-black text-white shadow-[0_10px_20px_rgba(11,169,118,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(11,169,118,0.4)]"
				>
					<LogIn size={20} />
					Masuk / Daftar
				</button>
			) : (
				<>
					<ProfileCard user={myProfile || user} />

					{!myProfile?.verifiedAt &&
						!myProfile?.verificationRequests?.[0]?.status && (
							<VerificationBanner
								onClick={() => setOpenVerification(true)}
							/>
						)}

					<div className="mb-3">
						<p className="mb-1 ml-1 text-xs font-extrabold uppercase tracking-wider text-foreground/50">
							Akun
						</p>
						<ProfileMenu
							icon={<Shield size={20} />}
							label="Keamanan & Password"
							onClick={() => router.push("/profil/keamanan")}
						/>
					</div>
				</>
			)}

			<div>
				<p className="mb-1 ml-1 text-xs font-extrabold uppercase tracking-wider text-foreground/50">
					Info Lainnya
				</p>
				<ProfileMenu
					icon={<HelpCircle size={20} />}
					label="Pusat Bantuan"
					onClick={() => router.push("/profil/bantuan")}
				/>
				<ProfileMenu
					icon={<Info size={20} />}
					label="Tentang Pesona Kebaikan"
					onClick={() => router.push("/profil/tentang")}
				/>
				<ProfileMenu
					icon={<FileText size={20} />}
					label="Syarat dan Ketentuan"
					onClick={() => router.push("/profil/syarat-ketentuan")}
				/>
				{user && (
					<ProfileMenu
						icon={isDummy ? <LogIn size={20} /> : <LogOut size={20} />}
						label={isDummy ? "Masuk ke Akun Asli" : "Keluar"}
						danger={!isDummy}
						onClick={() => {
							if (isDummy) {
								router.push("/auth/login");
							} else {
								signOut();
							}
						}}
					/>
				)}
			</div>

			<VerificationDialog
				open={openVerification}
				onClose={() => setOpenVerification(false)}
				userEmail={user?.email}
				onSuccess={loadProfile}
			/>
		</div>
	);
}
