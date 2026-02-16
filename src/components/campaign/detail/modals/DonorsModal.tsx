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
	Select,
	MenuItem,
	FormControl,
	SelectChangeEvent,
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
	const [sortOrder, setSortOrder] = React.useState("newest");

	const handleSortChange = (event: SelectChangeEvent) => {
		setSortOrder(event.target.value);
	};

	const sortedDonations = React.useMemo(() => {
		if (!donations) return [];
		const sorted = [...donations];
		switch (sortOrder) {
			case "highest":
				return sorted.sort((a, b) => b.amount - a.amount);
			case "lowest":
				return sorted.sort((a, b) => a.amount - b.amount);
			case "newest":
			default:
				// Assuming donations come sorted by date desc, or we can sort by date
				return sorted.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				);
		}
	}, [donations, sortOrder]);

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
					flexDirection: "column",
					gap: 2,
					pb: 1,
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						width: "100%",
					}}
				>
					<Typography variant="h6" fontWeight={700} component="div">
						Donatur ({donorsCount})
					</Typography>
					<IconButton onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</Box>

				<FormControl size="small" fullWidth>
					<Select
						value={sortOrder}
						onChange={handleSortChange}
						displayEmpty
						inputProps={{ "aria-label": "Urutkan donasi" }}
						sx={{ borderRadius: 2, fontSize: 14 }}
					>
						<MenuItem value="newest">Paling Baru</MenuItem>
						<MenuItem value="highest">Nominal Terbesar</MenuItem>
						<MenuItem value="lowest">Nominal Terkecil</MenuItem>
					</Select>
				</FormControl>
			</DialogTitle>
			<DialogContent dividers>
				<List>
					{sortedDonations && sortedDonations.length > 0 ? (
						sortedDonations.map((donation: any) => (
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
													color: "#0ba976",
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
