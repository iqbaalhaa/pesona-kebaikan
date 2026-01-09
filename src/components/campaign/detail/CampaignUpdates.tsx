"use client";

import * as React from "react";
import {
	Box,
	Stack,
	Typography,
	Paper,
	Collapse,
} from "@mui/material";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

function UpdateItem({ update, isLast }: { update: any; isLast: boolean }) {
	const [expanded, setExpanded] = React.useState(false);

	return (
		<Box sx={{ display: "flex", gap: 2.5 }}>
			{/* Timeline Indicator */}
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					minWidth: 40,
				}}
			>
				<Box
					sx={{
						width: 40,
						height: 40,
						borderRadius: "50%",
						bgcolor: "#fff",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						border:
							update.type === "withdrawal"
								? "2px solid #e2e8f0"
								: "2px solid #bbf7d0",
						boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
						zIndex: 1,
					}}
				>
					{update.type === "withdrawal" ? (
						<AccountBalanceWalletRoundedIcon
							sx={{ fontSize: 20, color: "#64748b" }}
						/>
					) : (
						<VerifiedUserIcon sx={{ fontSize: 20, color: "#16a34a" }} />
					)}
				</Box>
				{!isLast && (
					<Box
						sx={{
							width: 0,
							flex: 1,
							borderLeft: "2px dashed #e2e8f0",
							my: 0.5,
							position: "relative",
							zIndex: 0,
						}}
					/>
				)}
			</Box>

			{/* Content */}
			<Box sx={{ flex: 1, pb: isLast ? 0 : 0.2 }}>
				<Paper
					elevation={expanded ? 0 : 0}
					onClick={() => setExpanded(!expanded)}
					sx={{
						p: 2.5,
						borderRadius: 3,
						cursor: "pointer",
						border: "1px solid",
						borderColor: expanded ? "#e2e8f0" : "transparent",
						bgcolor: expanded ? "#fff" : "transparent",
						boxShadow: expanded ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
						transition: "all 0.3s ease",
						"&:hover": {
							bgcolor: expanded ? "#fff" : "#f8fafc",
						},
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mb: 1,
						}}
					>
						<Typography
							variant="caption"
							sx={{
								color: "#64748b",
								fontWeight: 700,
								display: "block",
								fontSize: 11,
								letterSpacing: 0.5,
								textTransform: "uppercase",
							}}
						>
							{new Date(update.date).toLocaleDateString("id-ID", {
								day: "numeric",
								month: "long",
								year: "numeric",
							})}
						</Typography>
						<Box
							sx={{
								transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
								transition: "transform 0.3s",
							}}
						>
							<KeyboardArrowDownIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
						</Box>
					</Box>
					<Typography
						variant="h6"
						sx={{
							fontSize: 16,
							fontWeight: 700,
							color: "#0f172a",
							lineHeight: 1.5,
							mb: expanded ? 2 : 0,
						}}
					>
						{update.title}
					</Typography>

					<Collapse in={expanded} timeout="auto" unmountOnExit>
						<Typography
							variant="body2"
							sx={{
								color: "#334155",
								lineHeight: 1.8,
								whiteSpace: "pre-wrap",
								fontSize: 15,
							}}
						>
							{update.content}
						</Typography>

						{update.images && update.images.length > 0 && (
							<Box
								sx={{
									mt: 3,
									borderRadius: 3,
									overflow: "hidden",
									display: "grid",
									gridTemplateColumns:
										update.images.length === 1 ? "1fr" : "repeat(2, 1fr)",
									gap: 1,
								}}
							>
								{update.images.map((img: string, i: number) => (
									<Box
										key={i}
										component="img"
										src={img}
										alt="Update"
										sx={{
											width: "100%",
											height: update.images.length === 1 ? "auto" : 200,
											objectFit: "cover",
											borderRadius: 2,
											gridColumn:
												update.images.length % 2 !== 0 && i === 0
													? "span 2"
													: "auto",
										}}
									/>
								))}
							</Box>
						)}
					</Collapse>
				</Paper>
			</Box>
		</Box>
	);
}

interface CampaignUpdatesProps {
	updates: any[];
}

export default function CampaignUpdates({ updates }: CampaignUpdatesProps) {
	return (
		<>
			{updates && updates.length > 0 ? (
				<Stack spacing={0}>
					{updates.map((update: any, index: number) => (
						<UpdateItem
							key={update.id}
							update={update}
							isLast={index === updates.length - 1}
						/>
					))}
				</Stack>
			) : (
				<Box
					sx={{
						textAlign: "center",
						py: 8,
						px: 2,
						bgcolor: "#f8fafc",
						borderRadius: 4,
						border: "1px dashed #e2e8f0",
					}}
				>
					<Box
						sx={{
							width: 64,
							height: 64,
							bgcolor: "#f1f5f9",
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							mx: "auto",
							mb: 2,
						}}
					>
						<VolunteerActivismIcon sx={{ color: "#94a3b8", fontSize: 32 }} />
					</Box>
					<Typography variant="subtitle1" fontWeight={600} gutterBottom>
						Belum ada kabar terbaru
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Pemilik campaign belum memposting update apapun.
					</Typography>
				</Box>
			)}
		</>
	);
}
