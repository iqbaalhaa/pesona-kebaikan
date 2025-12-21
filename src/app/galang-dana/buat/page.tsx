"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

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
	ButtonBase,
} from "@mui/material";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";

import { createCampaign } from "@/actions/campaign";
import { CATEGORY_TITLE } from "@/lib/constants";

type StepKeySakit =
	| "tujuan"
	| "detail"
	| "riwayat"
	| "target"
	| "judul"
	| "cerita"
	| "ajakan";

const STEPS_SAKIT: { key: StepKeySakit; label: string }[] = [
	{ key: "tujuan", label: "Tujuan" },
	{ key: "detail", label: "Detail pasien" },
	{ key: "riwayat", label: "Riwayat medis" },
	{ key: "target", label: "Target donasi" },
	{ key: "judul", label: "Judul" },
	{ key: "cerita", label: "Cerita" },
	{ key: "ajakan", label: "Ajakan" },
];

type StepKeyLainnya =
	| "tujuan"
	| "data_diri"
	| "penerima"
	| "target"
	| "judul"
	| "cerita"
	| "ajakan";

const STEPS_LAINNYA: { key: StepKeyLainnya; label: string }[] = [
	{ key: "tujuan", label: "Tujuan" },
	{ key: "data_diri", label: "Data diri" },
	{ key: "penerima", label: "Penerima" },
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

function BuatGalangDanaPageContent() {
	const router = useRouter();
	const sp = useSearchParams();
	const { data: session, status } = useSession();

	React.useEffect(() => {
		if (status === "unauthenticated") {
			const currentUrl = new URLSearchParams(Array.from(sp.entries()));
			router.replace(
				`/auth/login?callbackUrl=/galang-dana/buat?${currentUrl.toString()}`
			);
		}
	}, [status, router, sp]);

	const type = sp.get("type") ?? "lainnya";
	const category = sp.get("category") ?? "";

	const isSakit = type === "sakit";
	const isLainnya = type === "lainnya";

	React.useEffect(() => {
		// kalau lainnya wajib ada category
		if (isLainnya && !category) router.replace("/galang-dana/kategori");
		// kalau type aneh, balikin ke kategori
		if (!isSakit && !isLainnya) router.replace("/galang-dana/kategori");
	}, [isLainnya, isSakit, category, router]);

	if (status === "loading") {
		return <Box sx={{ p: 4, textAlign: "center" }}>Loading session...</Box>;
	}

	// step state (1 aja, sesuai type)
	const [step, setStep] = React.useState(0);

	const steps = isSakit ? STEPS_SAKIT : STEPS_LAINNYA;
	const stepKey = steps[step]?.key as StepKeySakit | StepKeyLainnya;

	// =========
	// SAKIT STATE
	// =========
	const [who, setWho] = React.useState<string>("");
	const [phone, setPhone] = React.useState("");
	const [bank, setBank] = React.useState<string>(""); // pasien / kk / beda / rs
	const [openTerms, setOpenTerms] = React.useState(false);

	const [t1, setT1] = React.useState(false);
	const [t2, setT2] = React.useState(false);
	const [t3, setT3] = React.useState(false);
	const [t4, setT4] = React.useState(false);

	const [patientName, setPatientName] = React.useState("");
	const [patientAge, setPatientAge] = React.useState("");
	const [patientGender, setPatientGender] = React.useState<"L" | "P" | "">("");
	const [patientCity, setPatientCity] = React.useState("");

	const [inpatient, setInpatient] = React.useState<"ya" | "tidak" | "">("");
	const [treatment, setTreatment] = React.useState("");
	const [prevCost, setPrevCost] = React.useState<"mandiri" | "asuransi" | "">(
		""
	);

	const [target, setTarget] = React.useState("");
	const [duration, setDuration] = React.useState<
		"30" | "60" | "120" | "custom" | ""
	>("");
	const [usage, setUsage] = React.useState("");

	const [title, setTitle] = React.useState("");
	const [slug, setSlug] = React.useState("");
	const [coverName, setCoverName] = React.useState<string>("");
	const [coverFile, setCoverFile] = React.useState<File | null>(null);
	const [coverPreview, setCoverPreview] = React.useState<string>("");

	const [story, setStory] = React.useState("");
	const [showStoryEditor, setShowStoryEditor] = React.useState(false);

	const [cta, setCta] = React.useState("");
	const ctaLeft = 160 - cta.length;

	const canOpenConfirm = !!who && phone.trim().length >= 8 && !!bank;
	const allTermsOk = t1 && t2 && t3 && t4;

	// =========
	// LAINNYA STATE
	// =========
	const purposes = React.useMemo(() => {
		if (category === "bencana") {
			return [
				{
					key: "acara",
					title: "Acara/gerakan/kegiatan/program",
					desc: "Contoh: Program pemulihan psikologis korban bencana, untuk pengadaan kegiatan tertentu bagi korban bencana, dsb.",
				},
				{
					key: "operasional",
					title: "Biaya operasional lembaga/yayasan",
					desc: "Contoh: Kebutuhan operasional posko bencana (makanan, air, selimut, dsb.), biaya logistik pengiriman kebutuhan, dsb.",
				},
				{
					key: "infrastruktur",
					title: "Pembangunan/perbaikan/pembelian infrastruktur",
					desc: "Contoh: Perbaikan rumah akibat bencana, pembangunan jalan pasca bencana, dsb.",
				},
				{
					key: "korban",
					title: "Korban Bencana Alam",
					desc: "Contoh: Bantuan untuk seorang korban bencana alam tertentu, santunan untuk daerah terdampak bencana, dsb.",
				},
			];
		}

		// default kategori lain (boleh kamu refine nanti)
		return [
			{
				key: "program",
				title: "Acara/gerakan/kegiatan/program",
				desc: "Contoh: kegiatan sosial, pelatihan, program beasiswa, dsb.",
			},
			{
				key: "operasional",
				title: "Biaya operasional lembaga/yayasan",
				desc: "Contoh: biaya logistik, konsumsi, transport, operasional kegiatan, dsb.",
			},
			{
				key: "infrastruktur",
				title: "Pembangunan/perbaikan/pengadaan",
				desc: "Contoh: renovasi fasilitas, pengadaan perlengkapan, pembangunan sarana, dsb.",
			},
			{
				key: "penerima",
				title: "Bantuan untuk penerima manfaat",
				desc: "Contoh: bantuan individu/keluarga/kelompok penerima manfaat, dsb.",
			},
		];
	}, [category]);

	const [purposeKey, setPurposeKey] = React.useState<string>("");
	const [beneficiaries, setBeneficiaries] = React.useState(""); // opsional
	const [agreeA, setAgreeA] = React.useState(false);
	const [agreeB, setAgreeB] = React.useState(false);

	const [ktpName, setKtpName] = React.useState("");
	const [phoneOther, setPhoneOther] = React.useState("");
	const [job, setJob] = React.useState("");
	const [workplace, setWorkplace] = React.useState("");

	const [soc, setSoc] = React.useState<
		"" | "facebook" | "instagram" | "twitter" | "linkedin"
	>("");
	const [socHandle, setSocHandle] = React.useState("");

	const [receiverName, setReceiverName] = React.useState("");
	const [goal, setGoal] = React.useState("");
	const [location, setLocation] = React.useState("");

	const [targetOther, setTargetOther] = React.useState("");
	const [durationOther, setDurationOther] = React.useState<
		"30" | "60" | "120" | "custom" | ""
	>("");
	const [usageOther, setUsageOther] = React.useState("");

	const [titleOther, setTitleOther] = React.useState("");
	const [slugOther, setSlugOther] = React.useState("");
	const [coverNameOther, setCoverNameOther] = React.useState("");
	const [coverFileOther, setCoverFileOther] = React.useState<File | null>(null);
	const [coverPreviewOther, setCoverPreviewOther] = React.useState<string>("");

	const [storyOther, setStoryOther] = React.useState("");
	const [showStoryEditorOther, setShowStoryEditorOther] = React.useState(false);

	const [ctaOther, setCtaOther] = React.useState("");
	const ctaOtherLeft = 160 - ctaOther.length;

	// =========
	// SHARED
	// =========
	const [submitting, setSubmitting] = React.useState(false);
	const [snack, setSnack] = React.useState<{
		open: boolean;
		msg: string;
		type: "success" | "info" | "error";
	}>({ open: false, msg: "", type: "info" });

	const canNext = React.useMemo(() => {
		// ---- sakit
		if (isSakit) {
			if (stepKey === "tujuan") return canOpenConfirm;
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
		}

		// ---- lainnya
		if (stepKey === "tujuan") return !!purposeKey && agreeA && agreeB;
		if (stepKey === "data_diri")
			return ktpName.trim().length >= 3 && phoneOther.trim().length >= 8;
		if (stepKey === "penerima")
			return (
				receiverName.trim().length >= 3 &&
				goal.trim().length >= 10 &&
				location.trim().length >= 8
			);
		if (stepKey === "target")
			return (
				!!onlyDigits(targetOther) &&
				!!durationOther &&
				usageOther.trim().length >= 10
			);
		if (stepKey === "judul") return !!titleOther && !!slugOther;
		if (stepKey === "cerita") return storyOther.trim().length >= 30;
		if (stepKey === "ajakan") return ctaOther.trim().length >= 10;
		return false;
	}, [
		isSakit,
		stepKey,
		// sakit deps
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
		// lainnya deps
		purposeKey,
		agreeA,
		agreeB,
		ktpName,
		phoneOther,
		receiverName,
		goal,
		location,
		targetOther,
		durationOther,
		usageOther,
		titleOther,
		slugOther,
		storyOther,
		ctaOther,
	]);

	const goPrev = () => setStep((s) => Math.max(0, s - 1));
	const goNext = () => setStep((s) => Math.min(steps.length - 1, s + 1));

	const onClickNext = async () => {
		if (isSakit && stepKey === "tujuan") {
			setOpenTerms(true);
			return;
		}

		if (stepKey === "ajakan") {
			setSubmitting(true);
			const formData = new FormData();

			if (isSakit) {
				formData.append("title", title);
				formData.append("slug", slug);
				formData.append("category", "medis");
				formData.append("type", "sakit");
				formData.append("target", target);
				formData.append("duration", duration);
				formData.append("phone", phone);

				if (coverFile) formData.append("cover", coverFile);

				formData.append("story", story);
			} else {
				formData.append("title", titleOther);
				formData.append("slug", slugOther);
				formData.append("category", category); // "pendidikan", "bencana", etc.
				formData.append("type", "lainnya");
				formData.append("target", targetOther);
				formData.append("duration", durationOther);
				formData.append("phone", phoneOther);

				if (coverFileOther) formData.append("cover", coverFileOther);

				formData.append("story", storyOther);
			}

			const res = await createCampaign(formData);
			setSubmitting(false);

			if (res.success) {
				setSnack({
					open: true,
					msg: "Campaign berhasil dibuat!",
					type: "success",
				});
				// Redirect
				setTimeout(() => {
					router.push("/galang-dana");
				}, 1500);
			} else {
				setSnack({
					open: true,
					msg: res.error || "Gagal membuat campaign",
					type: "error",
				});
			}
			return;
		}

		goNext();
	};

	const headerTitle = isSakit
		? "Bantuan Medis & Kesehatan"
		: CATEGORY_TITLE[category] ?? "Galang Dana";

	return (
		<Box
			sx={{
				pb: `calc(var(--bottom-nav-h, 72px) + 96px + env(safe-area-inset-bottom))`,
			}}
		>
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
						{headerTitle}
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
					{steps.map((s, i) => {
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
				{/* ========================= */}
				{/* SAKIT */}
				{/* ========================= */}
				{isSakit && (
					<>
						{stepKey === "tujuan" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Siapa yang sakit?
								</Typography>

								<RadioGroup
									value={who}
									onChange={(e) => setWho(e.target.value)}
								>
									<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
										<FormControlLabel
											value="self"
											control={<Radio size="small" />}
											label="Saya sendiri"
											sx={{
												px: 1.5,
												py: 0.5,
												"& .MuiFormControlLabel-label": { fontSize: 13.5 },
											}}
										/>
									</Paper>

									<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
										<FormControlLabel
											value="kk"
											control={<Radio size="small" />}
											label="Keluarga yang satu KK dengan saya"
											sx={{
												px: 1.5,
												py: 0.5,
												"& .MuiFormControlLabel-label": { fontSize: 13.5 },
											}}
										/>
									</Paper>

									<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
										<FormControlLabel
											value="beda_kk"
											control={<Radio size="small" />}
											label="Keluarga inti (ayah/ibu/kakak/adik/anak) yang sudah pisah KK dengan saya"
											sx={{
												px: 1.5,
												py: 0.5,
												"& .MuiFormControlLabel-label": { fontSize: 13.5 },
											}}
										/>
									</Paper>

									<Paper variant="outlined" sx={{ borderRadius: 2 }}>
										<FormControlLabel
											value="other"
											control={<Radio size="small" />}
											label="Selain pilihan di atas"
											sx={{
												px: 1.5,
												py: 0.5,
												"& .MuiFormControlLabel-label": { fontSize: 13.5 },
											}}
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

									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
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
										{[
											{ k: "pasien", t: "Pasien langsung" },
											{ k: "kk", t: "Keluarga satu KK" },
											{ k: "beda_kk", t: "Keluarga inti berbeda KK" },
											{ k: "rs", t: "Rumah sakit" },
										].map((x) => (
											<Paper
												key={x.k}
												variant="outlined"
												sx={{ borderRadius: 2 }}
											>
												<FormControlLabel
													sx={{
														px: 1.5,
														py: 0.5,
														width: "100%",
														"& .MuiFormControlLabel-label": { fontSize: 13.5 },
													}}
													control={
														<Checkbox
															checked={bank === x.k}
															onChange={() => setBank(x.k)}
														/>
													}
													label={x.t}
												/>
											</Paper>
										))}
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
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
										label="Nama pasien"
										value={patientName}
										onChange={(e) => setPatientName(e.target.value)}
										fullWidth
									/>
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
										label="Usia pasien"
										value={patientAge}
										onChange={(e) => setPatientAge(onlyDigits(e.target.value))}
										inputMode="numeric"
										fullWidth
									/>
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
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
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setPatientGender(e.target.value as "L" | "P" | "")
											}
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
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setInpatient(e.target.value as "ya" | "tidak" | "")
									}
								>
									<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
										<FormControlLabel
											value="ya"
											control={<Radio size="small" />}
											label="Ya, sedang rawat inap"
											sx={{
												px: 1.5,
												py: 0.5,
												"& .MuiFormControlLabel-label": { fontSize: 13.5 },
											}}
										/>
									</Paper>
									<Paper variant="outlined" sx={{ borderRadius: 2 }}>
										<FormControlLabel
											value="tidak"
											control={<Radio size="small" />}
											label="Tidak"
											sx={{
												px: 1.5,
												py: 0.5,
												"& .MuiFormControlLabel-label": { fontSize: 13.5 },
											}}
										/>
									</Paper>
								</RadioGroup>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Upaya pengobatan yang sudah atau sedang dilakukan
									</Typography>
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
										value={treatment}
										onChange={(e) => setTreatment(e.target.value)}
										fullWidth
										multiline
										minRows={4}
										placeholder="Jelaskan secara lengkap upaya apa yang dilakukan dan tempat dilakukan..."
									/>
								</Box>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Dari mana sumber biaya pengobatan/perawatan sebelumnya?
									</Typography>

									<RadioGroup
										value={prevCost}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setPrevCost(e.target.value as "mandiri" | "asuransi" | "")
										}
									>
										<Paper variant="outlined" sx={{ borderRadius: 2, mb: 1 }}>
											<FormControlLabel
												value="mandiri"
												control={<Radio size="small" />}
												label="Biaya mandiri"
												sx={{
													px: 1.5,
													py: 0.5,
													"& .MuiFormControlLabel-label": { fontSize: 13.5 },
												}}
											/>
										</Paper>
										<Paper variant="outlined" sx={{ borderRadius: 2 }}>
											<FormControlLabel
												value="asuransi"
												control={<Radio size="small" />}
												label="Asuransi (BPJS dan/atau swasta)"
												sx={{
													px: 1.5,
													py: 0.5,
													"& .MuiFormControlLabel-label": { fontSize: 13.5 },
												}}
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

								<TextField
									size="small"
									sx={{
										"& .MuiInputBase-input": { fontSize: 13.5 },
										"& .MuiInputLabel-root": { fontSize: 13.5 },
									}}
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
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setDuration(
												e.target.value as "30" | "60" | "120" | "custom" | ""
											)
										}
									>
										<Stack spacing={1}>
											{[
												{ v: "30", t: "30 hari" },
												{ v: "60", t: "60 hari" },
												{ v: "120", t: "120 hari" },
												{ v: "custom", t: "pilih tanggal" },
											].map((x) => (
												<Paper
													key={x.v}
													variant="outlined"
													sx={{ borderRadius: 2 }}
												>
													<FormControlLabel
														value={x.v}
														control={<Radio size="small" />}
														label={x.t}
														sx={{
															px: 1.5,
															py: 0.5,
															"& .MuiFormControlLabel-label": {
																fontSize: 13.5,
															},
														}}
													/>
												</Paper>
											))}
										</Stack>
									</RadioGroup>
								</Box>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Isi rincian penggunaan dana
									</Typography>
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
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
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										fullWidth
										placeholder="Contoh: Bantu Abi melawan kanker hati"
									/>

									<Box>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Tentukan link untuk galang dana ini
										</Typography>
										<TextField
											size="small"
											sx={{
												"& .MuiInputBase-input": { fontSize: 13.5 },
												"& .MuiInputLabel-root": { fontSize: 13.5 },
											}}
											value={slug}
											onChange={(e) =>
												setSlug(
													e.target.value.replace(/\s+/g, "").toLowerCase()
												)
											}
											fullWidth
											placeholder="contoh: bantudolawan..."
										/>
									</Box>

									<Box>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Upload foto galang dana
										</Typography>

										<Paper
											variant="outlined"
											sx={{ borderRadius: 3, p: 1.25, textAlign: "center" }}
										>
											<input
												id="cover-upload"
												type="file"
												accept="image/*"
												hidden
												onChange={(e) => {
													const f = e.target.files?.[0];
													if (f) {
														setCoverName(f.name);
														setCoverFile(f);
														setCoverPreview(URL.createObjectURL(f));
													} else {
														setCoverName("");
														setCoverFile(null);
														setCoverPreview("");
													}
												}}
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

											{coverPreview ? (
												<Box
													component="img"
													src={coverPreview}
													alt="Preview"
													sx={{
														width: "100%",
														height: 200,
														objectFit: "cover",
														borderRadius: 2,
														mt: 1,
													}}
												/>
											) : null}

											{coverName && !coverPreview ? (
												<Typography
													sx={{
														mt: 0.75,
														fontSize: 12.5,
														color: "text.secondary",
													}}
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
													Upload foto yang menggambarkan keadaan pasien saat
													ini.
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
										<TextField
											size="small"
											sx={{
												"& .MuiInputBase-input": { fontSize: 13.5 },
												"& .MuiInputLabel-root": { fontSize: 13.5 },
											}}
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

								<TextField
									size="small"
									sx={{
										"& .MuiInputBase-input": { fontSize: 13.5 },
										"& .MuiInputLabel-root": { fontSize: 13.5 },
									}}
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
							</Box>
						)}
					</>
				)}

				{/* ========================= */}
				{/* LAINNYA */}
				{/* ========================= */}
				{isLainnya && (
					<>
						{/* STEP: tujuan */}
						{stepKey === "tujuan" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Donasi akan ditujukan kepada...
								</Typography>

								{/* kalau belum pilih tujuan, tampil list */}
								{!purposeKey ? (
									<Stack spacing={1}>
										{purposes.map((p) => (
											<Paper
												key={p.key}
												variant="outlined"
												sx={{ borderRadius: 3, p: 1.25 }}
											>
												<Box
													sx={{
														display: "flex",
														gap: 1,
														alignItems: "flex-start",
													}}
												>
													<Box sx={{ flex: 1 }}>
														<Typography
															sx={{ fontWeight: 700, fontSize: 13.5 }}
														>
															{p.title}
														</Typography>
														<Typography
															sx={{
																mt: 0.4,
																fontSize: 12.5,
																color: "text.secondary",
															}}
														>
															{p.desc}
														</Typography>
													</Box>

													<Button
														variant="text"
														onClick={() => setPurposeKey(p.key)}
														sx={{ fontWeight: 700 }}
													>
														Pilih
													</Button>
												</Box>
											</Paper>
										))}
									</Stack>
								) : (
									<Box>
										<Paper variant="outlined" sx={{ borderRadius: 3, p: 1.25 }}>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													gap: 1,
												}}
											>
												<Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>
													{purposes.find((x) => x.key === purposeKey)?.title ??
														"-"}
												</Typography>
												<Button
													variant="text"
													onClick={() => setPurposeKey("")}
													sx={{ fontWeight: 700 }}
												>
													Ubah
												</Button>
											</Box>
										</Paper>

										<Box sx={{ mt: 2 }}>
											<Typography
												sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
											>
												Berapa jumlah penerima manfaat yang dituju?{" "}
												<span style={{ color: "rgba(15,23,42,.55)" }}>
													(opsional)
												</span>
											</Typography>
											<TextField
												size="small"
												sx={{
													"& .MuiInputBase-input": { fontSize: 13.5 },
													"& .MuiInputLabel-root": { fontSize: 13.5 },
												}}
												value={beneficiaries}
												onChange={(e) =>
													setBeneficiaries(onlyDigits(e.target.value))
												}
												fullWidth
												inputMode="numeric"
												placeholder="Contoh: 100"
											/>
										</Box>

										<Box sx={{ mt: 2 }}>
											<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
												Baca dan beri tanda syarat penggalangan di bawah ini
											</Typography>

											<Paper variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
												<FormControlLabel
													control={
														<Checkbox
															checked={agreeA}
															onChange={(e) => setAgreeA(e.target.checked)}
														/>
													}
													label="Pemilik rekening bertanggung jawab atas penggunaan dana yang diterima dari galang dana ini."
												/>
												<Divider sx={{ my: 1 }} />
												<FormControlLabel
													control={
														<Checkbox
															checked={agreeB}
															onChange={(e) => setAgreeB(e.target.checked)}
														/>
													}
													label="Kamu sebagai penggalang dana bertanggung jawab atas permintaan pencairan dan pelaporan penggunaan dana."
												/>
											</Paper>
										</Box>
									</Box>
								)}
							</Box>
						)}

						{/* STEP: data diri */}
						{stepKey === "data_diri" && (
							<Box>
								<Stack spacing={1.25}>
									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Nama kamu sesuai KTP
										</Typography>
										<TextField
											size="small"
											sx={{ "& .MuiInputBase-input": { fontSize: 13.5 } }}
											value={ktpName}
											onChange={(e) => setKtpName(e.target.value)}
											fullWidth
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
											Masukkan no. ponsel kamu
										</Typography>
										<Typography
											sx={{ color: "text.secondary", fontSize: 12.5, mb: 1 }}
										>
											Seluruh notifikasi akan dikirim melalui nomor ini
										</Typography>
										<TextField
											size="small"
											sx={{ "& .MuiInputBase-input": { fontSize: 13.5 } }}
											value={phoneOther}
											onChange={(e) =>
												setPhoneOther(onlyDigits(e.target.value))
											}
											fullWidth
											inputMode="numeric"
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Pekerjaan kamu saat ini
										</Typography>
										<TextField
											size="small"
											sx={{ "& .MuiInputBase-input": { fontSize: 13.5 } }}
											value={job}
											onChange={(e) => setJob(e.target.value)}
											fullWidth
											placeholder="Contoh: Karyawan swasta, Pelajar"
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Nama sekolah/tempat kerja
										</Typography>
										<TextField
											size="small"
											sx={{ "& .MuiInputBase-input": { fontSize: 13.5 } }}
											value={workplace}
											onChange={(e) => setWorkplace(e.target.value)}
											fullWidth
											placeholder="Masukkan nama sekolah/tempat kerja"
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
											Akun media sosial kamu
										</Typography>
										<Typography
											sx={{ color: "text.secondary", fontSize: 12.5, mb: 1 }}
										>
											Galang dana akan ditolak jika akun media sosial kamu tidak
											dapat ditemukan
										</Typography>

										<Box
											sx={{
												display: "grid",
												gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
												gap: 1,
											}}
										>
											{(
												[
													{ key: "facebook", label: "Facebook" },
													{ key: "instagram", label: "Instagram" },
													{ key: "twitter", label: "Twitter" },
													{ key: "linkedin", label: "LinkedIn" },
												] as Array<{
													key:
														| "facebook"
														| "instagram"
														| "twitter"
														| "linkedin";
													label: string;
												}>
											).map((x) => {
												const active = soc === x.key;
												return (
													<ButtonBase
														key={x.key}
														onClick={() => setSoc(x.key)}
														sx={{
															borderRadius: 2,
															border: "1px solid",
															borderColor: active ? "primary.main" : "divider",
															p: 1,
															justifyContent: "flex-start",
															gap: 1,
														}}
													>
														<Radio checked={active} size="small" />
														<Typography
															sx={{ fontWeight: 600, fontSize: 13.5 }}
														>
															{x.label}
														</Typography>
													</ButtonBase>
												);
											})}
										</Box>

										{soc ? (
											<TextField
												size="small"
												sx={{
													mt: 1,
													"& .MuiInputBase-input": { fontSize: 13.5 },
												}}
												value={socHandle}
												onChange={(e) => setSocHandle(e.target.value)}
												fullWidth
												placeholder={`Link/username ${soc} (opsional)`}
											/>
										) : null}
									</Box>
								</Stack>
							</Box>
						)}

						{/* STEP: penerima */}
						{stepKey === "penerima" && (
							<Box>
								<Stack spacing={1.25}>
									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Nama penerima/infrastruktur
										</Typography>
										<TextField
											size="small"
											sx={{ "& .MuiInputBase-input": { fontSize: 13.5 } }}
											value={receiverName}
											onChange={(e) => setReceiverName(e.target.value)}
											fullWidth
											multiline
											minRows={2}
											placeholder="Contoh: Masjid Al-Iman / Sekolah X / Posko A"
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Tujuan galang dana
										</Typography>
										<TextField
											size="small"
											sx={{ "& .MuiInputBase-input": { fontSize: 13.5 } }}
											value={goal}
											onChange={(e) => setGoal(e.target.value)}
											fullWidth
											multiline
											minRows={3}
											placeholder="Contoh: pembangunan ulang fasilitas yang rusak..."
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Lokasi
										</Typography>
										<TextField
											size="small"
											sx={{ "& .MuiInputBase-input": { fontSize: 13.5 } }}
											value={location}
											onChange={(e) => setLocation(e.target.value)}
											fullWidth
											multiline
											minRows={2}
											placeholder="Contoh: Kelurahan..., Kecamatan..., Kota/Kab..."
										/>
									</Box>
								</Stack>
							</Box>
						)}

						{/* STEP: target */}
						{stepKey === "target" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
									Tentukan perkiraan biaya yang dibutuhkan
								</Typography>

								<TextField
									size="small"
									sx={{
										"& .MuiInputBase-input": { fontSize: 13.5 },
										"& .MuiInputLabel-root": { fontSize: 13.5 },
									}}
									value={formatIDR(targetOther)}
									onChange={(e) => setTargetOther(e.target.value)}
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
										value={durationOther}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setDurationOther(
												e.target.value as "30" | "60" | "120" | "custom" | ""
											)
										}
									>
										<Stack spacing={1}>
											{[
												{ v: "30", t: "30 hari" },
												{ v: "60", t: "60 hari" },
												{ v: "120", t: "120 hari" },
												{ v: "custom", t: "pilih tanggal" },
											].map((x) => (
												<Paper
													key={x.v}
													variant="outlined"
													sx={{ borderRadius: 2 }}
												>
													<FormControlLabel
														value={x.v}
														control={<Radio size="small" />}
														label={x.t}
														sx={{
															px: 1.5,
															py: 0.5,
															"& .MuiFormControlLabel-label": {
																fontSize: 13.5,
															},
														}}
													/>
												</Paper>
											))}
										</Stack>
									</RadioGroup>
								</Box>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Isi rincian penggunaan dana
									</Typography>
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
										value={usageOther}
										onChange={(e) => setUsageOther(e.target.value)}
										fullWidth
										multiline
										minRows={4}
										placeholder="Contoh: biaya bahan bangunan Rp2.000.000, biaya tukang Rp10.000.000"
									/>
								</Box>
							</Box>
						)}

						{/* STEP: judul */}
						{stepKey === "judul" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Beri judul untuk galang dana ini
								</Typography>

								<Stack spacing={1.25}>
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
										value={titleOther}
										onChange={(e) => setTitleOther(e.target.value)}
										fullWidth
										placeholder="Contoh: Bantu renovasi masjid terdampak bencana"
									/>

									<Box>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Tentukan link untuk galang dana ini
										</Typography>
										<TextField
											size="small"
											sx={{
												"& .MuiInputBase-input": { fontSize: 13.5 },
												"& .MuiInputLabel-root": { fontSize: 13.5 },
											}}
											value={slugOther}
											onChange={(e) =>
												setSlugOther(
													e.target.value.replace(/\s+/g, "").toLowerCase()
												)
											}
											fullWidth
											placeholder="contoh: bantu-renovasi..."
										/>
									</Box>

									<Box>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Upload foto galang dana
										</Typography>

										<Paper
											variant="outlined"
											sx={{ borderRadius: 3, p: 1.25, textAlign: "center" }}
										>
											<input
												id="cover-upload-other"
												type="file"
												accept="image/*"
												hidden
												onChange={(e) => {
													const f = e.target.files?.[0];
													if (f) {
														setCoverNameOther(f.name);
														setCoverFileOther(f);
														setCoverPreviewOther(URL.createObjectURL(f));
													} else {
														setCoverNameOther("");
														setCoverFileOther(null);
														setCoverPreviewOther("");
													}
												}}
											/>
											<Button
												component="label"
												htmlFor="cover-upload-other"
												startIcon={<PhotoCameraRoundedIcon />}
												variant="text"
												sx={{ fontWeight: 700 }}
											>
												Upload Foto
											</Button>

											{coverPreviewOther ? (
												<Box
													component="img"
													src={coverPreviewOther}
													alt="Preview"
													sx={{
														width: "100%",
														height: 200,
														objectFit: "cover",
														borderRadius: 2,
														mt: 1,
													}}
												/>
											) : null}

											{coverNameOther && !coverPreviewOther ? (
												<Typography
													sx={{
														mt: 0.75,
														fontSize: 12.5,
														color: "text.secondary",
													}}
												>
													Terpilih: <b>{coverNameOther}</b>
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
													Upload foto yang paling menggambarkan kejadian /
													penerima manfaat.
												</Typography>
											</Box>
										</Paper>
									</Box>
								</Stack>
							</Box>
						)}

						{/* STEP: cerita */}
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
										onClick={() => setShowStoryEditorOther(true)}
										sx={{ borderRadius: 2, fontWeight: 700, py: 1.15 }}
									>
										Buat cerita galang dana
									</Button>
								</Paper>

								{showStoryEditorOther && (
									<Box sx={{ mt: 1.5 }}>
										<TextField
											size="small"
											sx={{
												"& .MuiInputBase-input": { fontSize: 13.5 },
												"& .MuiInputLabel-root": { fontSize: 13.5 },
											}}
											value={storyOther}
											onChange={(e) => setStoryOther(e.target.value)}
											fullWidth
											multiline
											minRows={8}
											placeholder="Tulis latar belakang, kondisi, kebutuhan biaya, rencana penggunaan dana, dan ajakan..."
										/>
									</Box>
								)}
							</Box>
						)}

						{/* STEP: ajakan */}
						{stepKey === "ajakan" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Tulis ajakan singkat untuk donasi di galang dana ini
								</Typography>

								<TextField
									size="small"
									sx={{
										"& .MuiInputBase-input": { fontSize: 13.5 },
										"& .MuiInputLabel-root": { fontSize: 13.5 },
									}}
									value={ctaOther}
									onChange={(e) => setCtaOther(e.target.value.slice(0, 160))}
									fullWidth
									multiline
									minRows={4}
									placeholder="Contoh: Kami butuh bantuan agar fasilitas bisa dipakai warga kembali..."
								/>

								<Typography
									sx={{
										mt: 0.75,
										fontSize: 12.5,
										color: ctaOtherLeft < 0 ? "error.main" : "text.secondary",
									}}
								>
									{ctaOther.length}/160
								</Typography>
							</Box>
						)}
					</>
				)}
			</Box>

			{/* Bottom actions (di atas bottom nav app kamu) */}
			<Paper
				elevation={0}
				sx={{
					position: "fixed",
					left: 0,
					right: 0,
					maxWidth: 480,
					mx: "auto",
					bottom: `calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom))`,
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
							endIcon={!submitting && <ChevronRightRoundedIcon />}
							sx={{ borderRadius: 2, fontWeight: 700, px: 2.25 }}
							disabled={!canNext || submitting}
						>
							{submitting
								? "Menyimpan..."
								: stepKey === "ajakan"
								? "Selesai"
								: "Selanjutnya"}
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

			{/* Dialog terms (khusus sakit) */}
			<Dialog
				open={openTerms}
				onClose={() => setOpenTerms(false)}
				fullWidth
				maxWidth="sm"
				BackdropProps={{
					sx: {
						// backdrop jangan nutup area bottom nav
						bottom: `calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom))`,
					},
				}}
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
				sx={{
					mb: `calc(var(--bottom-nav-h, 72px) + 16px + env(safe-area-inset-bottom))`,
				}}
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

export default function BuatGalangDanaPage() {
	return (
		<React.Suspense
			fallback={<Box sx={{ p: 4, textAlign: "center" }}>Loading...</Box>}
		>
			<BuatGalangDanaPageContent />
		</React.Suspense>
	);
}
