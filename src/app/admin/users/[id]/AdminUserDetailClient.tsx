"use client";

import React, { useState } from "react";
import {
	Box,
	Typography,
	Paper,
	Avatar,
	Stack,
	Button,
	Divider,
	Chip,
	Tabs,
	Tab,
	Card,
	CardContent,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Grid,
	IconButton,
	Container,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	useTheme,
	alpha,
	Breadcrumbs,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	CalendarToday as CalendarIcon,
	LocationOn as LocationIcon,
	VerifiedUser as VerifiedUserIcon,
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon,
	AccessTime as AccessTimeIcon,
	VolunteerActivism as VolunteerActivismIcon,
	Campaign as CampaignIcon,
	Security as SecurityIcon,
	ContentCopy as ContentCopyIcon,
	OpenInNew as OpenInNewIcon,
	History as HistoryIcon,
	AccountCircle as AccountCircleIcon,
	CreditCard as CreditCardIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface AdminUserDetailClientProps {
	user: {
		id: string;
		name: string | null;
		email: string;
		phone: string | null;
		role: string;
		image: string | null;
		createdAt: string;
		emailVerified: string | null;
		phoneVerified: string | null;
		verifiedAt: string | null;
		verifiedAs: string | null;
		province?: { name: string } | null;
		regency?: { name: string } | null;
		district?: { name: string } | null;
		village?: { name: string } | null;
		address: string | null;
		donations: Array<{
			id: string;
			amount: string;
			status: string;
			createdAt: string;
			campaign: {
				title: string;
				slug: string | null;
				image: string | null;
			};
		}>;
		campaigns: Array<{
			id: string;
			title: string;
			slug: string | null;
			status: string;
			target: string;
			createdAt: string;
			category: { name: string };
		}>;
		verificationRequests: Array<{
			id: string;
			status: string;
			type: string;
			createdAt: string;
			ktpPhotoUrl: string | null;
			selfieUrl: string | null;
		}>;
	};
}

function CustomTabPanel(props: {
	children?: React.ReactNode;
	index: number;
	value: number;
}) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

export default function AdminUserDetailClient({
	user,
}: AdminUserDetailClientProps) {
	const theme = useTheme();
	const [tabValue, setTabValue] = useState(0);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const formatCurrency = (amount: string) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(Number(amount));
	};

	const formatDate = (dateString: string) => {
		return format(new Date(dateString), "dd MMMM yyyy, HH:mm", {
			locale: idLocale,
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "APPROVED":
			case "COMPLETED":
			case "ACTIVE":
			case "PAID":
				return "success";
			case "PENDING":
				return "warning";
			case "REJECTED":
			case "CANCELLED":
				return "error";
			default:
				return "default";
		}
	};

	const fullAddress = [
		user.address,
		user.village?.name,
		user.district?.name,
		user.regency?.name,
		user.province?.name,
	]
		.filter(Boolean)
		.join(", ");

	const totalDonationAmount = (user.donations || [])
		.filter((d) => d.status === "PAID" || d.status === "COMPLETED") // Assuming PAID/COMPLETED status
		.reduce((acc, curr) => acc + Number(curr.amount), 0);

	return (
		<Box sx={{ pb: 10, width: "100%", bgcolor: "grey.50", minHeight: "100vh" }}>
			<Container maxWidth="xl" sx={{ pt: 4 }}>
				{/* Header Navigation */}
				<Box sx={{ mb: 4 }}>
					<Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
						<Link
							href="/admin/users"
							style={{
								textDecoration: "none",
								color: theme.palette.text.secondary,
							}}
						>
							Users
						</Link>
						<Typography color="text.primary">User Details</Typography>
					</Breadcrumbs>

					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Stack direction="row" spacing={2} alignItems="center">
							<Link
								href="/admin/users"
								passHref
								style={{ textDecoration: "none" }}
							>
								<IconButton
									sx={{
										bgcolor: "white",
										border: "1px solid",
										borderColor: "divider",
									}}
								>
									<ArrowBackIcon />
								</IconButton>
							</Link>
							<Box>
								<Typography
									variant="h4"
									fontWeight={700}
									sx={{ color: "text.primary" }}
								>
									{user.name || "Pengguna Tanpa Nama"}
								</Typography>
								<Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
									<Chip
										label={user.role}
										size="small"
										color={user.role === "ADMIN" ? "error" : "default"}
										sx={{ fontWeight: 600, borderRadius: 1 }}
									/>
									<Typography variant="body2" color="text.secondary">
										ID: {user.id}
									</Typography>
								</Stack>
							</Box>
						</Stack>

						<Stack direction="row" spacing={2}>
							{/* Action Buttons could go here */}
						</Stack>
					</Box>
				</Box>

				<Grid container spacing={3}>
					{/* Left Column: User Profile Card */}
					<Grid item xs={12} md={4} lg={3}>
						<Paper
							elevation={0}
							sx={{
								p: 0,
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								overflow: "hidden",
								position: "sticky",
								top: 24,
							}}
						>
							<Box
								sx={{
									height: 100,
									background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
									position: "relative",
								}}
							/>

							<Box sx={{ px: 3, pb: 4, mt: -6, textAlign: "center" }}>
								<Avatar
									src={user.image || ""}
									alt={user.name || "User"}
									sx={{
										width: 100,
										height: 100,
										border: "4px solid white",
										boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
										mx: "auto",
										bgcolor: "grey.200",
										fontSize: 40,
										fontWeight: 700,
										color: "text.secondary",
									}}
								>
									{user.name?.charAt(0).toUpperCase() || (
										<AccountCircleIcon sx={{ fontSize: 60 }} />
									)}
								</Avatar>

								<Stack spacing={2} sx={{ mt: 3, textAlign: "left" }}>
									<Box>
										<Typography
											variant="caption"
											color="text.secondary"
											fontWeight={600}
											display="block"
											mb={0.5}
										>
											EMAIL
										</Typography>
										<Stack direction="row" alignItems="center" spacing={1}>
											<EmailIcon fontSize="small" color="action" />
											<Typography variant="body2" noWrap title={user.email}>
												{user.email}
											</Typography>
											{user.emailVerified && (
												<CheckCircleIcon
													fontSize="small"
													color="success"
													sx={{ fontSize: 16 }}
												/>
											)}
										</Stack>
									</Box>

									<Box>
										<Typography
											variant="caption"
											color="text.secondary"
											fontWeight={600}
											display="block"
											mb={0.5}
										>
											PHONE
										</Typography>
										<Stack direction="row" alignItems="center" spacing={1}>
											<PhoneIcon fontSize="small" color="action" />
											<Typography variant="body2">
												{user.phone || "-"}
											</Typography>
											{user.phoneVerified && (
												<CheckCircleIcon
													fontSize="small"
													color="success"
													sx={{ fontSize: 16 }}
												/>
											)}
										</Stack>
									</Box>

									<Box>
										<Typography
											variant="caption"
											color="text.secondary"
											fontWeight={600}
											display="block"
											mb={0.5}
										>
											ADDRESS
										</Typography>
										<Stack direction="row" alignItems="flex-start" spacing={1}>
											<LocationIcon
												fontSize="small"
												color="action"
												sx={{ mt: 0.3 }}
											/>
											<Typography variant="body2">
												{fullAddress || "-"}
											</Typography>
										</Stack>
									</Box>

									<Divider />

									<Box>
										<Typography
											variant="caption"
											color="text.secondary"
											fontWeight={600}
											display="block"
											mb={0.5}
										>
											JOINED DATE
										</Typography>
										<Stack direction="row" alignItems="center" spacing={1}>
											<CalendarIcon fontSize="small" color="action" />
											<Typography variant="body2">
												{format(new Date(user.createdAt), "dd MMMM yyyy", {
													locale: idLocale,
												})}
											</Typography>
										</Stack>
									</Box>
								</Stack>
							</Box>
						</Paper>
					</Grid>

					{/* Right Column: Main Content */}
					<Grid item xs={12} md={8} lg={9}>
						{/* Stats Cards */}
						<Grid container spacing={2} sx={{ mb: 3 }}>
							<Grid item xs={12} sm={4}>
								<Card
									sx={{
										borderRadius: 3,
										boxShadow: "none",
										border: "1px solid",
										borderColor: "divider",
										height: "100%",
									}}
								>
									<CardContent>
										<Stack spacing={1}>
											<Box
												sx={{
													p: 1,
													width: "fit-content",
													borderRadius: 2,
													bgcolor: alpha(theme.palette.primary.main, 0.1),
													color: "primary.main",
												}}
											>
												<VolunteerActivismIcon />
											</Box>
											<Typography variant="h5" fontWeight={700}>
												{formatCurrency(totalDonationAmount.toString())}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Total Donasi
											</Typography>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={12} sm={4}>
								<Card
									sx={{
										borderRadius: 3,
										boxShadow: "none",
										border: "1px solid",
										borderColor: "divider",
										height: "100%",
									}}
								>
									<CardContent>
										<Stack spacing={1}>
											<Box
												sx={{
													p: 1,
													width: "fit-content",
													borderRadius: 2,
													bgcolor: alpha(theme.palette.secondary.main, 0.1),
													color: "secondary.main",
												}}
											>
												<CampaignIcon />
											</Box>
											<Typography variant="h5" fontWeight={700}>
												{user.campaigns?.length || 0}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Campaign Dibuat
											</Typography>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={12} sm={4}>
								<Card
									sx={{
										borderRadius: 3,
										boxShadow: "none",
										border: "1px solid",
										borderColor: "divider",
										height: "100%",
									}}
								>
									<CardContent>
										<Stack spacing={1}>
											<Box
												sx={{
													p: 1,
													width: "fit-content",
													borderRadius: 2,
													bgcolor: alpha(theme.palette.success.main, 0.1),
													color: "success.main",
												}}
											>
												<VerifiedUserIcon />
											</Box>
											<Box>
												<Typography variant="h6" fontWeight={700}>
													{user.verifiedAt
														? "Terverifikasi"
														: "Belum Verifikasi"}
												</Typography>
												{user.verifiedAs && (
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ textTransform: "capitalize" }}
													>
														sebagai {user.verifiedAs}
													</Typography>
												)}
											</Box>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
						</Grid>

						{/* Tabs Section */}
						<Paper
							sx={{
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								overflow: "hidden",
							}}
							elevation={0}
						>
							<Box
								sx={{
									borderBottom: 1,
									borderColor: "divider",
									px: 2,
									bgcolor: "white",
								}}
							>
								<Tabs
									value={tabValue}
									onChange={handleTabChange}
									aria-label="user details tabs"
									variant="scrollable"
									scrollButtons="auto"
								>
									<Tab
										label="Riwayat Donasi"
										icon={<VolunteerActivismIcon fontSize="small" />}
										iconPosition="start"
										sx={{
											textTransform: "none",
											fontWeight: 600,
											minHeight: 60,
										}}
									/>
									<Tab
										label="Campaign"
										icon={<CampaignIcon fontSize="small" />}
										iconPosition="start"
										sx={{
											textTransform: "none",
											fontWeight: 600,
											minHeight: 60,
										}}
									/>
									<Tab
										label="Verifikasi"
										icon={<VerifiedUserIcon fontSize="small" />}
										iconPosition="start"
										sx={{
											textTransform: "none",
											fontWeight: 600,
											minHeight: 60,
										}}
									/>
								</Tabs>
							</Box>

							{/* Donation History Tab */}
							<CustomTabPanel value={tabValue} index={0}>
								{user.donations?.length > 0 ? (
									<TableContainer>
										<Table>
											<TableHead>
												<TableRow>
													<TableCell>Campaign</TableCell>
													<TableCell>Jumlah</TableCell>
													<TableCell>Status</TableCell>
													<TableCell>Tanggal</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{user.donations.map((donation) => (
													<TableRow key={donation.id} hover>
														<TableCell>
															<Stack
																direction="row"
																spacing={2}
																alignItems="center"
															>
																<Avatar
																	src={donation.campaign.image || ""}
																	variant="rounded"
																	sx={{
																		width: 40,
																		height: 40,
																		bgcolor: "grey.200",
																	}}
																>
																	<CampaignIcon />
																</Avatar>
																<Box>
																	<Typography
																		variant="subtitle2"
																		noWrap
																		sx={{ maxWidth: 200 }}
																	>
																		{donation.campaign.title}
																	</Typography>
																	<Typography
																		variant="caption"
																		color="text.secondary"
																	>
																		ID: {donation.id.slice(-8)}
																	</Typography>
																</Box>
															</Stack>
														</TableCell>
														<TableCell sx={{ fontWeight: 600 }}>
															{formatCurrency(donation.amount)}
														</TableCell>
														<TableCell>
															<Chip
																label={donation.status}
																size="small"
																color={getStatusColor(donation.status) as any}
																variant="outlined"
																sx={{ fontWeight: 600, borderRadius: 1 }}
															/>
														</TableCell>
														<TableCell>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																{formatDate(donation.createdAt)}
															</Typography>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								) : (
									<Box sx={{ p: 4, textAlign: "center" }}>
										<Typography color="text.secondary">
											Belum ada riwayat donasi.
										</Typography>
									</Box>
								)}
							</CustomTabPanel>

							{/* Campaigns Tab */}
							<CustomTabPanel value={tabValue} index={1}>
								{user.campaigns?.length > 0 ? (
									<List disablePadding>
										{user.campaigns.map((campaign, index) => (
											<React.Fragment key={campaign.id}>
												<ListItem alignItems="flex-start" sx={{ px: 3, py: 2 }}>
													<ListItemAvatar>
														<Avatar
															sx={{
																bgcolor: alpha(
																	theme.palette.secondary.main,
																	0.1,
																),
																color: "secondary.main",
															}}
														>
															<CampaignIcon />
														</Avatar>
													</ListItemAvatar>
													<ListItemText
														primaryTypographyProps={{ component: "div" }}
														secondaryTypographyProps={{ component: "div" }}
														primary={
															<Typography
																variant="subtitle2"
																fontWeight={600}
																noWrap
															>
																{campaign.title}
															</Typography>
														}
														secondary={
															<Stack spacing={0.5} mt={0.5}>
																<Typography
																	variant="body2"
																	color="text.secondary"
																>
																	Target: {formatCurrency(campaign.target)} •
																	Kategori: {campaign.category.name}
																</Typography>
																<Typography
																	variant="caption"
																	color="text.secondary"
																>
																	Dibuat pada {formatDate(campaign.createdAt)}
																</Typography>
															</Stack>
														}
													/>
													<Chip
														label={campaign.status}
														color={getStatusColor(campaign.status) as any}
														size="small"
														sx={{ borderRadius: 1 }}
													/>
												</ListItem>
												{index < (user.campaigns?.length || 0) - 1 && (
													<Divider variant="inset" component="li" />
												)}
											</React.Fragment>
										))}
									</List>
								) : (
									<Box sx={{ p: 4, textAlign: "center" }}>
										<Typography color="text.secondary">
											Belum ada campaign yang dibuat.
										</Typography>
									</Box>
								)}
							</CustomTabPanel>

							{/* Verification Tab */}
							<CustomTabPanel value={tabValue} index={2}>
								{user.verificationRequests?.length > 0 ? (
									<List disablePadding>
										{user.verificationRequests.map((req, index) => (
											<React.Fragment key={req.id}>
												<ListItem alignItems="flex-start" sx={{ px: 3, py: 2 }}>
													<ListItemAvatar>
														<Avatar
															sx={{
																bgcolor: alpha(theme.palette.info.main, 0.1),
																color: "info.main",
															}}
														>
															<VerifiedUserIcon />
														</Avatar>
													</ListItemAvatar>
													<ListItemText
														primaryTypographyProps={{ component: "div" }}
														secondaryTypographyProps={{ component: "div" }}
														primary={
															<Stack
																direction="row"
																spacing={1}
																alignItems="center"
															>
																<Typography
																	variant="subtitle1"
																	fontWeight={600}
																>
																	Pengajuan Verifikasi {req.type}
																</Typography>
																<Chip
																	label={req.status}
																	size="small"
																	color={getStatusColor(req.status) as any}
																	sx={{
																		borderRadius: 1,
																		height: 20,
																		fontSize: "0.7rem",
																	}}
																/>
															</Stack>
														}
														secondary={
															<Stack spacing={1} mt={1}>
																<Typography
																	variant="body2"
																	color="text.secondary"
																>
																	Diajukan pada: {formatDate(req.createdAt)}
																</Typography>
																<Stack direction="row" spacing={1}>
																	{req.ktpPhotoUrl && (
																		<Button
																			variant="outlined"
																			size="small"
																			startIcon={<OpenInNewIcon />}
																			href={req.ktpPhotoUrl}
																			target="_blank"
																			sx={{
																				textTransform: "none",
																				borderRadius: 2,
																			}}
																		>
																			Lihat KTP
																		</Button>
																	)}
																	{req.selfieUrl && (
																		<Button
																			variant="outlined"
																			size="small"
																			startIcon={<OpenInNewIcon />}
																			href={req.selfieUrl}
																			target="_blank"
																			sx={{
																				textTransform: "none",
																				borderRadius: 2,
																			}}
																		>
																			Lihat Selfie
																		</Button>
																	)}
																</Stack>
															</Stack>
														}
													/>
												</ListItem>
												{index <
													(user.verificationRequests?.length || 0) - 1 && (
													<Divider variant="inset" component="li" />
												)}
											</React.Fragment>
										))}
									</List>
								) : (
									<Box sx={{ p: 4, textAlign: "center" }}>
										<Typography color="text.secondary">
											Belum ada riwayat pengajuan verifikasi.
										</Typography>
									</Box>
								)}
							</CustomTabPanel>
						</Paper>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
}
