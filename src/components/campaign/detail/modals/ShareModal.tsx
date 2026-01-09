"use client";

import * as React from "react";
import {
	Dialog,
	Box,
	Typography,
	IconButton,
	DialogContent,
	Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Transition } from "../utils";

interface ShareModalProps {
	open: boolean;
	onClose: () => void;
	handleShareAction: (platform: string) => void;
}

export default function ShareModal({
	open,
	onClose,
	handleShareAction,
}: ShareModalProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			TransitionComponent={Transition}
			fullWidth
			maxWidth="xs"
			PaperProps={{
				sx: { borderRadius: "20px", m: 2, position: "absolute", bottom: 0 },
			}}
		>
			<Box
				sx={{
					p: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Typography sx={{ fontWeight: 700 }}>Bagikan kebaikan ini</Typography>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</Box>
			<DialogContent>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(4, 1fr)",
						gap: 2,
					}}
				>
					<Box
						onClick={() => handleShareAction("whatsapp")}
						sx={{ textAlign: "center", cursor: "pointer" }}
					>
						<Avatar
							sx={{
								bgcolor: "#25D366",
								width: 50,
								height: 50,
								mx: "auto",
								mb: 1,
							}}
						>
							<WhatsAppIcon />
						</Avatar>
						<Typography variant="caption">WhatsApp</Typography>
					</Box>
					<Box
						onClick={() => handleShareAction("facebook")}
						sx={{ textAlign: "center", cursor: "pointer" }}
					>
						<Box
							sx={{
								textAlign: "center",
								cursor: "pointer",
							}}
						>
							<Avatar
								sx={{
									bgcolor: "#1877F2",
									width: 50,
									height: 50,
									mx: "auto",
									mb: 1,
								}}
							>
								<FacebookIcon />
							</Avatar>
							<Typography variant="caption">Facebook</Typography>
						</Box>
					</Box>
					<Box
						onClick={() => handleShareAction("twitter")}
						sx={{ textAlign: "center", cursor: "pointer" }}
					>
						<Box sx={{ textAlign: "center", cursor: "pointer" }}>
							<Avatar
								sx={{
									bgcolor: "#1DA1F2",
									width: 50,
									height: 50,
									mx: "auto",
									mb: 1,
								}}
							>
								<TwitterIcon />
							</Avatar>
							<Typography variant="caption">Twitter</Typography>
						</Box>
					</Box>
					<Box
						onClick={() => handleShareAction("copy")}
						sx={{ textAlign: "center", cursor: "pointer" }}
					>
						<Box sx={{ textAlign: "center", cursor: "pointer" }}>
							<Avatar
								sx={{
									bgcolor: "#f1f5f9",
									color: "#64748b",
									width: 50,
									height: 50,
									mx: "auto",
									mb: 1,
								}}
							>
								<ContentCopyIcon />
							</Avatar>
							<Typography variant="caption">Salin</Typography>
						</Box>
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
}
