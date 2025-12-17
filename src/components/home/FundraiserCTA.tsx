"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const PRIMARY = "#61ce70";

type Campaign = {
	id: string;
	title: string;
	organizer: string;
	cover: string; // nanti kalau mau tampil, sekarang cukup title aja
};

const campaigns: Campaign[] = [
	{
		id: "c1",
		title: "DARURAT! Bantu Korban Banjir Sumut, Aceh & Sumbar",
		organizer: "Rumah Zakat",
		cover: "/campaign/urgent-1.jpg",
	},
	{
		id: "c2",
		title: "Bantu Operasi Darurat untuk Pasien Tidak Mampu",
		organizer: "Yayasan Harapan",
		cover: "/campaign/urgent-2.jpg",
	},
	{
		id: "c3",
		title: "Beasiswa Anak Desa untuk Tetap Sekolah",
		organizer: "Relawan Pesona",
		cover: "/campaign/urgent-3.jpg",
	},
];

function MegaphoneIcon() {
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
			style={{ color: "rgba(15,23,42,.80)" }}
		>
			<path d="M3 11v2a2 2 0 0 0 2 2h1l4 6h2l-2-6h3l9 4V5l-9 4H5a2 2 0 0 0-2 2Z" />
			<path d="M16 10v4" />
		</svg>
	);
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

function LinkIcon() {
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
			<path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0 0-7.07 5 5 0 0 0-7.07 0L10 6" />
			<path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 0 0 0 7.07 5 5 0 0 0 7.07 0L14 18" />
		</svg>
	);
}

