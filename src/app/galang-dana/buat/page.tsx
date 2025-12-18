"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
	Box,
	Paper,
	Typography,
	IconButton,
	Stack,
	Divider,
	TextField,
	Button,
	RadioGroup,
	FormControlLabel,
	Radio,
	Checkbox,
	Dialog,
	Snackbar,
	Alert,
	Chip,
	InputAdornment,
} from "@mui/material";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";

type StepKey =
	| "tujuan"
	| "detail"
	| "riwayat"
	| "target"
	| "judul"
	| "cerita"
	| "ajakan";

const STEPS: { key: StepKey; label: string }[] = [
	{ key: "tujuan", label: "Tujuan" },
	{ key: "detail", label: "Detail pasien" },
	{ key: "riwayat", label: "Riwayat medis" },
	{ key: "target", label: "Target donasi" },
	{ key: "judul", label: "Judul" },
	{ key: "cerita", label: "Cerita" },
	{ key: "ajakan", label: "Ajakan" },
];

function onlyDigits(v: string) {
	return v.replace(/[^\d]/g, "");
}
function formatIDR(numStr: string) {
	const n = onlyDigits(numStr);
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function BuatGalangDanaPage() {
	const router = useRouter();
	const sp = useSearchParams();
	const type = sp.get("type") ?? "lainnya";

	// kalau bukan sakit, untuk sementara redirect ke kategori
	React.useEffect(() => {
		if (type !== "sakit") router.replace("/galang-dana/kategori");
	}, [type, router]);

	const [step, setStep] = React.useState(0);

	// Step 1 (Tujuan)
	const [who, setWho] = React.useState<string>("");
	const [phone, setPhone] = React.useState("");
	const [bank, setBank] = React.useState<string>(""); // pasien / kk / beda / rs
	const [openTerms, setOpenTerms] = React.useState(false);

	const [t1, setT1] = React.useState(false);
	const [t2, setT2] = React.useState(false);
	const [t3, setT3] = React.useState(false);
	const [t4, setT4] = React.useState(false);

	// Step 2
	const [patientName, setPatientName] = React.useState("");
	const [patientAge, setPatientAge] = React.useState("");
	const [patientGender, setPatientGender] = React.useState<"L" | "P" | "">("");
	const [patientCity, setPatientCity] = React.useState("");

	// Step 3
	const [inpatient, setInpatient] = React.useState<"ya" | "tidak" | "">("");
	const [treatment, setTreatment] = React.useState("");
	const [prevCost, setPrevCost] = React.useState<"mandiri" | "asuransi" | "">(
		""
	);

	// Step 4
	const [target, setTarget] = React.useState("");
	const [duration, setDuration] = React.useState<
		"30" | "60" | "120" | "custom" | ""
	>("");
	const [usage, setUsage] = React.useState("");

	// Step 5
	const [title, setTitle] = React.useState("");
	const [slug, setSlug] = React.useState("");
	const [coverName, setCoverName] = React.useState<string>("");

	// Step 6
	const [story, setStory] = React.useState("");
	const [showStoryEditor, setShowStoryEditor] = React.useState(false);

	// Step 7
	const [cta, setCta] = React.useState("");
	const ctaLeft = 160 - cta.length;

	const [snack, setSnack] = React.useState<{
		open: boolean;
		msg: string;
		type: "success" | "info";
	}>({ open: false, msg: "", type: "info" });

	const stepKey = STEPS[step]?.key;

	const canOpenConfirm = !!who && phone.trim().length >= 8 && !!bank;

	const canNext = React.useMemo(() => {
		if (stepKey === "tujuan") return canOpenConfirm; // tapi akan lewat dialog terms
		if (stepKey === "detail")
			return !!patientName && !!patientAge && !!patientGender;
		if (stepKey === "riwayat")
			return !!inpatient && treatment.trim().length >= 10 && !!prevCost;
		if (stepKey === "target")
			return !!onlyDigits(target) && !!duration && usage.trim().length >= 10;
		if (stepKey === "judul") return !!title && !!slug;
		if (stepKey === "cerita") return story.trim().length >= 30;
		if (stepKey === "ajakan") return cta.trim().length >= 10;
		return false;
	}, [
		stepKey,
		canOpenConfirm,
		patientName,
		patientAge,
		patientGender,
		inpatient,
		treatment,
		prevCost,
		target,
		duration,
		usage,
		title,
		slug,
		story,
		cta,
	]);

	const goPrev = () => setStep((s) => Math.max(0, s - 1));
	const goNext = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));

	const onClickNext = () => {
		if (stepKey === "tujuan") {
			setOpenTerms(true);
			return;
		}
		if (stepKey === "ajakan") {
			setSnack({
				open: true,
				msg: "Draft galang dana medis tersimpan (dummy).",
				type: "success",
			});
			return;
		}
		goNext();
	};

	const allTermsOk = t1 && t2 && t3 && t4;

	return (
		<Box sx={{ pb: "calc(88px + env(safe-area-inset-bottom))" }}>
			{/* Header */}
			<Paper
				elevation={0}
				sx={{
					borderRadius: 0,
					bgcolor: "primary.main",
					color: "primary.contrastText",
					px: 1,
					py: 1.25,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<IconButton
						onClick={() => router.back()}
						sx={{ color: "primary.contrastText" }}
					>
						<ArrowBackIosNewRoundedIcon fontSize="small" />
					</IconButton>

					<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
						Bantuan Medis & Kesehatan
					</Typography>
				</Box>
			</Paper>

			{/* Step bar (scrollable) */}
			<Box sx={{ px: 2, pt: 1.25, pb: 1 }}>
				<Box
					sx={{
						display: "flex",
						gap: 1,
						overflowX: "auto",
						pb: 0.5,
						"&::-webkit-scrollbar": { display: "none" },
					}}
				>
					{STEPS.map((s, i) => {
						const active = i === step;
						const done = i < step;
						return (
							<Chip
								key={s.key}
								onClick={() => setStep(i)}
								clickable
								label={
									<Box
										sx={{
											display: "inline-flex",
											alignItems: "center",
											gap: 0.8,
										}}
									>
										<Box
											sx={{
												width: 20,
												height: 20,
												borderRadius: 999,
												display: "grid",
												placeItems: "center",
												fontWeight: 700,
												fontSize: 12,
												bgcolor: active
													? "primary.main"
													: done
													? "rgba(2,132,199,.18)"
													: "rgba(15,23,42,.08)",
												color: active ? "primary.contrastText" : "text.primary",
											}}
										>
											{i + 1}
										</Box>
										<Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
											{s.label}
										</Typography>
									</Box>
								}
								variant={active ? "filled" : "outlined"}
								color={active ? "primary" : "default"}
								sx={{ borderRadius: 999 }}
							/>
						);
					})}
				</Box>

				<Divider sx={{ mt: 1 }} />
			</Box>

			{/* Content */}
			<Box sx={{ px: 2 }}>
				{stepKey === "tujuan" && (
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
							Siapa yang sakit?
						</Typography>

						<RadioGroup value={who} onChange={(e) => setWho(e.target.value)}>
							<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
								<FormControlLabel
									value="self"
									control={<Radio size="small" />}
									label="Saya sendiri"
									sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
								/>
							</Paper>

							<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
								<FormControlLabel
									value="kk"
									control={<Radio size="small" />}
									label="Keluarga yang satu KK dengan saya"
									sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
								/>
							</Paper>

							<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
								<FormControlLabel
									value="beda_kk"
									control={<Radio size="small" />}
									label="Keluarga inti (ayah/ibu/kakak/adik/anak) yang sudah pisah KK dengan saya"
									sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
								/>
							</Paper>

							<Paper variant="outlined" sx={{ borderRadius: 2 }}>
								<FormControlLabel
									value="other"
									control={<Radio size="small" />}
									label="Selain pilihan di atas"
									sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
								/>
							</Paper>
						</RadioGroup>

						<Box sx={{ mt: 2 }}>
							<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
								Masukkan no. ponsel kamu
							</Typography>
							<Typography
								sx={{ color: "text.secondary", fontSize: 12.5, mb: 1 }}
							>
								Seluruh notifikasi akan dikirim melalui nomor ini
							</Typography>

							<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
								value={phone}
								onChange={(e) => setPhone(onlyDigits(e.target.value))}
								fullWidth
								placeholder="Pastikan nomor aktif memiliki WA"
								inputMode="numeric"
							/>
						</Box>

						<Box sx={{ mt: 2 }}>
							<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
								Pilih rekening bank penggalangan dana
							</Typography>
							<Typography
								sx={{ color: "text.secondary", fontSize: 12.5, mb: 1 }}
							>
								Donasi hanya bisa dicairkan ke rekening ini.
							</Typography>

							<Stack spacing={1}>
								<Paper variant="outlined" sx={{ borderRadius: 2 }}>
									<FormControlLabel
										sx={{ px: 1.5, py: 0.5, width: "100%", '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
										control={
											<Checkbox
												checked={bank === "pasien"}
												onChange={() => setBank("pasien")}
											/>
										}
										label="Pasien langsung"
									/>
								</Paper>

								<Paper variant="outlined" sx={{ borderRadius: 2 }}>
									<FormControlLabel
										sx={{ px: 1.5, py: 0.5, width: "100%", '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
										control={
											<Checkbox
												checked={bank === "kk"}
												onChange={() => setBank("kk")}
											/>
										}
										label="Keluarga satu KK"
									/>
								</Paper>

								<Paper variant="outlined" sx={{ borderRadius: 2 }}>
									<FormControlLabel
										sx={{ px: 1.5, py: 0.5, width: "100%", '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
										control={
											<Checkbox
												checked={bank === "beda_kk"}
												onChange={() => setBank("beda_kk")}
											/>
										}
										label="Keluarga inti berbeda KK"
									/>
								</Paper>

								<Paper variant="outlined" sx={{ borderRadius: 2 }}>
									<FormControlLabel
										sx={{ px: 1.5, py: 0.5, width: "100%", '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
										control={
											<Checkbox
												checked={bank === "rs"}
												onChange={() => setBank("rs")}
											/>
										}
										label="Rumah sakit"
									/>
								</Paper>
							</Stack>
						</Box>
					</Box>
				)}

				{stepKey === "detail" && (
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
							Detail pasien
						</Typography>

						<Stack spacing={1.25}>
							<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
								label="Nama pasien"
								value={patientName}
								onChange={(e) => setPatientName(e.target.value)}
								fullWidth
							/>
							<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
								label="Usia pasien"
								value={patientAge}
								onChange={(e) => setPatientAge(onlyDigits(e.target.value))}
								inputMode="numeric"
								fullWidth
							/>
							<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
								label="Domisili pasien (kota/kab)"
								value={patientCity}
								onChange={(e) => setPatientCity(e.target.value)}
								fullWidth
							/>

							<Paper variant="outlined" sx={{ borderRadius: 2, p: 1 }}>
								<Typography sx={{ fontWeight: 600, mb: 0.5 }}>
									Jenis kelamin
								</Typography>
								<RadioGroup
									row
									value={patientGender}
									onChange={(e) => setPatientGender(e.target.value as any)}
								>
									<FormControlLabel
										value="L"
										control={<Radio size="small" />}
										label="Laki-laki"
									/>
									<FormControlLabel
										value="P"
										control={<Radio size="small" />}
										label="Perempuan"
									/>
								</RadioGroup>
							</Paper>
						</Stack>
					</Box>
				)}

				{stepKey === "riwayat" && (
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
							Apakah pasien sedang menjalani rawat inap di rumah sakit?
						</Typography>

						<RadioGroup
							value={inpatient}
							onChange={(e) => setInpatient(e.target.value as any)}
						>
							<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
								<FormControlLabel
									value="ya"
									control={<Radio size="small" />}
									label="Ya, sedang rawat inap"
									sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
								/>
							</Paper>
							<Paper variant="outlined" sx={{ borderRadius: 2 }}>
								<FormControlLabel
									value="tidak"
									control={<Radio size="small" />}
									label="Tidak"
									sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
								/>
							</Paper>
						</RadioGroup>

						<Box sx={{ mt: 2 }}>
							<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
								Upaya pengobatan yang sudah atau sedang dilakukan
							</Typography>
							<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
								value={treatment}
								onChange={(e) => setTreatment(e.target.value)}
								fullWidth
								multiline
								minRows={4}
								placeholder="Jelaskan secara lengkap upaya apa yang dilakukan dan tempat dilakukan (cth: operasi, kontrol, terapi, dll)"
							/>
						</Box>

						<Box sx={{ mt: 2 }}>
							<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
								Dari mana sumber biaya pengobatan/perawatan sebelumnya?
							</Typography>

							<RadioGroup
								value={prevCost}
								onChange={(e) => setPrevCost(e.target.value as any)}
							>
								<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
									<FormControlLabel
										value="mandiri"
										control={<Radio size="small" />}
										label="Biaya mandiri"
										sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
									/>
								</Paper>
								<Paper variant="outlined" sx={{ borderRadius: 2 }}>
									<FormControlLabel
										value="asuransi"
										control={<Radio size="small" />}
										label="Asuransi (BPJS dan/atau swasta)"
										sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
									/>
								</Paper>
							</RadioGroup>
						</Box>
					</Box>
				)}

				{stepKey === "target" && (
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
							Tentukan perkiraan biaya yang dibutuhkan
						</Typography>

						<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
							value={formatIDR(target)}
							onChange={(e) => setTarget(e.target.value)}
							fullWidth
							placeholder="Masukkan jumlah kebutuhan biaya"
							inputMode="numeric"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">Rp</InputAdornment>
								),
							}}
						/>

						<Box sx={{ mt: 2 }}>
							<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
								Tentukan lama galang dana berlangsung
							</Typography>

							<RadioGroup
								value={duration}
								onChange={(e) => setDuration(e.target.value as any)}
							>
								<Stack spacing={1}>
									<Paper variant="outlined" sx={{ borderRadius: 2 }}>
										<FormControlLabel
											value="30"
											control={<Radio size="small" />}
											label="30 hari"
											sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
										/>
									</Paper>
									<Paper variant="outlined" sx={{ borderRadius: 2 }}>
										<FormControlLabel
											value="60"
											control={<Radio size="small" />}
											label="60 hari"
											sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
										/>
									</Paper>
									<Paper variant="outlined" sx={{ borderRadius: 2 }}>
										<FormControlLabel
											value="120"
											control={<Radio size="small" />}
											label="120 hari"
											sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
										/>
									</Paper>
									<Paper variant="outlined" sx={{ borderRadius: 2 }}>
										<FormControlLabel
											value="custom"
											control={<Radio size="small" />}
											label="pilih tanggal"
											sx={{ px: 1.5, py: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
										/>
									</Paper>
								</Stack>
							</RadioGroup>
						</Box>

						<Box sx={{ mt: 2 }}>
							<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
								Isi rincian penggunaan dana
							</Typography>
							<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
								value={usage}
								onChange={(e) => setUsage(e.target.value)}
								fullWidth
								multiline
								minRows={4}
								placeholder="Contoh: vitamin Rp2.000.000, rawat inap 10 hari Rp5.000.000, operasi Rp20.000.000"
							/>
						</Box>
					</Box>
				)}

				{stepKey === "judul" && (
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
							Beri judul untuk galang dana ini
						</Typography>

						<Stack spacing={1.25}>
							<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								fullWidth
								placeholder="Contoh: Bantu Abi melawan kanker hati"
							/>

							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
									Tentukan link untuk galang dana ini
								</Typography>
								<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
									value={slug}
									onChange={(e) =>
										setSlug(e.target.value.replace(/\s+/g, "").toLowerCase())
									}
									fullWidth
									placeholder="contoh: bantudolawan..."
								/>
							</Box>

							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
									Upload foto galang dana
								</Typography>

								<Paper
									variant="outlined"
									sx={{
										borderRadius: 3,
										p: 1.25,
										textAlign: "center",
									}}
								>
									<input
										id="cover-upload"
										type="file"
										accept="image/*"
										hidden
										onChange={(e) =>
											setCoverName(e.target.files?.[0]?.name ?? "")
										}
									/>
									<Button
										component="label"
										htmlFor="cover-upload"
										startIcon={<PhotoCameraRoundedIcon />}
										variant="text"
										sx={{ fontWeight: 700 }}
									>
										Upload Foto
									</Button>

									{coverName ? (
										<Typography
											sx={{ mt: 0.75, fontSize: 12.5, color: "text.secondary" }}
										>
											Terpilih: <b>{coverName}</b>
										</Typography>
									) : null}
								</Paper>

								<Paper
									elevation={0}
									sx={{
										mt: 1.25,
										p: 1,
										borderRadius: 2,
										bgcolor: "rgba(2,132,199,.06)",
										display: "flex",
										gap: 1,
										alignItems: "flex-start",
									}}
								>
									<InfoOutlinedIcon fontSize="small" sx={{ mt: "2px" }} />
									<Box>
										<Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
											Tips
										</Typography>
										<Typography
											sx={{ fontSize: 12.5, color: "text.secondary" }}
										>
											Upload foto yang menggambarkan keadaan pasien saat ini.
										</Typography>
									</Box>
								</Paper>
							</Box>
						</Stack>
					</Box>
				)}

				{stepKey === "cerita" && (
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
							Tuliskan cerita tentang galang dana ini
						</Typography>

						<Paper
							elevation={0}
							sx={{
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								p: 1.25,
							}}
						>
							<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
								Kenapa cerita itu penting?
							</Typography>
							<Typography
								sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.25 }}
							>
								Cerita yang lengkap biasanya lebih dipercaya dan peluang
								donasinya lebih tinggi.
							</Typography>

							<Button
								variant="contained"
								fullWidth
								onClick={() => setShowStoryEditor(true)}
								sx={{ borderRadius: 2, fontWeight: 700, py: 1.15 }}
							>
								Buat cerita galang dana
							</Button>
						</Paper>

						{showStoryEditor && (
							<Box sx={{ mt: 1.5 }}>
								<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
									value={story}
									onChange={(e) => setStory(e.target.value)}
									fullWidth
									multiline
									minRows={8}
									placeholder="Tulis kronologi, kondisi pasien, kebutuhan biaya, rencana penggunaan dana, dan ajakan..."
								/>
							</Box>
						)}
					</Box>
				)}

				{stepKey === "ajakan" && (
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
							Tulis ajakan singkat untuk donasi di galang dana ini
						</Typography>

						<TextField size="small" sx={{ '& .MuiInputBase-input': { fontSize: 13.5 }, '& .MuiInputLabel-root': { fontSize: 13.5 } }}
							value={cta}
							onChange={(e) => setCta(e.target.value.slice(0, 160))}
							fullWidth
							multiline
							minRows={4}
							placeholder="Contoh: Penghasilan saya hanya Rp20rb/hari, padahal Abi butuh biaya berobat..."
						/>

						<Typography
							sx={{
								mt: 0.75,
								fontSize: 12.5,
								color: ctaLeft < 0 ? "error.main" : "text.secondary",
							}}
						>
							{cta.length}/160
						</Typography>

						<Paper
							elevation={0}
							sx={{
								mt: 1.25,
								p: 1,
								borderRadius: 2,
								bgcolor: "background.paper",
								border: "1px solid",
								borderColor: "divider",
							}}
						>
							<Typography sx={{ fontWeight: 600, fontSize: 12.5, mb: 0.5 }}>
								Apa gunanya ajakan singkat?
							</Typography>
							<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
								Ajakan singkat dipakai saat kamu membagikan galang dana ke media
								sosial.
							</Typography>
						</Paper>
					</Box>
				)}
			</Box>

			{/* Bottom actions (tetap di atas bottom nav app kamu) */}
			<Paper
				elevation={0}
				sx={{
					position: "fixed",
					left: 0,
					right: 0,
					maxWidth: 480,
					mx: "auto",
					bottom: "calc(64px + env(safe-area-inset-bottom))", // jangan nutup bottom nav
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
					zIndex: 99,
				}}
			>
				<Box sx={{ maxWidth: 480, mx: "auto", px: 2, py: 1.25 }}>
					<Stack direction="row" spacing={1}>
						<Button
							onClick={goPrev}
							variant="text"
							startIcon={<ChevronLeftRoundedIcon />}
							sx={{ fontWeight: 600 }}
							disabled={step === 0}
						>
							Sebelumnya
						</Button>

						<Box sx={{ flex: 1 }} />

						<Button
							onClick={onClickNext}
							variant="contained"
							endIcon={<ChevronRightRoundedIcon />}
							sx={{ borderRadius: 2, fontWeight: 700, px: 2.25 }}
							disabled={!canNext}
						>
							{stepKey === "ajakan" ? "Selesai" : "Selanjutnya"}
						</Button>
					</Stack>

					<Button
						onClick={() =>
							setSnack({ open: true, msg: "Disimpan (dummy).", type: "info" })
						}
						variant="text"
						fullWidth
						sx={{ mt: 0.5, fontWeight: 600, color: "text.secondary" }}
					>
						Simpan dan lanjutkan nanti
					</Button>
				</Box>
			</Paper>

			{/* Dialog konfirmasi terms (mirip screenshot overlay) */}
			<Dialog
				open={openTerms}
				onClose={() => setOpenTerms(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: {
						borderRadius: 3,
						maxWidth: 480,
						mx: "auto",
						width: "100%",
						overflow: "hidden",
					},
				}}
			>
				<Box sx={{ p: 1.25 }}>
					<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
						Baca dan beri tanda syarat penggalangan di bawah ini
					</Typography>

					<Stack spacing={1}>
						<FormControlLabel
							control={
								<Checkbox
									checked={t1}
									onChange={(e) => setT1(e.target.checked)}
								/>
							}
							label="Pemilik rekening bertanggung jawab atas penggunaan dana yang diterima dari galang dana ini."
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={t2}
									onChange={(e) => setT2(e.target.checked)}
								/>
							}
							label="Kamu sebagai penggalang dana bertanggung jawab atas permintaan pencairan dan pelaporan penggunaan dana."
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={t3}
									onChange={(e) => setT3(e.target.checked)}
								/>
							}
							label="Pasien dan/atau keluarga benar-benar membutuhkan biaya dari galang dana ini."
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={t4}
									onChange={(e) => setT4(e.target.checked)}
								/>
							}
							label="Pasien dan keluarga satu KK pasien menyetujui pembuatan galang dana ini."
						/>
					</Stack>

					<Stack direction="row" spacing={1} sx={{ mt: 2 }}>
						<Button
							variant="text"
							onClick={() => setOpenTerms(false)}
							sx={{ fontWeight: 600 }}
						>
							Kembali
						</Button>
						<Box sx={{ flex: 1 }} />
						<Button
							variant="contained"
							disabled={!allTermsOk}
							onClick={() => {
								setOpenTerms(false);
								goNext();
							}}
							sx={{ borderRadius: 2, fontWeight: 700 }}
						>
							Saya setuju
						</Button>
					</Stack>
				</Box>
			</Dialog>

			{/* Toast */}
			<Snackbar
				open={snack.open}
				autoHideDuration={2200}
				onClose={() => setSnack((s) => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					severity={snack.type}
					variant="filled"
					onClose={() => setSnack((s) => ({ ...s, open: false }))}
					sx={{ borderRadius: 3 }}
				>
					{snack.msg}
				</Alert>
			</Snackbar>
		</Box>
	);
}
