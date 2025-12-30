"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CreditCardIcon from "@mui/icons-material/CreditCard";

import type { Campaign } from "@/types";
import { createDonation } from "@/actions/donation";

const PRIMARY = "#61ce70";

type Method = "EWALLET" | "VIRTUAL_ACCOUNT" | "TRANSFER";

const amountPresets = [10000, 25000, 50000, 100000];

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

function methodLabel(m: Method) {
	switch (m) {
		case "EWALLET":
			return "E-Wallet / QRIS";
		case "VIRTUAL_ACCOUNT":
			return "Virtual Account";
		case "TRANSFER":
			return "Transfer Bank";
	}
}

function methodSub(m: Method) {
	switch (m) {
		case "EWALLET":
			return "GoPay • OVO • DANA • ShopeePay";
		case "VIRTUAL_ACCOUNT":
			return "BCA • BRI • BNI • Mandiri";
		case "TRANSFER":
			return "Transfer Manual (Verifikasi Manual)";
	}
}

function CloseIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ color: "rgba(15,23,42,.65)" }}
		>
			<path d="M18 6 6 18" />
			<path d="M6 6l12 12" />
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ display: "block" }}
		>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	);
}


function Toggle({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<Box
			component="button"
			type="button"
			onClick={() => onChange(!checked)}
			sx={{
				width: 46,
				height: 28,
				borderRadius: 999,
				border: checked
					? "1px solid rgba(97,206,112,0.40)"
					: "1px solid rgba(15,23,42,0.12)",
				bgcolor: checked ? "rgba(97,206,112,0.35)" : "rgba(15,23,42,0.06)",
				position: "relative",
				cursor: "pointer",
				transition: "all 140ms ease",
			}}
			aria-pressed={checked}
		>
			<Box
				sx={{
					width: 22,
					height: 22,
					borderRadius: 999,
					bgcolor: "#fff",
					position: "absolute",
					top: 2.5,
					left: checked ? 22 : 3,
					boxShadow: "0 10px 18px rgba(15,23,42,.18)",
					transition: "left 140ms ease",
					display: "grid",
					placeItems: "center",
					color: checked ? "rgba(15,23,42,.70)" : "rgba(15,23,42,.35)",
				}}
			>
				{checked ? <CheckIcon /> : null}
			</Box>
		</Box>
	);
}

