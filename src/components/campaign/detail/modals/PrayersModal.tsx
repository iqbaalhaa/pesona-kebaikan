"use client";

import * as React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Typography,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Avatar,
	Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Transition } from "../utils";

interface PrayersModalProps {
	open: boolean;
	onClose: () => void;
	prayers: any[];
}

export default function PrayersModal({ open, onClose, prayers }: PrayersModalProps) {
	const sortedPrayers = React.useMemo(() => {
		if (!prayers) return [];
		return [...prayers].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);
	}, [prayers]);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			TransitionComponent={Transition}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: { borderRadius: "20px", maxHeight: "80vh" },
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Typography variant="h6" fontWeight={700} component="div">
					Doa Orang Baik ({sortedPrayers.length})
				</Typography>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				<List>
					{sortedPrayers.length > 0 ? (
						sortedPrayers.map((prayer: any) => (
							<ListItem key={prayer.id} alignItems="flex-start" disableGutters>
								<ListItemAvatar>
									<Avatar sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontWeight: 700 }}>
										{(prayer.name || "?").charAt(0)}
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									primaryTypographyProps={{ component: "div" }}
									secondaryTypographyProps={{ component: "div" }}
									primary={
										<Box sx={{ display: "flex", justifyContent: "space-between" }}>
											<Typography variant="subtitle2" fontWeight={700}>
												{prayer.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{new Date(prayer.date).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}
											</Typography>
										</Box>
									}
									secondary={
										prayer.comment && (
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mt: 0.5, fontStyle: "italic" }}
											>
												"{prayer.comment}"
											</Typography>
										)
									}
								/>
							</ListItem>
						))
					) : (
						<Typography sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
							Belum ada doa.
						</Typography>
					)}
				</List>
			</DialogContent>
		</Dialog>
	);
}
