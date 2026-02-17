import React from "react";
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Stack,
	Pagination,
} from "@mui/material";
import Link from "next/link";
import { getCampaignChangeRequests } from "@/actions/campaign";

export default async function CampaignRequestsPage(props: {
	searchParams: Promise<{ page?: string }>;
}) {
	const searchParams = await props.searchParams;
	const page = Number(searchParams.page) || 1;

	const { requests, totalPages } = await getCampaignChangeRequests(page);

	return (
		<Box sx={{ p: 3 }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mb: 3 }}
			>
				<Typography variant="h5" fontWeight={700}>
					Pengajuan Perubahan Campaign
				</Typography>
			</Stack>

			<TableContainer
				component={Paper}
				elevation={0}
				sx={{
					borderRadius: 2,
					border: "1px solid",
					borderColor: "divider",
					overflowX: "auto",
				}}
			>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: "grey.50" }}>
							<TableCell sx={{ fontWeight: 600 }}>Campaign</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Pemohon</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Perubahan</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Diajukan</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{requests.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 3 }}>
									<Typography color="text.secondary">
										Belum ada pengajuan perubahan campaign
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							requests.map((req: any) => {
								const parts: string[] = [];
								if (req.extraDays) {
									parts.push(`Perpanjangan ${req.extraDays} hari`);
								}
								if (req.extraTarget) {
									const amount = Number(req.extraTarget);
									if (!Number.isNaN(amount)) {
										parts.push(
											`Penambahan target Rp${amount.toLocaleString("id-ID")}`,
										);
									}
								}
								const changeSummary =
									parts.length > 0 ? parts.join(" dan ") : "Perubahan campaign";

								return (
									<TableRow key={req.id} hover>
										<TableCell>
											<Stack spacing={0.5}>
												<Link
													href={`/admin/campaign/${req.campaign.id}`}
													style={{
														textDecoration: "none",
														color: "inherit",
													}}
												>
													<Typography fontWeight={600}>
														{req.campaign.title}
													</Typography>
												</Link>
												{req.campaign.slug && (
													<Typography
														variant="caption"
														color="text.secondary"
													>
														/{req.campaign.slug}
													</Typography>
												)}
											</Stack>
										</TableCell>
										<TableCell>
											<Typography>
												{req.user?.name || "Tanpa nama"}
											</Typography>
											{req.user?.email && (
												<Typography
													variant="caption"
													color="text.secondary"
												>
													{req.user.email}
												</Typography>
											)}
										</TableCell>
										<TableCell>
											<Typography variant="body2">{changeSummary}</Typography>
										</TableCell>
										<TableCell>
											<Chip
												label={req.status}
												size="small"
												color={
													req.status === "PENDING"
														? "warning"
														: req.status === "APPROVED"
														? "success"
														: "default"
												}
												variant="outlined"
											/>
										</TableCell>
										<TableCell>
											{new Date(req.createdAt).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "short",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{totalPages > 1 && (
				<Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
					<Pagination
						count={totalPages}
						page={page}
						color="primary"
						renderItem={(item) => (
							<Link
								href={`/admin/pengajuan-campaign?page=${item.page}`}
								style={{ textDecoration: "none" }}
							>
								{item.page && (
									<Chip
										label={item.page}
										color={item.selected ? "primary" : "default"}
										variant={item.selected ? "filled" : "outlined"}
										size="small"
										sx={{ mx: 0.25 }}
									/>
								)}
							</Link>
						)}
					/>
				</Box>
			)}
		</Box>
	);
}