export default function QuickDonate({
	campaigns = [],
}: {
	campaigns?: Campaign[];
}) {
	const router = useRouter();
	console.log("QuickDonate campaigns:", campaigns.length, campaigns);

	const [selectedAmount, setSelectedAmount] = React.useState<number>(
		amountPresets[0]
	);
	const [custom, setCustom] = React.useState<string>("");
	const [method, setMethod] = React.useState<Method>("EWALLET");

	// bottom sheet state
	const [open, setOpen] = React.useState(false);
	const [campaignId, setCampaignId] = React.useState<string>("");

	// donor identity
	const [isAnonymous, setIsAnonymous] = React.useState<boolean>(true);
	const [donorName, setDonorName] = React.useState<string>("");
	const [donorPhone, setDonorPhone] = React.useState<string>("");
	const [message, setMessage] = React.useState<string>("");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");

	const selectedCampaign = React.useMemo(
		() => campaigns.find((c) => c.id === campaignId) ?? null,
		[campaignId, campaigns]
	);

	const finalAmount = React.useMemo(() => {
		const clean = custom.replace(/[^\d]/g, "");
		const n = clean ? Number(clean) : 0;
		if (custom.trim().length > 0) return isNaN(n) ? 0 : n;
		return selectedAmount;
	}, [custom, selectedAmount]);

	const isValid = finalAmount >= 10000;

	const displayName = React.useMemo(() => {
		if (isAnonymous) return "Anonim";
		const clean = donorName.trim();
		return clean.length ? clean : "Tanpa Nama";
	}, [isAnonymous, donorName]);

	const openSheet = () => {
		if (!isValid) return;
		setOpen(true);
	};

	const handleSubmit = async () => {
		if (!selectedCampaign) {
			setError("Pilih campaign terlebih dahulu");
			return;
		}
		if (!finalAmount || Number(finalAmount) < 1000) {
			setError("Minimal donasi Rp 1.000");
			return;
		}
		// Wajib nomor HP
		if (!donorPhone) {
			setError("Nomor HP wajib diisi");
			return;
		}
		// Nama wajib jika tidak anonim
		if (!isAnonymous && !donorName) {
			setError("Nama donatur wajib diisi");
			return;
		}

		setLoading(true);
		setError("");
		try {
			const res = await createDonation({
				campaignId: selectedCampaign.id,
				amount: Number(finalAmount),
				donorName: isAnonymous
					? "Hamba Allah"
					: (donorName || "Tanpa Nama"),
				donorPhone,
				message,
				isAnonymous,
				paymentMethod: method,
			});

			if (res.success) {
				const slug = selectedCampaign.slug || selectedCampaign.id;
				router.push(`/donasi/${slug}?donation_success=true`);
			} else {
				setError(res.error || "Gagal membuat donasi");
			}
		} catch (err) {
			setError("Terjadi kesalahan sistem");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box sx={{ px: 2, mt: 2, position: "relative" }}>
			<Box
				sx={{
					borderRadius: 1,
					bgcolor: "#fff",
					boxShadow: "0 20px 40px -4px rgba(0,0,0,0.12)",
					p: 2,
					border: "1px solid rgba(15,23,42,0.08)",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<Box
					sx={{
						position: "absolute",
						right: -40,
						bottom: -40,
						width: 160,
						height: 160,
						borderRadius: 999,
						bgcolor: "rgba(97,206,112,0.14)",
						pointerEvents: "none",
					}}
				/>

				{/* Header */}
				<Box
					sx={{
						position: "relative",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 1,
					}}
				>
					<Box>
						<Typography
							sx={{
								fontSize: 14.5,
								fontWeight: 1100,
								color: "#0f172a",
								lineHeight: 1.15,
							}}
						>
							Donasi Cepat
						</Typography>
					</Box>
				</Box>

				{/* Amount */}
				<Box sx={{ position: "relative", mt: 1.4 }}>
					<Typography
						sx={{ fontSize: 12, fontWeight: 1000, color: "rgba(15,23,42,.80)" }}
					>
						Nominal
					</Typography>

					<Box
						sx={{
							mt: 1,
							display: "flex",
							gap: 1,
							overflowX: "auto",
							pb: 0.5,
							"&::-webkit-scrollbar": { height: 0 },
						}}
					>
						{amountPresets.map((a) => {
							const active = custom.trim().length === 0 && selectedAmount === a;
							return (
								<Box
									key={a}
									component="button"
									type="button"
									onClick={() => {
										setCustom("");
										setSelectedAmount(a);
									}}
									sx={{
										flexShrink: 0,
										borderRadius: "12px",
										px: 1.5,
										py: 0.85,
										cursor: "pointer",
										fontWeight: 1100,
										fontSize: 12.5,
										border: active
											? "1px solid rgba(97,206,112,0.45)"
											: "1px solid rgba(15,23,42,0.10)",
										bgcolor: active
											? "rgba(97,206,112,0.12)"
											: "rgba(255,255,255,0.92)",
										color: "rgba(15,23,42,.82)",
										boxShadow: active
											? "0 16px 28px rgba(97,206,112,.10)"
											: "0 14px 22px rgba(15,23,42,.05)",
										"&:active": { transform: "scale(0.99)" },
									}}
								>
									Rp{rupiah(a)}
								</Box>
							);
						})}

						{/* Custom */}
						<Box
							sx={{
								flexShrink: 0,
								display: "flex",
								alignItems: "center",
								gap: 0.8,
								borderRadius: "12px",
								px: 1.2,
								py: 0.55,
								border:
									custom.trim().length > 0
										? "1px solid rgba(97,206,112,0.45)"
										: "1px solid rgba(15,23,42,0.10)",
								bgcolor: "rgba(255,255,255,0.92)",
								boxShadow: "0 14px 22px rgba(15,23,42,.05)",
							}}
						>
							<Typography
								sx={{
									fontSize: 12,
									fontWeight: 1000,
									color: "rgba(15,23,42,.55)",
								}}
							>
								Rp
							</Typography>
							<Box
								component="input"
								inputMode="numeric"
								placeholder="Custom"
								value={custom}
								onChange={(e) => setCustom(e.target.value)}
								style={{
									width: 86,
									outline: "none",
									border: "none",
									background: "transparent",
									fontWeight: 1100,
									fontSize: 12.5,
									color: "rgba(15,23,42,.82)",
								}}
							/>
						</Box>
					</Box>

					{!isValid && (
						<Typography
							sx={{
								mt: 0.75,
								fontSize: 11,
								color: "rgba(239,68,68,.90)",
								fontWeight: 900,
							}}
						>
							Minimal donasi Rp10.000
						</Typography>
					)}
				</Box>

				{/* CTA */}
				<Box sx={{ position: "relative", mt: 1.5 }}>
					<Box
						component="button"
						type="button"
						onClick={openSheet}
						disabled={!isValid}
						sx={{
							width: "100%",
							borderRadius: "16px",
							py: 1.2,
							border: "1px solid rgba(97,206,112,0.35)",
							bgcolor: isValid ? PRIMARY : "rgba(15,23,42,0.08)",
							color: isValid ? "#0b1220" : "rgba(15,23,42,.40)",
							fontWeight: 1100,
							fontSize: 13.5,
							cursor: isValid ? "pointer" : "not-allowed",
							boxShadow: isValid ? "0 16px 28px rgba(97,206,112,.22)" : "none",
							transition: "transform 120ms ease, filter 120ms ease",
							"&:active": { transform: isValid ? "scale(0.99)" : "none" },
						}}
					>
						Donasi Sekarang • Rp{rupiah(finalAmount || 0)}
					</Box>
				</Box>
			</Box>

			{/* Bottom sheet */}
			{open && (
				<Box sx={{ position: "fixed", inset: 0, zIndex: 2500 }}>
					{/* Backdrop */}
					<Box
						onClick={() => setOpen(false)}
						sx={{
							position: "absolute",
							inset: 0,
							bgcolor: "rgba(15,23,42,0.45)",
							backdropFilter: "blur(2px)",
						}}
					/>

					{/* Sheet */}
					<Box
						sx={{
							position: "fixed",
							left: { xs: 0, md: "50%" },
							right: { xs: 0, md: "auto" },
							bottom: { xs: 0, md: "auto" },
							top: { md: "50%" },
							transform: { md: "translate(-50%, -50%)" },
							borderTopLeftRadius: { xs: "16px", md: "16px" },
							borderTopRightRadius: { xs: "16px", md: "16px" },
							borderRadius: { md: "16px" },
							bgcolor: "#fff",
							boxShadow: {
								xs: "0 -18px 40px rgba(15,23,42,.22)",
								md: "0 18px 40px rgba(15,23,42,.22)",
							},
							width: {
								xs: "100%",
								sm: "calc(100% - 48px)",
								md: "420px",
							},
							maxHeight: {
								xs: "85vh",
								md: "70vh",
							},
							display: "flex",
							flexDirection: "column",
							mx: { xs: 0, sm: "auto", md: 0 },
							overflow: "hidden",
						}}
					>
						{/* Handle */}
						<Box sx={{ py: 1, display: "grid", placeItems: "center" }}>
							<Box
								sx={{
									width: 48,
									height: 5,
									borderRadius: 999,
									bgcolor: "rgba(15,23,42,0.10)",
								}}
							/>
						</Box>

						{/* Header */}
						<Box
							sx={{
								px: 2.2,
								pb: 1.2,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: 1,
							}}
						>
							<Box>
								<Typography
									sx={{ fontSize: 14.5, fontWeight: 1100, color: "#0f172a" }}
								>
									Konfirmasi Donasi
								</Typography>
							</Box>

							<Box
								component="button"
								type="button"
								onClick={() => setOpen(false)}
								sx={{
									width: 38,
									height: 38,
									borderRadius: 999,
									display: "grid",
									placeItems: "center",
									border: "1px solid rgba(15,23,42,0.10)",
									bgcolor: "rgba(15,23,42,0.02)",
									cursor: "pointer",
									"&:hover": { bgcolor: "rgba(15,23,42,0.04)" },
								}}
							>
								<CloseIcon />
							</Box>
						</Box>

						<Box sx={{ height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />

						{/* Content */}
						<Box sx={{ px: 2.2, py: 1.4, flex: 1, overflowY: "auto" }}>
							{/* Campaign Selection */}
							<Box sx={{ mb: 3 }}>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 1000,
										color: "rgba(15,23,42,.80)",
										mb: 1,
									}}
								>
									Pilih Campaign
								</Typography>
								<Autocomplete
									options={campaigns}
									getOptionLabel={(option) => option.title}
									isOptionEqualToValue={(option, value) => option.id === value.id}
									value={selectedCampaign}
									openOnFocus
									onChange={(_, newValue) => {
										setCampaignId(newValue ? newValue.id : "");
									}}
									slotProps={{
										popper: { sx: { zIndex: 2600 } }, // > 2500
										paper: { sx: { zIndex: 2600 } },
									}}
									renderOption={(props, option) => {
                                        const { key, ...otherProps } = props;
                                        return (
										<Box
											component="li"
											key={key}
                                            {...otherProps}
											sx={{
												display: "flex",
												gap: 1.5,
												alignItems: "center",
												borderBottom: "1px solid rgba(0,0,0,0.04)",
												p: "10px !important",
											}}
										>
											<Box
												component="img"
												src={option.cover || "https://placehold.co/100x100?text=No+Image"}
												alt={option.title}
												sx={{
													width: 48,
													height: 48,
													borderRadius: "8px",
													objectFit: "cover",
													flexShrink: 0,
													bgcolor: "#eee",
												}}
											/>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Typography
													sx={{
														fontSize: 13,
														fontWeight: 700,
														color: "#0f172a",
														whiteSpace: "nowrap",
														overflow: "hidden",
														textOverflow: "ellipsis",
														mb: 0.5,
													}}
												>
													{option.title}
												</Typography>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 1,
														flexWrap: "wrap",
													}}
												>
													{option.target ? (
														<Typography
															sx={{
																fontSize: 11,
																color: "rgba(15,23,42,0.6)",
															}}
														>
															Target: Rp{rupiah(option.target)}
														</Typography>
													) : null}

													{option.isEmergency ? (
														<Box
															sx={{
																px: 0.8,
																py: 0.2,
																borderRadius: "4px",
																bgcolor: "rgba(239,68,68,0.1)",
																color: "#ef4444",
																fontSize: 10,
																fontWeight: 700,
															}}
														>
															Mendesak
														</Box>
													) : (option.donors || 0) > 50 ? (
														<Box
															sx={{
																px: 0.8,
																py: 0.2,
																borderRadius: "4px",
																bgcolor: "rgba(245,158,11,0.1)",
																color: "#f59e0b",
																fontSize: 10,
																fontWeight: 700,
															}}
														>
															Populer
														</Box>
													) : (
														<Box
															sx={{
																px: 0.8,
																py: 0.2,
																borderRadius: "4px",
																bgcolor: "rgba(97,206,112,0.1)",
																color: PRIMARY,
																fontSize: 10,
																fontWeight: 700,
															}}
														>
															Normal
														</Box>
													)}
												</Box>
											</Box>
										</Box>
									)}}
									renderInput={(params) => (
										<TextField
											{...params}
											placeholder="Cari campaign..."
											sx={{
												"& .MuiOutlinedInput-root": {
													borderRadius: "12px",
													fontSize: "13px",
													padding: "4px !important",
												},
											}}
										/>
									)}
									disableClearable={false}
								/>
							</Box>

							{/* Summary Nominal */}
							<Box
								sx={{
									borderRadius: "12px",
									border: "1px solid rgba(15,23,42,0.10)",
									bgcolor: "#f8fafc",
									p: 1.5,
									mb: 3,
								}}
							>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<Typography
										sx={{
											fontSize: 12,
											fontWeight: 900,
											color: "rgba(15,23,42,.60)",
										}}
									>
										Nominal Donasi
									</Typography>
									<Typography
										sx={{ fontSize: 14, fontWeight: 1100, color: "#0f172a" }}
									>
										Rp{rupiah(finalAmount)}
									</Typography>
								</Box>
							</Box>

							{/* Identity */}
							<Box sx={{ mb: 3 }}>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 1000,
										color: "rgba(15,23,42,.80)",
										mb: 1,
									}}
								>
									Identitas Donatur
								</Typography>

								<Box
									sx={{
										borderRadius: "12px",
										border: "1px solid rgba(15,23,42,0.10)",
										bgcolor: "#fff",
										p: 1.5,
									}}
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											mb: 2,
										}}
									>
										<Box>
											<Typography
												sx={{
													fontSize: 12.5,
													fontWeight: 1100,
													color: "rgba(15,23,42,.85)",
												}}
											>
												Sembunyikan nama (Hamba Allah)
											</Typography>
										</Box>
										<Toggle
											checked={isAnonymous}
											onChange={(v) => {
												setIsAnonymous(v);
												if (v) {
													setDonorName("");
												}
											}}
										/>
									</Box>

									{!isAnonymous && (
										<TextField
											fullWidth
											placeholder="Nama Lengkap"
											value={donorName}
											onChange={(e) => setDonorName(e.target.value)}
											sx={{
												mb: 2,
												"& .MuiOutlinedInput-root": {
													borderRadius: "10px",
													fontSize: "13px",
												},
											}}
											size="small"
										/>
									)}

									<TextField
										fullWidth
										placeholder="Nomor WhatsApp / HP"
										value={donorPhone}
										onChange={(e) => setDonorPhone(e.target.value)}
										type="tel"
										sx={{
											"& .MuiOutlinedInput-root": {
												borderRadius: "10px",
												fontSize: "13px",
											},
										}}
										size="small"
									/>
								</Box>
							</Box>

							{/* Message */}
							<Box sx={{ mb: 3 }}>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 1000,
										color: "rgba(15,23,42,.80)",
										mb: 1,
									}}
								>
									Doa & Dukungan (Opsional)
								</Typography>
								<TextField
									fullWidth
									multiline
									rows={2}
									placeholder="Tulis doa atau dukungan..."
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: "12px",
											fontSize: "13px",
										},
									}}
								/>
							</Box>

							{/* Payment Method */}
							<Box sx={{ mb: 2 }}>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 1000,
										color: "rgba(15,23,42,.80)",
										mb: 1,
									}}
								>
									Metode Pembayaran
								</Typography>
								<FormControl component="fieldset" fullWidth>
									<RadioGroup
										value={method}
										onChange={(e) => setMethod(e.target.value as Method)}
									>
										{/* E-Wallet */}
										<Paper
											variant="outlined"
											sx={{
												mb: 1,
												borderRadius: "12px",
												border:
													method === "EWALLET"
														? `1px solid ${PRIMARY}`
														: "1px solid rgba(15,23,42,0.10)",
												bgcolor:
													method === "EWALLET"
														? "rgba(97,206,112,0.05)"
														: "transparent",
												overflow: "hidden",
											}}
										>
											<FormControlLabel
												value="EWALLET"
												control={
													<Radio
														size="small"
														sx={{
															color: PRIMARY,
															"&.Mui-checked": { color: PRIMARY },
														}}
													/>
												}
												label={
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1.5,
															py: 1,
														}}
													>
														<QrCodeIcon
															sx={{ color: "rgba(15,23,42,0.6)", fontSize: 20 }}
														/>
														<Box>
															<Typography sx={{ fontSize: 13, fontWeight: 700 }}>
																E-Wallet / QRIS
															</Typography>
															<Typography
																sx={{ fontSize: 11, color: "text.secondary" }}
															>
																GoPay, OVO, DANA, ShopeePay
															</Typography>
														</Box>
													</Box>
												}
												sx={{ width: "100%", m: 0, px: 1 }}
											/>
										</Paper>

										{/* Virtual Account */}
										<Paper
											variant="outlined"
											sx={{
												mb: 1,
												borderRadius: "12px",
												border:
													method === "VIRTUAL_ACCOUNT"
														? `1px solid ${PRIMARY}`
														: "1px solid rgba(15,23,42,0.10)",
												bgcolor:
													method === "VIRTUAL_ACCOUNT"
														? "rgba(97,206,112,0.05)"
														: "transparent",
												overflow: "hidden",
											}}
										>
											<FormControlLabel
												value="VIRTUAL_ACCOUNT"
												control={
													<Radio
														size="small"
														sx={{
															color: PRIMARY,
															"&.Mui-checked": { color: PRIMARY },
														}}
													/>
												}
												label={
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1.5,
															py: 1,
														}}
													>
														<AccountBalanceWalletIcon
															sx={{ color: "rgba(15,23,42,0.6)", fontSize: 20 }}
														/>
														<Box>
															<Typography sx={{ fontSize: 13, fontWeight: 700 }}>
																Virtual Account
															</Typography>
															<Typography
																sx={{ fontSize: 11, color: "text.secondary" }}
															>
																BCA, Mandiri, BNI, BRI
															</Typography>
														</Box>
													</Box>
												}
												sx={{ width: "100%", m: 0, px: 1 }}
											/>
										</Paper>

										{/* Transfer */}
										<Paper
											variant="outlined"
											sx={{
												mb: 1,
												borderRadius: "12px",
												border:
													method === "TRANSFER"
														? `1px solid ${PRIMARY}`
														: "1px solid rgba(15,23,42,0.10)",
												bgcolor:
													method === "TRANSFER"
														? "rgba(97,206,112,0.05)"
														: "transparent",
												overflow: "hidden",
											}}
										>
											<FormControlLabel
												value="TRANSFER"
												control={
													<Radio
														size="small"
														sx={{
															color: PRIMARY,
															"&.Mui-checked": { color: PRIMARY },
														}}
													/>
												}
												label={
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1.5,
															py: 1,
														}}
													>
														<CreditCardIcon
															sx={{ color: "rgba(15,23,42,0.6)", fontSize: 20 }}
														/>
														<Box>
															<Typography sx={{ fontSize: 13, fontWeight: 700 }}>
																Transfer Bank
															</Typography>
															<Typography
																sx={{ fontSize: 11, color: "text.secondary" }}
															>
																Verifikasi Manual
															</Typography>
														</Box>
													</Box>
												}
												sx={{ width: "100%", m: 0, px: 1 }}
											/>
										</Paper>
									</RadioGroup>
								</FormControl>
							</Box>
						</Box>

						{/* Footer actions */}
						<Box sx={{ px: 2.2, pb: 2, display: "grid", gap: 1 }}>
							<Button
								variant="contained"
								fullWidth
								size="large"
								onClick={handleSubmit}
								disabled={loading}
								sx={{
									borderRadius: 3,
									py: 1.15,
									bgcolor: PRIMARY,
									color: "#0b1220",
									fontWeight: 1100,
									fontSize: 13,
									boxShadow: "0 16px 28px rgba(97,206,112,.22)",
									"&:hover": { bgcolor: "#4bbf59" },
								}}
							>
								{loading ? (
									<CircularProgress size={24} color="inherit" />
								) : (
									"Lanjut Bayar"
								)}
							</Button>

							<Box
								component="button"
								type="button"
								onClick={() => setOpen(false)}
								sx={{
									width: "100%",
									borderRadius: 3,
									py: 1.1,
									border: "1px solid rgba(15,23,42,0.12)",
									bgcolor: "rgba(15,23,42,0.02)",
									color: "rgba(15,23,42,.78)",
									fontWeight: 1000,
									fontSize: 13,
									cursor: "pointer",
								}}
							>
								Nanti dulu
							</Box>
						</Box>
					</Box>
				</Box>
			)}
			<Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
				<Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
					{error}
				</Alert>
			</Snackbar>
		</Box>
	);
}
