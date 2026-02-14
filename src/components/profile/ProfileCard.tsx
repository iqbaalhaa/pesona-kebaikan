"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

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
	const statusLabel = isVerified
		? `Terverifikasi: ${user?.verifiedAs === "organization" ? "organization" : "personal"}`
		: isPending
			? "Menunggu Verifikasi"
			: "Belum Terverifikasi";
	return (
		<Paper
			elevation={0}
			variant="outlined"
			sx={{
				p: 2.5,
				mb: 3,
				borderRadius: 4,
				display: "flex",
				alignItems: "center",
				gap: 2,
				bgcolor: "#fff",
				borderColor: "rgba(0,0,0,0.08)",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<Avatar
				src={user?.image || "/avatar-placeholder.jpg"}
				sx={{
					width: 72,
					height: 72,
					bgcolor: "#0ba976",
					fontSize: 28,
					fontWeight: 800,
					border: "3px solid #fff",
					boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
				}}
			>
				{user?.name?.[0]?.toUpperCase() || "A"}
			</Avatar>
			<Box
				sx={{ flex: 1, cursor: "pointer" }}
				onClick={() => router.push("/profil/akun")}
			>
				<Stack direction="row" alignItems="center" gap={0.5}>
					<Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
						{user?.name || "User"}
					</Typography>
					{isVerified ? (
						<Tooltip title="Terverifikasi">
							<VerifiedUserIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
						</Tooltip>
					) : null}
					{isVerified && user?.verifiedAs === "organization" ? (
						<Chip
							label="ORG"
							size="small"
							sx={{
								height: 20,
								fontSize: 10,
								fontWeight: 800,
								borderRadius: 1,
								ml: 0.5,
								bgcolor: "#eff6ff",
								color: "#1d4ed8",
								border: "1px solid #bfdbfe",
							}}
						/>
					) : null}
				</Stack>
				<Typography sx={{ fontSize: 14, color: "rgba(15,23,42,0.6)" }}>
					{user?.email}
				</Typography>
				<Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
					<Box
						sx={{
							width: 8,
							height: 8,
							borderRadius: "50%",
							bgcolor: isVerified
								? "#0ba976"
								: isPending
									? "#f59e0b"
									: "#e2e8f0",
						}}
					/>
					<Typography
						sx={{
							fontSize: 12,
							fontWeight: 700,
							color: isVerified ? "#0ba976" : isPending ? "#f59e0b" : "#64748b",
						}}
					>
						{statusLabel}
					</Typography>
				</Box>
			</Box>
			<IconButton
				sx={{
					bgcolor: "#f8fafc",
					color: "#334155",
					borderRadius: 3,
					p: 1.5,
					border: "1px solid #e2e8f0",
					"&:hover": { bgcolor: "#f1f5f9" },
				}}
				onClick={() => router.push("/profil/akun")}
			>
				<EditIcon />
			</IconButton>
		</Paper>
	);
}
