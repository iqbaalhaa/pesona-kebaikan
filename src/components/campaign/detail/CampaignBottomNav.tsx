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
			elevation={3}
			sx={{
				position: "fixed",
				bottom: 0,
				left: { xs: 0, sm: "50%" },
				transform: { xs: "none", sm: "translateX(-50%)" },
				width: "100%",
				maxWidth: { xs: "100%", sm: 480 },
				zIndex: 1000,
				p: 2,
				borderTop: "1px solid #e2e8f0",
				bgcolor: "white",
			}}
		>
			<Container maxWidth="md" sx={{ display: "flex", gap: 2 }}>
				<Button
					variant="outlined"
					onClick={() => setOpenShareModal(true)}
					sx={{
						minWidth: 48,
						width: 48,
						height: 48,
						borderRadius: "12px",
						borderColor: "#e2e8f0",
						color: "#64748b",
					}}
				>
					<ShareIcon />
				</Button>
				<Button
					variant="contained"
					color="primary"
					fullWidth
					disabled={data.status === "ended" || data.status === "rejected"}
					onClick={() => router.push(`/donasi/${data.slug || data.id}/payment`)}
					sx={{
						borderRadius: "12px",
						fontWeight: 700,
						fontSize: 16,
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
