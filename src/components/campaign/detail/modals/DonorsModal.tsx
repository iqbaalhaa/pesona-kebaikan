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
	ListItemText,
	Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Transition, formatIDR } from "../utils";

interface DonorsModalProps {
	open: boolean;
	onClose: () => void;
	donorsCount: number;
	donations: any[];
}

export default function DonorsModal({
	open,
	onClose,
	donorsCount,
	donations,
}: DonorsModalProps) {
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
					Donatur ({donorsCount})
				</Typography>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				<List>
					{donations && donations.length > 0 ? (
						donations.map((donation: any) => (
							<ListItem
								key={donation.id}
								alignItems="flex-start"
								disableGutters
							>
								<ListItemText
									primaryTypographyProps={{ component: "div" }}
									secondaryTypographyProps={{ component: "div" }}
									primary={
										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
											}}
										>
											<Typography variant="subtitle2" fontWeight={700}>
												{donation.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{new Date(donation.date).toLocaleDateString("id-ID")}
											</Typography>
										</Box>
									}
									secondary={
										<React.Fragment>
											<Typography
												sx={{
													display: "inline",
													fontWeight: 600,
													color: "#61ce70",
												}}
												component="span"
												variant="body2"
											>
												{formatIDR(donation.amount)}
											</Typography>
											{donation.comment && (
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ mt: 0.5 }}
													component="div"
												>
													"{donation.comment}"
												</Typography>
											)}
										</React.Fragment>
									}
								/>
							</ListItem>
						))
					) : (
						<Typography
							sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
						>
							Belum ada donasi. Jadilah yang pertama!
						</Typography>
					)}
				</List>
			</DialogContent>
		</Dialog>
	);
}
