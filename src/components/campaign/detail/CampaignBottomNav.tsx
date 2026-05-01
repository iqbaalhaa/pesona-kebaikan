"use client";

import * as React from "react";
import { Paper, Container, Button } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { useRouter } from "next/navigation";

interface CampaignBottomNavProps {
	data: any;
	setOpenShareModal: (open: boolean) => void;
}

export default function CampaignBottomNav({
	data,
	setOpenShareModal,
}: CampaignBottomNavProps) {
	const router = useRouter();

	return (
		<Paper
			elevation={0}
			sx={{
				position: "fixed",
				bottom: 0,
				left: { xs: 0, sm: "50%" },
				transform: { xs: "none", sm: "translateX(-50%)" },
				width: "100%",
				maxWidth: { xs: "100%", sm: 480 },
				zIndex: 1000,
				px: 2,
				py: 1.5,
				borderTop: "1px solid #e2e8f0",
				bgcolor: "white",
				pb: "calc(0.75rem + env(safe-area-inset-bottom))",
			}}
		>
			<Container maxWidth="md" sx={{ display: "flex", gap: 1.5, p: 0 }}>
				<Button
					variant="outlined"
					onClick={() => setOpenShareModal(true)}
					startIcon={<ShareIcon sx={{ fontSize: 18 }} />}
					sx={{
						height: 44,
						borderRadius: "12px",
						borderColor: "primary.main",
						color: "primary.main",
						fontWeight: 700,
						fontSize: 14,
						textTransform: "none",
						px: 2.5,
						whiteSpace: "nowrap",
					}}
				>
					Bagikan
				</Button>
				<Button
					variant="contained"
					fullWidth
					disabled={data.status === "ended" || data.status === "rejected"}
					onClick={() => {
						if (data.fundraiserSlug) {
							router.push(`/donasi/fundraiser/${data.fundraiserSlug}/payment`);
						} else {
							router.push(`/donasi/${data.slug || data.id}/payment`);
						}
					}}
					sx={{
						height: 44,
						borderRadius: "12px",
						fontWeight: 700,
						fontSize: 15,
						textTransform: "none",
						bgcolor: "primary.main",
						boxShadow: "none",
						"&:hover": { boxShadow: "0 4px 12px rgba(11,169,118,0.3)" },
						"&.Mui-disabled": {
							bgcolor: "#cbd5e1",
							color: "#94a3b8",
							boxShadow: "none",
						},
					}}
				>
					{data.status === "ended"
						? "Campaign Berakhir"
						: data.status === "rejected"
						? "Campaign Ditolak"
						: "Donasi Sekarang"}
				</Button>
			</Container>
		</Paper>
	);
}
