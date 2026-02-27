"use client";

import * as React from "react";
import {
	Box,
	Typography,
	Paper,
	TextField,
	Button,
	Stack,
	CircularProgress,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import { uploadFile } from "@/actions/upload";

// ----------------------------------------------------------------------

type FieldConfig = {
	key: string;
	label: string;
	placeholder: string;
	minRows?: number;
	example?: string;
};

type StepConfig = {
	title?: string;
	description?: string;
	fields: FieldConfig[];
	photoKey?: string;
	photoLabel?: string;
};

export const MEDICAL_STEPS: StepConfig[] = [
	{
		title: "Ceritakan tentang dirimu dan pasien",
		description:
			"Perkenalkan identitas dirimu dan pasien, serta hubungan kamu dengan pasien.",
		fields: [
			{
				key: "intro",
				label: "",
				placeholder:
					"Halo, nama saya [Nama], saya adalah [Hubungan] dari [Nama Pasien]. Saya ingin menggalang dana untuk...",
				minRows: 6,
				example:
					"Halo #OrangBaik, perkenalkan saya Budi, ayah kandung dari Siti. Siti adalah putri kami yang baru berusia 5 tahun dan saat ini sedang berjuang melawan kanker darah.",
			},
		],
	},
	{
		title:
			"Jelaskan tentang penyakit pasien dan kondisinya dari awal pasien menderita sakit hingga kondisi terkini!",
		fields: [
			{
				key: "disease",
				label: "",
				placeholder:
					"Awalnya pasien mengalami gejala... Kemudian kami membawanya ke RS dan didiagnosa...",
				minRows: 4,
				example:
					"Awalnya Siti sering mengalami demam tinggi dan mimisan. Kami pikir hanya kelelahan biasa, namun setelah diperiksa di RSUD, dokter mendiagnosa Siti menderita Leukemia Limfoblastik Akut.",
			},
			{
				key: "treatment",
				label:
					"Upaya pengobatan apa saja yang telah dilakukan sejak awal hingga kini?",
				placeholder:
					"Pasien sudah menjalani kemoterapi sebanyak... dan saat ini sedang dirawat di...",
				minRows: 4,
				example:
					"Sejak didiagnosa 3 bulan lalu, Siti sudah menjalani 2 siklus kemoterapi. Saat ini Siti sedang dirawat intensif di RS Kanker Dharmais Jakarta.",
			},
		],
	},
	{
		title: "Bagaimana keadaan keluarga dan lingkungan hidup pasien?",
		fields: [
			{
				key: "family",
				label: "",
				placeholder:
					"Ayah pasien bekerja sebagai... dengan penghasilan... Ibu pasien adalah seorang...",
				minRows: 4,
				example:
					"Saya bekerja sebagai buruh bangunan dengan penghasilan tidak menentu, sekitar 100rb per hari jika ada panggilan. Istri saya ibu rumah tangga yang fokus merawat Siti dan adiknya.",
			},
		],
		photoKey: "familyPhoto",
		photoLabel:
			"Upload foto pasien yang sedang beraktivitas dengan keluarganya",
	},
	{
		title: "Bagaimana kondisi setelah pasien mengidap penyakit?",
		fields: [
			{
				key: "impact",
				label: "",
				placeholder:
					"Sejak sakit, pasien tidak bisa... Kondisi ekonomi keluarga juga semakin sulit karena...",
				minRows: 4,
				example:
					"Sejak sakit, Siti terpaksa berhenti sekolah TK. Kondisi fisiknya sangat lemah. Tabungan kami sudah habis untuk biaya transportasi dan obat-obatan yang tidak ditanggung BPJS.",
			},
		],
		photoKey: "impactPhoto",
		photoLabel: "Upload foto pasien yang sedang sakit",
	},
	{
		title: "Berapa biaya yang dibutuhkan dan bagaimana rencana penggunaannya?",
		description:
			"Tuliskan secara detail biaya apa saja yang dibutuhkan beserta dengan total kebutuhan biayanya",
		fields: [
			{
				key: "cost_usage",
				label: "",
				placeholder: "Dana yang dibutuhkan adalah Rp... untuk biaya...",
				minRows: 6,
				example:
					"Saat ini kami membutuhkan biaya sekitar Rp 150.000.000. Dana tersebut akan digunakan untuk:\n1. Operasi sumsum tulang belakang: Rp 80.000.000\n2. Biaya rawat inap dan obat-obatan: Rp 50.000.000\n3. Biaya operasional dan penunjang pengobatan: Rp 20.000.000",
			},
		],
	},
	{
		title: "Jelaskan alasan pasien membutuhkan dana tersebut",
		description:
			"Sertakan alasan, perbandingan kebutuhan dan keadaan ekonomi pasien dan keluarga pasien",
		fields: [
			{
				key: "financial_reason",
				label: "",
				placeholder:
					"Penghasilan keluarga hanya... sedangkan biaya pengobatan...",
				minRows: 4,
				example:
					"Biaya pengobatan yang sangat besar ini jauh di luar kemampuan kami. Saya hanya bekerja sebagai buruh lepas dengan penghasilan tak menentu, sedangkan istri saya harus menjaga Siti di rumah sakit. Kami sudah menjual barang-barang berharga, namun masih sangat kurang.",
			},
		],
	},
	{
		title: "Tuliskan doa, harapan, dan cita-cita untuk kesembuhan pasien",
		description:
			"Ceritakan doa, harapan, dan cita-cita bagi pasien, baik dari pasien sendiri ataupun keluarga",
		fields: [
			{
				key: "hope",
				label: "",
				placeholder:
					"Saya berharap pasien bisa sembuh total agar bisa kembali bersekolah dan bermain...",
				minRows: 4,
				example:
					"Besar harapan kami agar Siti bisa sembuh total, kembali ceria, dan bisa melanjutkan sekolahnya. Bantuan dari teman-teman #OrangBaik sangat berarti bagi kesembuhan putri kami.",
			},
		],
	},
];

export const NON_MEDICAL_STEPS: StepConfig[] = [
	{
		title: "Ceritakan tentang dirimu dan penyelenggara acara yang akan dibantu",
		fields: [
			{
				key: "intro",
				label: "",
				placeholder: "Saya adalah... Saya mengadakan acara ini untuk...",
				minRows: 6,
				example:
					"Halo #OrangBaik, saya Budi, ketua panitia acara santunan anak yatim di Desa Sukamaju. Kami adalah kumpulan pemuda yang peduli terhadap kesejahteraan anak-anak di lingkungan kami.",
			},
		],
	},
	{
		title:
			"Sebutkan nama acara, masalah yang ingin diatasi, serta target penerima manfaat dari acara tersebut",
		fields: [
			{
				key: "event_info",
				label: "",
				placeholder: "Nama acara adalah... Masalah yang ingin diatasi...",
				minRows: 6,
				example:
					"Kami berencana mengadakan acara 'Berbagi Senyum' untuk 50 anak yatim. Saat ini, panti asuhan tempat mereka tinggal sedang mengalami kesulitan biaya operasional dan renovasi atap yang bocor.",
			},
		],
		photoKey: "organizerPhoto",
		photoLabel: "Upload foto penyelenggara acara tersebut",
	},
	{
		title:
			"Jelaskan mengenai teknis penyelenggaraan, waktu dan lokasi, serta dampak yang ingin dihasilkan dari acara tersebut",
		fields: [
			{
				key: "technical_details",
				label: "",
				placeholder: "Acara akan dilaksanakan pada... Lokasinya di...",
				minRows: 6,
				example:
					"Acara akan dilaksanakan pada tanggal 20 Agustus 2024 di Aula Balai Desa Sukamaju. Kami berharap acara ini dapat memberikan kebahagiaan dan bantuan materiil bagi anak-anak panti.",
			},
		],
	},
	{
		title: "Upload foto acara atau penerima manfaat dari acara tersebut",
		fields: [],
		photoKey: "eventPhoto",
		photoLabel: "", // Empty to rely on main title
	},
	{
		title: "Berapa biaya yang dibutuhkan dan bagaimana rencana penggunaannya?",
		fields: [
			{
				key: "cost_usage",
				label: "",
				placeholder:
					"Dana yang dibutuhkan sebesar Rp... Rencananya akan digunakan untuk...",
				minRows: 6,
				example:
					"Kami membutuhkan dana sebesar Rp 50.000.000. Dana ini akan digunakan untuk:\n1. Santunan tunai: Rp 25.000.000\n2. Renovasi atap panti: Rp 15.000.000\n3. Konsumsi dan operasional acara: Rp 10.000.000",
			},
		],
	},
	{
		title: "Jelaskan alasan galang dana ini sangat dibutuhkan",
		fields: [
			{
				key: "reason",
				label: "",
				placeholder: "Galang dana ini sangat dibutuhkan karena...",
				minRows: 6,
				example:
					"Bantuan ini sangat dibutuhkan karena kondisi panti yang semakin memprihatinkan, terutama saat hujan turun. Kas swadaya masyarakat belum mencukupi untuk perbaikan segera.",
			},
		],
	},
];

// ----------------------------------------------------------------------

type StoryData = Record<string, string>;

interface Props {
	category: "sakit" | "lainnya";
	initialData?: {
		html: string;
		structure?: StoryData;
	};
	onComplete: (html: string, structure: StoryData) => void;
	onBack: () => void;
}

export default function StoryBuilder({
	category,
	initialData,
	onComplete,
	onBack,
}: Props) {
	const [activeStep, setActiveStep] = React.useState(0);
	const [data, setData] = React.useState<StoryData>(
		initialData?.structure || {},
	);
	const [uploading, setUploading] = React.useState<Record<string, boolean>>({});
	const [exampleOpen, setExampleOpen] = React.useState(false);
	const [currentExample, setCurrentExample] = React.useState("");

	const steps = category === "sakit" ? MEDICAL_STEPS : NON_MEDICAL_STEPS;

	const currentStep = steps[activeStep];
	const isLastStep = activeStep === steps.length - 1;

	const handleChange = (key: string, value: string) => {
		setData((prev) => ({ ...prev, [key]: value }));
	};

	const handlePhotoUpload = async (
		key: string,
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading((prev) => ({ ...prev, [key]: true }));

		try {
			const formData = new FormData();
			formData.append("file", file);
			const res = await uploadFile(formData);

			if (res.success && res.url) {
				handleChange(key, res.url);
			} else {
				alert("Gagal mengupload foto");
			}
		} catch (err) {
			console.error(err);
			alert("Terjadi kesalahan saat upload");
		} finally {
			setUploading((prev) => ({ ...prev, [key]: false }));
		}
	};

	const handleNext = () => {
		// Basic validation: Check if required fields are filled?
		// For now, let's make it optional or lenient
		if (isLastStep) {
			const html = generateHtml(data, steps);
			onComplete(html, data);
		} else {
			setActiveStep((prev) => prev + 1);
		}
	};

	const handlePrev = () => {
		if (activeStep === 0) {
			onBack();
		} else {
			setActiveStep((prev) => prev - 1);
		}
	};

	const openExample = (text: string) => {
		setCurrentExample(text);
		setExampleOpen(true);
	};

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700 }}>
					Pembuatan Cerita
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Bagian {activeStep + 1} dari {steps.length}
				</Typography>
			</Box>

			{/* Progress Bar */}
			<Stack direction="row" spacing={1} sx={{ mb: 3 }}>
				{steps.map((_, index) => (
					<Box
						key={index}
						sx={{
							height: 4,
							flex: 1,
							bgcolor: index <= activeStep ? "primary.main" : "grey.300",
							borderRadius: 1,
						}}
					/>
				))}
			</Stack>

			{/* Step Content */}
			<Box sx={{ minHeight: 300 }}>
				{currentStep.title && (
					<Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>
						{currentStep.title}
					</Typography>
				)}
				{currentStep.description && (
					<Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
						{currentStep.description}
					</Typography>
				)}

				<Stack spacing={3}>
					{currentStep.fields.map((field) => (
						<Box key={field.key}>
							{field.label && (
								<Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
									{field.label}
								</Typography>
							)}

							{field.example && (
								<Button
									startIcon={<AutoStoriesOutlinedIcon />}
									size="small"
									variant="outlined"
									onClick={() => openExample(field.example!)}
									sx={{
										mb: 1.5,
										borderRadius: 20,
										textTransform: "none",
										fontSize: 12,
									}}
								>
									Lihat contoh
								</Button>
							)}

							<TextField
								fullWidth
								multiline
								minRows={field.minRows || 3}
								placeholder={field.placeholder}
								value={data[field.key] || ""}
								onChange={(e) => handleChange(field.key, e.target.value)}
								sx={{
									"& .MuiInputBase-root": {
										fontSize: 14,
										borderRadius: 2,
									},
								}}
							/>
						</Box>
					))}

					{currentStep.photoKey && (
						<Box>
							<Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
								{currentStep.photoLabel}
							</Typography>
							<Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
								Ceritamu bisa lebih meyakinkan donatur jika dilengkapi foto
								pendukung di bagian ini.
							</Typography>

							{data[currentStep.photoKey] ? (
								<Box sx={{ position: "relative", mt: 1 }}>
									<Box
										component="img"
										src={data[currentStep.photoKey]}
										alt="Uploaded"
										sx={{
											width: "100%",
											maxHeight: 300,
											objectFit: "cover",
											borderRadius: 2,
										}}
									/>
									<IconButton
										size="small"
										sx={{
											position: "absolute",
											top: 8,
											right: 8,
											bgcolor: "rgba(0,0,0,0.5)",
											color: "white",
											"&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
										}}
										onClick={() => handleChange(currentStep.photoKey!, "")}
									>
										<CloseRoundedIcon fontSize="small" />
									</IconButton>
								</Box>
							) : (
								<Button
									component="label"
									variant="outlined"
									startIcon={
										uploading[currentStep.photoKey] ? (
											<CircularProgress size={20} />
										) : (
											<PhotoCameraRoundedIcon />
										)
									}
									sx={{
										py: 1.5,
										width: "100%",
										justifyContent: "center",
										textTransform: "none",
										color: "text.primary",
										borderColor: "divider",
										borderRadius: 2,
									}}
									disabled={uploading[currentStep.photoKey]}
								>
									{uploading[currentStep.photoKey]
										? "Mengupload..."
										: "Upload foto"}
									<input
										type="file"
										hidden
										accept="image/*"
										onChange={(e) =>
											handlePhotoUpload(currentStep.photoKey!, e)
										}
									/>
								</Button>
							)}
						</Box>
					)}
				</Stack>
			</Box>

			{/* Navigation Buttons */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					mt: 4,
					pt: 2,
					borderTop: "1px solid",
					borderColor: "divider",
				}}
			>
				<Button
					startIcon={<ChevronLeftRoundedIcon />}
					onClick={handlePrev}
					sx={{ textTransform: "none", color: "text.secondary" }}
				>
					{activeStep === 0 ? "Batal" : "Sebelumnya"}
				</Button>
				<Button
					variant="contained"
					endIcon={!isLastStep && <ChevronRightRoundedIcon />}
					onClick={handleNext}
					sx={{
						textTransform: "none",
						borderRadius: 2,
						px: 3,
						fontWeight: 700,
					}}
				>
					{isLastStep ? "Simpan cerita" : "Selanjutnya"}
				</Button>
			</Box>

			{/* Example Dialog */}
			<Dialog
				open={exampleOpen}
				onClose={() => setExampleOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>
					Contoh Cerita
				</DialogTitle>
				<DialogContent>
					<Typography sx={{ fontSize: 14, whiteSpace: "pre-line" }}>
						{currentExample}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setExampleOpen(false)}>Tutup</Button>
					<Button
						variant="contained"
						onClick={() => {
							// Find which field this example belongs to
							const field = currentStep.fields.find(
								(f) => f.example === currentExample,
							);
							if (field) {
								handleChange(field.key, currentExample);
							}
							setExampleOpen(false);
						}}
					>
						Gunakan Contoh
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

// Helper to generate HTML from structured data
function generateHtml(data: StoryData, steps: StepConfig[]) {
	let html = "";

	steps.forEach((step) => {
		// Add step title as h3 if it has fields with content
		// But usually we just want the content paragraphs
		// Let's iterate fields
		step.fields.forEach((field) => {
			if (data[field.key]) {
				// We can add a label if it exists, or just the content
				// If the field label is empty, we might want to use the step title?
				// But step title is "Ceritakan tentang...", not suitable for story header.
				// Let's just use paragraph <p> for the content.
				// We need to preserve newlines as <br> or wrap in <p>
				const content = data[field.key]
					.split("\n")
					.map((line) => line.trim())
					.filter((line) => line)
					.join("<br/>");

				if (content) {
					html += `<p>${content}</p>`;
				}
			}
		});

		// Add photo if exists
		if (step.photoKey && data[step.photoKey]) {
			html += `<div class="story-image"><img src="${data[step.photoKey]}" alt="Story Image" style="width:100%; border-radius: 8px; margin: 10px 0;" /></div>`;
		}
	});

	return html;
}