export default function FundraiserCTA() {
	const [open, setOpen] = React.useState(false);
	const [selectedId, setSelectedId] = React.useState<string>(
		campaigns[0]?.id ?? ""
	);
	const [generated, setGenerated] = React.useState<string>("");

	const selected = React.useMemo(
		() => campaigns.find((c) => c.id === selectedId) ?? campaigns[0],
		[selectedId]
	);

	const fundraiserLink = React.useMemo(() => {
		// dummy format — nanti ganti: baseUrl + /fundraiser/[slug]?ref=...
		const base = "https://pesonakebaikan.id";
		const ref = "rifk"; // nanti dari user profile / auth
		return `${base}/c/${selected?.id}?ref=${ref}`;
	}, [selected]);

	const onGenerate = () => {
		setGenerated(fundraiserLink);
		// nanti: call API create fundraiser page + return unique URL
	};

	const onCopy = async () => {
		if (!generated) return;
		try {
			await navigator.clipboard.writeText(generated);
			alert("Link berhasil disalin!");
		} catch {
			// fallback
			alert("Gagal salin otomatis. Salin manual ya.");
		}
	};

	return (
		<Box sx={{ px: 2.5, mt: 2.5 }}>
			{/* CTA card */}
			<Box
				sx={{
					borderRadius: { md: 1 },
					p: 1.6,
					border: "1px solid rgba(15,23,42,0.08)",
					background:
						"linear-gradient(135deg, rgba(97,206,112,0.18) 0%, rgba(255,255,255,0.96) 55%, rgba(15,23,42,0.02) 100%)",
					boxShadow: "0 18px 34px rgba(15,23,42,.06)",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<Box
					sx={{
						position: "absolute",
						right: -40,
						top: -40,
						width: 140,
						height: 140,
						borderRadius: 999,
						bgcolor: "rgba(97,206,112,0.18)",
						pointerEvents: "none",
					}}
				/>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1.25,
						position: "relative",
					}}
				>
					<Box
						sx={{
							width: 44,
							height: 44,
							borderRadius: "12px",
							display: "grid",
							placeItems: "center",
							bgcolor: "rgba(97,206,112,0.16)",
							border: "1px solid rgba(97,206,112,0.26)",
							boxShadow: "0 14px 26px rgba(97,206,112,.10)",
							flexShrink: 0,
						}}
					>
						<MegaphoneIcon />
					</Box>

					<Box sx={{ minWidth: 0, flex: 1 }}>
						<Typography
							sx={{
								fontSize: 14.5,
								fontWeight: 1000,
								color: "#0f172a",
								lineHeight: 1.15,
							}}
						>
							Bantu sebarkan campaign, jadi fundraiser
						</Typography>
						<Typography
							sx={{
								mt: 0.6,
								fontSize: 11.5,
								color: "rgba(15,23,42,.60)",
								lineHeight: 1.25,
							}}
						>
							Kamu ajak teman donasi lewat link kamu. Dana tetap masuk ke
							campaign induk.
						</Typography>
					</Box>

					<Box
						component="button"
						type="button"
						onClick={() => setOpen(true)}
						sx={{
							flexShrink: 0,
							borderRadius: 999,
							px: 2.1,
							py: 1.05,
							border: "1px solid rgba(97,206,112,0.35)",
							bgcolor: PRIMARY,
							color: "#0b1220",
							fontWeight: 1100,
							fontSize: 12.5,
							cursor: "pointer",
							boxShadow: "0 16px 28px rgba(97,206,112,.22)",
							transition: "transform 120ms ease, filter 120ms ease",
							"&:hover": { filter: "brightness(0.98)" },
							"&:active": { transform: "scale(0.99)" },
						}}
					>
						Mulai
					</Box>
				</Box>

				<Box
					sx={{
						mt: 1.25,
						display: "flex",
						alignItems: "center",
						gap: 0.8,
						position: "relative",
					}}
				>
					<Box
						sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: PRIMARY }}
					/>
					<Typography sx={{ fontSize: 11, color: "rgba(15,23,42,.55)" }}>
						Cocok buat relawan, komunitas, atau siapa saja yang mau bantu
						viral-in kebaikan.
					</Typography>
				</Box>
			</Box>

			{/* Bottom sheet */}
			{open && (
				<Box
					sx={{
						position: "fixed",
						inset: 0,
						zIndex: 2000,
					}}
				>
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
							position: "absolute",
							left: 0,
							right: 0,
							bottom: 0,
							borderTopLeftRadius: 18,
							borderTopRightRadius: 18,
							bgcolor: "#fff",
							boxShadow: "0 -18px 40px rgba(15,23,42,.22)",
							maxWidth: 420,
							mx: "auto",
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
								pb: 1.4,
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
									Mulai jadi Fundraiser
								</Typography>
								<Typography
									sx={{ mt: 0.35, fontSize: 11.5, color: "rgba(15,23,42,.60)" }}
								>
									Pilih campaign, lalu buat link ajakan donasi.
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
						<Box sx={{ px: 2.2, py: 1.6 }}>
							{/* Campaign picker */}
							<Typography
								sx={{
									fontSize: 12,
									fontWeight: 1000,
									color: "rgba(15,23,42,.80)",
								}}
							>
								Pilih campaign
							</Typography>

							<Box sx={{ mt: 1, display: "grid", gap: 1 }}>
								{campaigns.map((c) => {
									const active = c.id === selectedId;

									return (
										<Box
											key={c.id}
											component="button"
											type="button"
											onClick={() => {
												setSelectedId(c.id);
												setGenerated(""); // reset link hasil generate
											}}
											sx={{
												textAlign: "left",
												width: "100%",
												borderRadius: 3,
												p: 1.2,
												cursor: "pointer",
												border: active
													? "1px solid rgba(97,206,112,0.45)"
													: "1px solid rgba(15,23,42,0.10)",
												bgcolor: active
													? "rgba(97,206,112,0.10)"
													: "rgba(15,23,42,0.02)",
												boxShadow: active
													? "0 16px 28px rgba(97,206,112,.10)"
													: "none",
												transition: "transform 120ms ease",
												"&:active": { transform: "scale(0.995)" },
											}}
										>
											<Typography
												sx={{
													fontSize: 12.5,
													fontWeight: 1100,
													color: "#0f172a",
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
													lineHeight: 1.2,
												}}
											>
												{c.title}
											</Typography>
											<Typography
												sx={{
													mt: 0.5,
													fontSize: 11,
													color: "rgba(15,23,42,.60)",
												}}
											>
												{c.organizer}
											</Typography>
										</Box>
									);
								})}
							</Box>

							{/* Link preview */}
							<Box sx={{ mt: 1.6 }}>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 1000,
										color: "rgba(15,23,42,.80)",
									}}
								>
									Link fundraiser
								</Typography>

								<Box
									sx={{
										mt: 0.9,
										display: "flex",
										alignItems: "center",
										gap: 1,
										borderRadius: 3,
										p: 1.1,
										border: "1px solid rgba(15,23,42,0.10)",
										bgcolor: "rgba(255,255,255,0.92)",
									}}
								>
									<LinkIcon />
									<Typography
										sx={{
											fontSize: 11.5,
											fontWeight: 900,
											color: "rgba(15,23,42,.70)",
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
											flex: 1,
										}}
										title={generated || fundraiserLink}
									>
										{generated || fundraiserLink}
									</Typography>
								</Box>

								<Typography
									sx={{ mt: 0.75, fontSize: 11, color: "rgba(15,23,42,.55)" }}
								>
									Dana tetap masuk ke <b>campaign induk</b>. Kamu hanya membantu
									penyebaran.
								</Typography>
							</Box>
						</Box>

						{/* Footer actions */}
						<Box sx={{ px: 2.2, pb: 2, display: "grid", gap: 1 }}>
							<Box
								component="button"
								type="button"
								onClick={onGenerate}
								sx={{
									width: "100%",
									borderRadius: 3,
									py: 1.15,
									border: "1px solid rgba(97,206,112,0.35)",
									bgcolor: PRIMARY,
									color: "#0b1220",
									fontWeight: 1100,
									fontSize: 13,
									cursor: "pointer",
									boxShadow: "0 16px 28px rgba(97,206,112,.22)",
									"&:active": { transform: "scale(0.99)" },
								}}
							>
								Buat Link Fundraiser
							</Box>

							<Box
								component="button"
								type="button"
								onClick={onCopy}
								disabled={!generated}
								sx={{
									width: "100%",
									borderRadius: 3,
									py: 1.1,
									border: "1px solid rgba(15,23,42,0.12)",
									bgcolor: generated
										? "rgba(15,23,42,0.02)"
										: "rgba(15,23,42,0.01)",
									color: generated
										? "rgba(15,23,42,.78)"
										: "rgba(15,23,42,.35)",
									fontWeight: 1000,
									fontSize: 13,
									cursor: generated ? "pointer" : "not-allowed",
								}}
							>
								Salin Link
							</Box>
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
}
