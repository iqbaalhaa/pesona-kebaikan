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
	Button,
	RadioGroup,
	FormControlLabel,
	Radio,
	Checkbox,
	Dialog,
	Snackbar,
	Alert,
	Chip,
	TextField,
	InputAdornment,
	Select,
	FormControl,
	InputLabel,
	MenuItem,
} from "@mui/material";

import { Input, Textarea } from "@/components/ui/Input";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import StepProgress from "@/components/ui/StepProgress";
import FileUploadField from "@/components/ui/FileUploadField";
import FormField from "@/components/ui/FormField";

import {
	createCampaign,
	getCampaignById,
	updateCampaign,
} from "@/actions/campaign";
import { CATEGORY_TITLE } from "@/lib/constants";
import { MEDICAL_SLUG } from "@/lib/categoryUtils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import DateRangePickerInput from "@/components/ui/DateRangePickerInput";
import StoryCreationSection from "@/components/campaign/create/StoryCreationSection";
import AjakanCreationSection from "@/components/campaign/create/AjakanCreationSection";

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

const MAX_FILE_MB = 3;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

function validateFileSize(file: File, label: string, setSnack: (s: any) => void): boolean {
	if (file.size > MAX_FILE_BYTES) {
		setSnack({ open: true, msg: `${label}: Ukuran file maksimal ${MAX_FILE_MB}MB (${(file.size / 1024 / 1024).toFixed(1)}MB)`, type: "error" });
		return false;
	}
	return true;
}

function onlyDigits(v: string) {
	return v.replace(/[^\d]/g, "");
}
function formatIDR(numStr: string) {
	const n = onlyDigits(numStr);
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function textLen(html: string) {
	return html
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/g, " ")
		.trim().length;
}

function makeSlug(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s]/g, "")
		.replace(/\s+/g, "")
		.slice(0, 60);
}

type Purpose = {
	key: string;
	title: string;
	desc: string;
};

function getFallbackPurposes(category: string): Purpose[] {
	if (
		category === "bencana" ||
		category === "bencana-alam" ||
		category === "bencana_alam"
	) {
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
}

function BuatGalangDanaPageContent() {
	const router = useRouter();
	const sp = useSearchParams();
	const { data: session, status } = useSession();

	React.useEffect(() => {
		if (status === "unauthenticated") {
			const returnUrl = `/galang-dana/buat?${sp.toString()}`;
			router.replace(
				`/auth/login?callbackUrl=${encodeURIComponent(returnUrl)}`,
			);
		}
	}, [status, router, sp]);

	const type = sp.get("type") ?? "lainnya";
	const category = (sp.get("category") ?? "").trim();
	const draftId = sp.get("draft");
	const mode = sp.get("mode") ?? "";
	const isEdit = !!draftId;
	const isContentEdit = isEdit && mode === "content";

	const isSakit = type === "sakit";
	const isLainnya = type === "lainnya";

	React.useEffect(() => {
		// kalau lainnya wajib ada category
		if (isLainnya && (!category || category === MEDICAL_SLUG) && !draftId)
			router.replace("/galang-dana/kategori");
		// kalau type aneh, balikin ke kategori
		if (!isSakit && !isLainnya && !draftId)
			router.replace("/galang-dana/kategori");
	}, [isLainnya, isSakit, category, router, draftId]);

	// Prefill data diri with the logged-in user's info (new campaign only).
	React.useEffect(() => {
		if (draftId) return;
		if (status !== "authenticated") return;
		const u = session?.user as { name?: string | null; phone?: string | null } | undefined;
		if (!u) return;
		if (u.name) {
			setKtpName((v) => v || u.name!);
		}
		if (u.phone) {
			setPhone((v) => v || u.phone!);
			setPhoneOther((v) => v || u.phone!);
		}
	}, [draftId, status, session]);

	React.useEffect(() => {
		if (!draftId) return;

		async function load() {
			const res = await getCampaignById(draftId!);
			if (res.success && res.data) {
				const c = res.data;
				const m = ((c as any).metadata as any) || {};

				if (c.type === "sakit") {
					setTitle(c.title);
					setSlug(c.slug || "");
					if (c.slug) {
						setSlugTouched(true);
					}
					setTarget(c.target.toString());
					setStory(c.description || "");
					setPhone(c.phone || "");

					setWho(m.who || "other");
					setWhoOther(m.whoOther || "");
					setBank(m.bank || "pasien");
					setPatientName(m.patientName || "");
					setPatientAge(m.patientAge || "");
					setPatientGender(m.patientGender || "L");
					setPatientCity(m.patientCity || "");
					setInpatient(m.inpatient || "tidak");
					setTreatment(m.treatment || "");
					setHospital(m.hospital || "");
					setBpjs(m.bpjs || "tidak");
					setPrevCost(m.prevCost || "mandiri");
					setUsage(m.usage || "");
					setCta(m.cta || "");
					if (m.medicalDocs) {
						setMedicalResumeUrl(m.medicalDocs.resume_medis || "");
						setMedicalExamUrl(m.medicalDocs.surat_rs || "");
					}

					if (m.storyStructure) {
						setStoryStructure(m.storyStructure);
					}

					if (m.terms) {
						setT1(m.terms.t1);
						setT2(m.terms.t2);
						setT3(m.terms.t3);
						setT4(m.terms.t4);
					}

					const startDate = new Date(c.start || new Date());
					const endDate = new Date(c.end || new Date());
					const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
					const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

					if (diffDays === 30) setDuration("30");
					else if (diffDays === 60) setDuration("60");
					else if (diffDays === 120) setDuration("120");
					else {
						setDuration("custom");
						setCustomStart(startDate.toISOString().split("T")[0]);
						setCustomEnd(endDate.toISOString().split("T")[0]);
					}

					if (isContentEdit) {
						setStep(5);
					} else {
						// Auto-navigate to last incomplete step
						let nextStep = 0;
						// Step 0: Tujuan
						if ((m.who || "other") && c.phone && (m.bank || "pasien"))
							nextStep = 1;
						// Step 1: Detail
						if (
							nextStep === 1 &&
							m.patientName &&
							m.patientAge &&
							m.patientCity
						)
							nextStep = 2;
						// Step 2: Riwayat
						if (nextStep === 2 && m.inpatient && m.treatment && m.prevCost)
							nextStep = 3;
						// Step 3: Target
						if (nextStep === 3 && c.target && Number(c.target) > 0)
							nextStep = 4;
						// Step 4: Judul
						if (nextStep === 4 && c.title) nextStep = 5;
						// Step 5: Cerita
						if (nextStep === 5 && c.description) nextStep = 6;

						setStep(nextStep);
					}
				} else {
					setTitleOther(c.title);
					setSlugOther(c.slug || "");
					if (c.slug) {
						setSlugOtherTouched(true);
					}
					setTargetOther(c.target.toString());
					setStoryOther(c.description || "");
					setPhoneOther(c.phone || "");

					setPurposeKey(m.purposeKey || "program");
					setKtpName(m.ktpName || "");
					setReceiverName(m.receiverName || "");
					setGoal(m.goal || "");
					setLocation(m.location || "");
					setUsageOther(m.usageOther || "");
					setCtaOther(m.ctaOther || "");

					setJob(m.job || "");
					setWorkplace(m.workplace || "");
					setSoc(m.soc || "");
					{
						const SOC_PREFIXES: Record<string, string> = {
							instagram: "instagram.com/",
							facebook: "facebook.com/",
							twitter: "x.com/",
							linkedin: "linkedin.com/in/",
						};
						let handle = m.socHandle || "";
						const pfx = m.soc ? SOC_PREFIXES[m.soc] : "";
						if (pfx) {
							for (const v of [`https://www.${pfx}`, `https://${pfx}`, `http://www.${pfx}`, `http://${pfx}`, `www.${pfx}`, pfx]) {
								if (handle.toLowerCase().startsWith(v.toLowerCase())) { handle = handle.slice(v.length); break; }
							}
						}
						setSocHandle(handle.replace(/^@/, ""));
					}
					setBeneficiaries(m.beneficiaries || "");

					if (m.agree) {
						setAgreeA(m.agree.agreeA);
						setAgreeB(m.agree.agreeB);
					}

					const startDate = new Date(c.start || new Date());
					const endDate = new Date(c.end || new Date());
					const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
					const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

					if (diffDays === 30) setDurationOther("30");
					else if (diffDays === 60) setDurationOther("60");
					else if (diffDays === 120) setDurationOther("120");
					else {
						setDurationOther("custom");
						setCustomStartOther(startDate.toISOString().split("T")[0]);
						setCustomEndOther(endDate.toISOString().split("T")[0]);
					}

					if (isContentEdit) {
						setStep(5);
					} else {
						// Auto-navigate to last incomplete step
						let nextStep = 0;
						// Step 0: Tujuan
						if ((m.purposeKey || "program") && m.ktpName && c.phone)
							nextStep = 1;
						// Step 1: Data Diri
						if (nextStep === 1 && m.job && m.workplace) nextStep = 2;
						// Step 2: Penerima
						if (nextStep === 2 && m.receiverName && m.goal && m.location)
							nextStep = 3;
						// Step 3: Target
						if (nextStep === 3 && c.target && Number(c.target) > 0)
							nextStep = 4;
						// Step 4: Judul
						if (nextStep === 4 && c.title) nextStep = 5;
						// Step 5: Cerita
						if (nextStep === 5 && c.description) nextStep = 6;

						setStep(nextStep);
					}
				}

				if (c.thumbnail) {
					if (c.type === "sakit") setCoverPreview(c.thumbnail);
					else setCoverPreviewOther(c.thumbnail);
				}
			}
		}
		load();
	}, [draftId, sp, router]);

	if (status === "loading") {
		return <Box sx={{ p: 4, textAlign: "center" }}>Loading session...</Box>;
	}

	const stepsContainerRef = React.useRef<HTMLDivElement>(null);

	// step state (1 aja, sesuai type)
	const [step, setStep] = React.useState(0);

	React.useEffect(() => {
		const container = stepsContainerRef.current;
		if (container) {
			const activeElement = container.children[step] as HTMLElement;
			if (activeElement) {
				activeElement.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "center",
				});
			}
		}
	}, [step]);

	const steps = isSakit ? STEPS_SAKIT : STEPS_LAINNYA;
	const stepKey = steps[step]?.key as StepKeySakit | StepKeyLainnya;

	// =========
	// SAKIT STATE
	// =========
	const [who, setWho] = React.useState<string>("");
	const [whoOther, setWhoOther] = React.useState("");
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
	const [hospital, setHospital] = React.useState("");
	const [bpjs, setBpjs] = React.useState<"ya" | "tidak" | "">("");
	const [prevCost, setPrevCost] = React.useState<"mandiri" | "asuransi" | "">(
		"",
	);
	const [medicalResumeFile, setMedicalResumeFile] = React.useState<File | null>(
		null,
	);
	const [medicalResumeUrl, setMedicalResumeUrl] = React.useState("");
	const [medicalExamFile, setMedicalExamFile] = React.useState<File | null>(
		null,
	);
	const [medicalExamUrl, setMedicalExamUrl] = React.useState("");

	const [target, setTarget] = React.useState("");
	const [duration, setDuration] = React.useState<
		"30" | "60" | "120" | "custom" | ""
	>("");
	const [customStart, setCustomStart] = React.useState("");
	const [customEnd, setCustomEnd] = React.useState("");
	const [usage, setUsage] = React.useState("");

	const [title, setTitle] = React.useState("");
	const [slug, setSlug] = React.useState("");
	const [slugError, setSlugError] = React.useState("");
	const [slugChecking, setSlugChecking] = React.useState(false);
	const [slugAvailable, setSlugAvailable] = React.useState(false);
	const [slugTouched, setSlugTouched] = React.useState(false);
	const slugDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const [coverName, setCoverName] = React.useState<string>("");
	const [coverFile, setCoverFile] = React.useState<File | null>(null);
	const [coverPreview, setCoverPreview] = React.useState<string>("");

	const [story, setStory] = React.useState("");
	const [storyStructure, setStoryStructure] = React.useState<any>(null);
	const [showStoryEditor, setShowStoryEditor] = React.useState(false);
	const [storyLoaded, setStoryLoaded] = React.useState(false);

	// Persistence for Story (Medis)
	React.useEffect(() => {
		if (isEdit) {
			setStoryLoaded(true);
			return;
		}

		try {
			const saved = localStorage.getItem("draft_story_medis");
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.html) {
					setStory(parsed.html);
					setStoryStructure(parsed.structure || null);
				}
			}
		} catch (e) {
			console.error("Failed to load draft story", e);
		} finally {
			setStoryLoaded(true);
		}
	}, [isEdit]);

	React.useEffect(() => {
		if (isEdit) return;
		if (!storyLoaded) return; // Don't save before load

		try {
			if (story) {
				localStorage.setItem(
					"draft_story_medis",
					JSON.stringify({ html: story, structure: storyStructure }),
				);
			} else {
				// If explicitly cleared or empty, maybe remove?
				// But we only want to remove if we intend to clear it.
				// For now, if story becomes empty string (e.g. user cleared it), we update storage.
				// However, initial state is empty.
				// We should probably only save if we have something or if the user explicitly deleted it.
				// Let's just save whatever state is there.
				// But wait, if we clear it in UI, we want to clear storage.
				// If it was empty to begin with, no harm.
				// CAUTION: If we haven't loaded yet, don't save (handled by storyLoaded check).
				// If we loaded and it's empty, and we save empty, that's fine.
				// But if we remove the key, it's better.
				// localStorage.removeItem("draft_story_medis");
			}
		} catch (e) {
			console.error("Failed to save draft story", e);
		}
	}, [story, storyStructure, isEdit, storyLoaded]);

	// Debounced slug check — sakit flow
	React.useEffect(() => {
		if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
		if (!slug) {
			setSlugError("");
			setSlugAvailable(false);
			setSlugChecking(false);
			return;
		}
		setSlugChecking(true);
		slugDebounceRef.current = setTimeout(async () => {
			try {
				const params = new URLSearchParams({ slug });
				if (isEdit && draftId) params.set("excludeId", draftId);
				const res = await fetch(`/api/campaigns/check-slug?${params.toString()}`);
				if (!res.ok) return;
				const data = (await res.json()) as { available: boolean };
				if (!data.available) {
					setSlugError("Link ini sudah digunakan, coba link lain");
					setSlugAvailable(false);
				} else {
					setSlugError("");
					setSlugAvailable(true);
				}
			} catch {
			} finally {
				setSlugChecking(false);
			}
		}, 700);
		return () => {
			if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
		};
	}, [slug, isEdit, draftId]); // eslint-disable-line react-hooks/exhaustive-deps

	const [cta, setCta] = React.useState("");
	const ctaLeft = 160 - cta.length;

	const canOpenConfirm =
		(who === "other" ? !!whoOther : !!who) &&
		phone.trim().length >= 8;
	const allTermsOk = t1 && t2 && t3 && t4;

	const [purposes, setPurposes] = React.useState<Purpose[]>([]);
	const [categoryExamples, setCategoryExamples] = React.useState<string[]>([]);

	React.useEffect(() => {
		if (!isLainnya) {
			setPurposes([]);
			setCategoryExamples([]);
			return;
		}

		if (!category) {
			setPurposes([]);
			setCategoryExamples([]);
			return;
		}

		let cancelled = false;

		async function load() {
			try {
				const res = await fetch("/api/campaigns/categories", {
					cache: "no-store",
				});
				if (!res.ok) {
					if (!cancelled) {
						setPurposes(getFallbackPurposes(category));
						setCategoryExamples([]);
					}
					return;
				}

				const data = await res.json();
				if (!Array.isArray(data)) {
					if (!cancelled) {
						setPurposes(getFallbackPurposes(category));
						setCategoryExamples([]);
					}
					return;
				}

				const catName =
					CATEGORY_TITLE[category as keyof typeof CATEGORY_TITLE] || "";

				const matched =
					data.find((c: any) => c.slug === category) ||
					(catName ? data.find((c: any) => c.name === catName) : null);

				if (!matched) {
					if (!cancelled) {
						setPurposes(getFallbackPurposes(category));
						setCategoryExamples([]);
					}
					return;
				}

				const dbOptions = Array.isArray(matched.options) ? matched.options : [];
				const activeOptions = dbOptions.filter(
					(o: any) => o.isActive !== false,
				);

				if (activeOptions.length > 0) {
					if (!cancelled) {
						setPurposes(
							activeOptions.map((o: any) => ({
								key: o.id,
								title: o.title,
								desc: o.desc || "",
							})),
						);
					}
				} else if (!cancelled) {
					setPurposes(getFallbackPurposes(category));
				}

				const dbExamples = Array.isArray(matched.examples)
					? matched.examples
					: [];
				const activeExamples = dbExamples.filter(
					(e: any) => e.isActive !== false,
				);

				if (!cancelled) {
					setCategoryExamples(activeExamples.map((e: any) => e.title));
				}
			} catch {
				if (!cancelled) {
					setPurposes(getFallbackPurposes(category));
					setCategoryExamples([]);
				}
			}
		}

		load();

		return () => {
			cancelled = true;
		};
	}, [category, isLainnya]);

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
	const [customStartOther, setCustomStartOther] = React.useState("");
	const [customEndOther, setCustomEndOther] = React.useState("");
	const [usageOther, setUsageOther] = React.useState("");

	const [titleOther, setTitleOther] = React.useState("");
	const [slugOther, setSlugOther] = React.useState("");
	const [slugOtherError, setSlugOtherError] = React.useState("");
	const [slugOtherChecking, setSlugOtherChecking] = React.useState(false);
	const [slugOtherAvailable, setSlugOtherAvailable] = React.useState(false);
	const [slugOtherTouched, setSlugOtherTouched] = React.useState(false);
	const slugOtherDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const [coverNameOther, setCoverNameOther] = React.useState("");
	const [coverFileOther, setCoverFileOther] = React.useState<File | null>(null);
	const [coverPreviewOther, setCoverPreviewOther] = React.useState<string>("");

	const [storyOther, setStoryOther] = React.useState("");
	const [storyStructureOther, setStoryStructureOther] =
		React.useState<any>(null);
	const [showStoryEditorOther, setShowStoryEditorOther] = React.useState(false);
	const [storyOtherLoaded, setStoryOtherLoaded] = React.useState(false);

	// Persistence for Story (Lainnya)
	React.useEffect(() => {
		if (isEdit) {
			setStoryOtherLoaded(true);
			return;
		}

		try {
			const saved = localStorage.getItem("draft_story_other");
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.html) {
					setStoryOther(parsed.html);
					setStoryStructureOther(parsed.structure || null);
				}
			}
		} catch (e) {
			console.error("Failed to load draft story other", e);
		} finally {
			setStoryOtherLoaded(true);
		}
	}, [isEdit]);

	React.useEffect(() => {
		if (isEdit) return;
		if (!storyOtherLoaded) return;

		try {
			if (storyOther) {
				localStorage.setItem(
					"draft_story_other",
					JSON.stringify({ html: storyOther, structure: storyStructureOther }),
				);
			}
		} catch (e) {
			console.error("Failed to save draft story other", e);
		}
	}, [storyOther, storyStructureOther, isEdit, storyOtherLoaded]);

	// Debounced slug check — lainnya flow
	React.useEffect(() => {
		if (slugOtherDebounceRef.current) clearTimeout(slugOtherDebounceRef.current);
		if (!slugOther) {
			setSlugOtherError("");
			setSlugOtherAvailable(false);
			setSlugOtherChecking(false);
			return;
		}
		setSlugOtherChecking(true);
		slugOtherDebounceRef.current = setTimeout(async () => {
			try {
				const params = new URLSearchParams({ slug: slugOther });
				if (isEdit && draftId) params.set("excludeId", draftId);
				const res = await fetch(`/api/campaigns/check-slug?${params.toString()}`);
				if (!res.ok) return;
				const data = (await res.json()) as { available: boolean };
				if (!data.available) {
					setSlugOtherError("Link ini sudah digunakan, coba link lain");
					setSlugOtherAvailable(false);
				} else {
					setSlugOtherError("");
					setSlugOtherAvailable(true);
				}
			} catch {
			} finally {
				setSlugOtherChecking(false);
			}
		}, 700);
		return () => {
			if (slugOtherDebounceRef.current) clearTimeout(slugOtherDebounceRef.current);
		};
	}, [slugOther, isEdit, draftId]); // eslint-disable-line react-hooks/exhaustive-deps

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
				return (
					!!patientName && !!patientAge && !!patientGender && !!patientCity
				);
			if (stepKey === "riwayat")
				return (
					!!inpatient &&
					(inpatient === "ya" ? !!hospital : true) &&
					treatment.trim().length >= 55 &&
					!!prevCost &&
					!!medicalResumeUrl &&
					!!medicalExamUrl
				);
			if (stepKey === "target")
				return (
					!!onlyDigits(target) &&
					!!duration &&
					(duration === "custom" ? !!customStart && !!customEnd : true) &&
					usage.trim().length >= 55 &&
					!!bank
				);
			if (stepKey === "judul")
				return !!title && !!slug && !!coverPreview && !slugError;
			if (stepKey === "cerita") return textLen(story) >= 30;
			if (stepKey === "ajakan") return cta.trim().length >= 10;
			return false;
		}

		// ---- lainnya
		if (stepKey === "tujuan") return !!purposeKey;
		if (stepKey === "data_diri")
			return (
				ktpName.trim().length >= 3 &&
				phoneOther.trim().length >= 8 &&
				!!job &&
				!!workplace &&
				!!soc &&
				!!socHandle
			);
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
				(durationOther === "custom"
					? !!customStartOther && !!customEndOther
					: true) &&
				usageOther.trim().length >= 55
			);
		if (stepKey === "judul")
			return (
				!!titleOther && !!slugOther && !!coverPreviewOther && !slugOtherError
			);
		if (stepKey === "cerita") return textLen(storyOther) >= 30;
		if (stepKey === "ajakan") return ctaOther.trim().length >= 10 && agreeA && agreeB;
		return false;
	}, [
		isSakit,
		stepKey,
		canOpenConfirm,
		patientName,
		patientAge,
		patientGender,
		patientCity,
		inpatient,
		hospital,
		treatment,
		prevCost,
		medicalResumeUrl,
		medicalExamUrl,
		target,
		duration,
		customStart,
		customEnd,
		usage,
		title,
		slug,
		slugError,
		coverPreview,
		story,
		cta,
		// lainnya deps
		purposeKey,
		agreeA,
		agreeB,
		ktpName,
		phoneOther,
		job,
		workplace,
		soc,
		socHandle,
		receiverName,
		goal,
		location,
		targetOther,
		durationOther,
		customStartOther,
		customEndOther,
		usageOther,
		titleOther,
		slugOther,
		coverPreviewOther,
		storyOther,
		ctaOther,
	]);

	const goPrev = () =>
		setStep((s) => (isContentEdit ? Math.max(5, s - 1) : Math.max(0, s - 1)));
	const goNext = () => setStep((s) => Math.min(steps.length - 1, s + 1));

	const onClickNext = async () => {
		if (!canNext || submitting) return;

		if (isSakit && stepKey === "tujuan") {
			setOpenTerms(true);
			return;
		}

		if (stepKey === "ajakan") {
			setSubmitting(true);
			try {
				const formData = new FormData();

				if (isSakit) {
					formData.append("title", title);
					formData.append("slug", slug);
					formData.append("category", "medis");
					formData.append("type", "sakit");
					formData.append("target", target);
					formData.append("duration", duration);
					if (duration === "custom") {
						formData.append("customStart", customStart);
						formData.append("customEnd", customEnd);
					}
					formData.append("phone", phone);

					if (coverPreview) formData.append("coverUrl", coverPreview);

					formData.append("story", story);
				} else {
					formData.append("title", titleOther);
					formData.append("slug", slugOther);
					formData.append("category", category); // "pendidikan", "bencana", etc.
					formData.append("type", "lainnya");
					formData.append("target", targetOther);
					formData.append("duration", durationOther);
					if (durationOther === "custom") {
						formData.append("customStart", customStartOther);
						formData.append("customEnd", customEndOther);
					}
					formData.append("phone", phoneOther);

					if (coverPreviewOther) formData.append("coverUrl", coverPreviewOther);

					formData.append("story", storyOther);
				}

				const metadata = isSakit
					? {
							who,
							whoOther,
							bank,
							patientName,
							patientAge,
							patientGender,
							patientCity,
							treatment,
							hospital,
							inpatient,
							bpjs,
							prevCost,
							usage,
							cta,
							terms: { t1, t2, t3, t4 },
							medicalDocs: {
								resume_medis: medicalResumeUrl,
								surat_rs: medicalExamUrl,
							},
							storyStructure,
						}
					: {
							purposeKey,
							ktpName,
							receiverName,
							goal,
							location,
							usageOther,
							ctaOther,
							job,
							workplace,
							soc,
							socHandle,
							beneficiaries,
							agree: { agreeA, agreeB },
						};
				formData.append("metadata", JSON.stringify(metadata));

				let res;
				if (isEdit) {
					formData.append("status", "PENDING");
					res = await updateCampaign(draftId!, formData);
				} else {
					res = await createCampaign(formData);
				}

				if (res.success) {
					setSnack({
						open: true,
						msg: isEdit
							? "Campaign berhasil diperbarui!"
							: "Campaign berhasil dibuat!",
						type: "success",
					});
					// Clear draft from localStorage
					try {
						localStorage.removeItem("draft_story_medis");
						localStorage.removeItem("draft_story_other");
					} catch {}
					// Redirect
					setTimeout(() => {
						router.refresh();
						router.push("/galang-dana");
					}, 1500);
				} else {
					setSnack({
						open: true,
						msg: res.error || "Gagal membuat campaign",
						type: "error",
					});
				}
			} catch (error: any) {
				console.error("Failed to create/update campaign:", error);
				setSnack({
					open: true,
					msg: error.message || "Terjadi kesalahan saat menyimpan campaign",
					type: "error",
				});
			} finally {
				setSubmitting(false);
			}
			return;
		}

		goNext();
	};

	const handleSaveDraft = async () => {
		setSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("status", "DRAFT");

			if (isSakit) {
				formData.append("title", title);
				formData.append("slug", slug);
				formData.append("category", "medis");
				formData.append("type", "sakit");
				formData.append("target", target);
				formData.append("duration", duration);
				if (duration === "custom") {
					formData.append("customStart", customStart);
					formData.append("customEnd", customEnd);
				}
				formData.append("phone", phone);

				if (coverPreview) formData.append("coverUrl", coverPreview);

				formData.append("story", story);
			} else {
				formData.append("title", titleOther);
				formData.append("slug", slugOther);
				formData.append("category", category);
				formData.append("type", "lainnya");
				formData.append("target", targetOther);
				formData.append("duration", durationOther);
				if (durationOther === "custom") {
					formData.append("customStart", customStartOther);
					formData.append("customEnd", customEndOther);
				}
				formData.append("phone", phoneOther);

				if (coverPreviewOther) formData.append("coverUrl", coverPreviewOther);

				formData.append("story", storyOther);
			}

			// Prepare metadata
			const metadata = isSakit
				? {
						who,
						whoOther,
						bank,
						patientName,
						patientAge,
						patientGender,
						patientCity,
						treatment,
						hospital,
						inpatient,
						bpjs,
						prevCost,
						usage,
						cta,
						terms: { t1, t2, t3, t4 },
						medicalDocs: {
							resume_medis: medicalResumeUrl,
							surat_rs: medicalExamUrl,
						},
					}
				: {
						purposeKey,
						ktpName,
						receiverName,
						goal,
						location,
						usageOther,
						ctaOther,
						job,
						workplace,
						soc,
						socHandle,
						beneficiaries,
						agree: { agreeA, agreeB },
					};
			formData.append("metadata", JSON.stringify(metadata));

			let res;
			if (isEdit) {
				res = await updateCampaign(draftId!, formData);
			} else {
				res = await createCampaign(formData);
			}

			if (res.success) {
				setSnack({
					open: true,
					msg: "Draft berhasil disimpan!",
					type: "success",
				});
				setTimeout(() => {
					router.refresh();
					router.push("/galang-dana");
				}, 1500);
			} else {
				setSnack({
					open: true,
					msg: res.error || "Gagal menyimpan draft",
					type: "error",
				});
			}
		} catch (error: any) {
			console.error("Failed to save draft:", error);
			setSnack({
				open: true,
				msg: error.message || "Terjadi kesalahan saat menyimpan draft",
				type: "error",
			});
		} finally {
			setSubmitting(false);
		}
	};

	const headerTitle = isEdit
		? "Edit Campaign"
		: isSakit
			? "Bantuan Medis & Kesehatan"
			: (CATEGORY_TITLE[category] ?? "Galang Dana");

	return (
		<Box
			sx={{
				pb: "180px",
			}}
		>
			{/* Header */}
			<div className="bg-primary px-1 py-[5px]">
				<div className="flex items-center gap-1">
					<button
						onClick={() => router.back()}
						className="grid h-9 w-9 place-items-center rounded-lg text-white"
					>
						<ArrowBackIosNewRoundedIcon fontSize="small" />
					</button>
					<span className="text-sm font-semibold text-white">
						{headerTitle}
					</span>
				</div>
			</div>

			{/* Step progress */}
			<StepProgress
				steps={steps}
				current={step}
				onStepClick={(i) => {
					const isFuture = !isEdit && i > step;
					const locked = isContentEdit && i < 5;
					if (!isFuture && !locked) setStep(i);
				}}
				canNavigate={(i) => {
					const isFuture = !isEdit && i > step;
					const locked = isContentEdit && i < 5;
					return !isFuture && !locked;
				}}
			/>

			{isContentEdit && (
				<Box sx={{ px: 2, pb: 1 }}>
					<Typography
						sx={{
							fontSize: 12,
							color: "text.secondary",
							bgcolor: "warning.50",
							borderRadius: 2,
							border: "1px solid",
							borderColor: "warning.100",
							px: 1.5,
							py: 1,
						}}
					>
						Anda hanya dapat mengubah Cerita dan Ajakan pada campaign yang sudah
						berjalan.
					</Typography>
				</Box>
			)}

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
									Siapa yang sakit? <span style={{ color: "red" }}>*</span>
								</Typography>

								<RadioGroup
									aria-label="Siapa yang sakit?"
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
										{who === "other" && (
											<Box sx={{ px: 1.5, pb: 1.5, mt: -0.5 }}>
												<Input
													placeholder="Sebutkan hubungan dengan pasien"
													value={whoOther}
													onChange={(e) => setWhoOther(e.target.value)}
												/>
											</Box>
										)}
									</Paper>
								</RadioGroup>

								{inpatient === "ya" && (
									<Box sx={{ mt: 2 }}>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Nama Rumah Sakit <span style={{ color: "red" }}>*</span>
										</Typography>
										<Input
											value={hospital}
											onChange={(e) => setHospital(e.target.value)}
											placeholder="Masukkan nama rumah sakit"
										/>
									</Box>
								)}

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
										Masukkan no. ponsel kamu{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<Typography
										sx={{ color: "text.secondary", fontSize: 12.5, mb: 1 }}
									></Typography>

									<Input
										value={phone}
										onChange={(e) =>
											setPhone(onlyDigits(e.target.value).slice(0, 15))
										}
										placeholder="Pastikan nomor aktif memiliki WA"
										inputMode="numeric"
										error={
											phone.length > 0 && phone.length < 10
												? "Nomor ponsel belum lengkap (minimal 10 digit)"
												: undefined
										}
									/>
								</Box>

							</Box>
						)}

						{stepKey === "detail" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Detail pasien
								</Typography>

								<Stack spacing={1.25}>
									<Input
										placeholder="Nama pasien *"
										value={patientName}
										onChange={(e) => setPatientName(e.target.value)}
									/>
									<Input
										placeholder="Usia pasien *"
										value={patientAge}
										onChange={(e) => setPatientAge(onlyDigits(e.target.value))}
										inputMode="numeric"
									/>
									<Input
										placeholder="Domisili pasien (kota/kab) *"
										value={patientCity}
										onChange={(e) => setPatientCity(e.target.value)}
									/>

									<Paper variant="outlined" sx={{ borderRadius: 2, p: 1 }}>
										<Typography sx={{ fontWeight: 600, mb: 0.5 }}>
											Jenis kelamin <span style={{ color: "red" }}>*</span>
										</Typography>
										<RadioGroup
											row
											aria-label="Jenis kelamin pasien"
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
									Apakah pasien sedang menjalani rawat inap di rumah sakit?{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>

								<RadioGroup
									aria-label="Apakah pasien sedang menjalani rawat inap?"
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

								{inpatient === "ya" && (
									<Box sx={{ mt: 2 }}>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Nama Rumah Sakit <span style={{ color: "red" }}>*</span>
										</Typography>
										<Input
											value={hospital}
											onChange={(e) => setHospital(e.target.value)}
											placeholder="Masukkan nama rumah sakit"
										/>
									</Box>
								)}

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Upaya pengobatan yang sudah atau sedang dilakukan{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<Textarea
										value={treatment}
										onChange={(e) => setTreatment(e.target.value)}
										rows={4}
										placeholder="Jelaskan secara lengkap upaya apa yang dilakukan dan tempat dilakukan..."
										error={
											treatment.length > 0 && treatment.length < 55
												? `Minimal 55 karakter (${treatment.length}/55)`
												: undefined
										}
									/>
								</Box>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Dari mana sumber biaya pengobatan/perawatan sebelumnya?{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>

									<RadioGroup
										aria-label="Sumber biaya pengobatan sebelumnya"
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

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Unggah dokumen medis pendukung{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<Typography
										sx={{ fontSize: 12.5, color: "text.secondary", mb: 1 }}
									>
										Surat keterangan medis dengan diagnosis/penyakit dan hasil
										pemeriksaan (lab, rontgen, dsb.) sangat membantu proses
										verifikasi. (Maksimal ukuran file 3MB)
									</Typography>

									<div className="flex flex-col gap-2">
										<FileUploadField
											label="Surat keterangan medis / diagnosis"
											accept="image/*,.pdf"
											value={medicalResumeUrl}
											preview={false}
											onUploaded={(url) => {
												setMedicalResumeUrl(url);
												setMedicalResumeFile(null);
											}}
											onClear={() => {
												setMedicalResumeUrl("");
												setMedicalResumeFile(null);
											}}
										/>
										<FileUploadField
											label="Hasil pemeriksaan (lab, rontgen, dsb.)"
											accept="image/*,.pdf"
											value={medicalExamUrl}
											preview={false}
											onUploaded={(url) => {
												setMedicalExamUrl(url);
												setMedicalExamFile(null);
											}}
											onClear={() => {
												setMedicalExamUrl("");
												setMedicalExamFile(null);
											}}
										/>
									</div>
								</Box>
							</Box>
						)}

						{stepKey === "target" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
									Tentukan perkiraan biaya yang dibutuhkan{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>

								<Input
									value={formatIDR(target)}
									onChange={(e) => setTarget(e.target.value)}
									placeholder="Masukkan jumlah kebutuhan biaya"
									inputMode="numeric"
									startAdornment={<span>Rp</span>}
								/>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Tentukan lama galang dana berlangsung{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>

									<RadioGroup
										aria-label="Lama galang dana berlangsung"
										value={duration}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											const val = e.target.value as
												| "30"
												| "60"
												| "120"
												| "custom"
												| "";
											setDuration(val);
											if (val === "custom" && !customStart) {
												setCustomStart(format(new Date(), "yyyy-MM-dd"));
											}
										}}
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
													{x.v === "custom" && duration === "custom" && (
														<Box sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
															<DateRangePickerInput
																start={customStart}
																end={customEnd}
																onChange={(start, end) => {
																	if (start !== customStart)
																		setCustomStart(start || "");
																	if (end !== customEnd)
																		setCustomEnd(end || "");
																}}
															/>
														</Box>
													)}
												</Paper>
											))}
										</Stack>
									</RadioGroup>
								</Box>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Isi rincian penggunaan dana{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<Textarea
										value={usage}
										onChange={(e) => setUsage(e.target.value)}
										rows={4}
										placeholder="Contoh: vitamin Rp2.000.000, rawat inap 10 hari Rp5.000.000, operasi Rp20.000.000"
										error={
											usage.length > 0 && usage.trim().length < 55
												? `Minimal 55 karakter (${usage.trim().length}/55)`
												: undefined
										}
									/>
								</Box>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
										Pilih rekening bank penggalangan dana{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<Typography
										sx={{ color: "text.secondary", fontSize: 12.5, mb: 1 }}
									>
										Donasi hanya bisa dicairkan ke rekening ini.
									</Typography>

									<RadioGroup
										aria-label="Pilih rekening bank penggalangan dana"
										value={bank}
										onChange={(e) => setBank(e.target.value)}
									>
										<Stack spacing={1}>
											{[
												{ k: "pasien", t: "Pasien langsung" },
												{ k: "kk", t: "Keluarga satu KK" },
												{ k: "beda_kk", t: "Keluarga inti berbeda KK" },
												{ k: "rs", t: "Rumah sakit" },
												{ k: "yayasan", t: "Rekening Pesona Kebaikan" },
											].map((x) => (
												<Paper
													key={x.k}
													variant="outlined"
													sx={{ borderRadius: 2 }}
												>
													<FormControlLabel
														value={x.k}
														sx={{
															px: 1.5,
															py: 0.5,
															width: "100%",
															"& .MuiFormControlLabel-label": {
																fontSize: 13.5,
															},
														}}
														control={<Radio size="small" />}
														label={x.t}
													/>
												</Paper>
											))}
										</Stack>
									</RadioGroup>
								</Box>
							</Box>
						)}

						{stepKey === "judul" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Beri judul untuk galang dana ini{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>

								<Stack spacing={1.25}>
									<Input
										value={title}
										onChange={(e) => {
											const value = e.target.value.slice(0, 55);
											setTitle(value);
											if (!slugTouched || !slug) {
												const generated = makeSlug(value);
												setSlug(generated);
												setSlugError("");
											}
										}}
										placeholder="Contoh: Bantu Abi melawan kanker hati"
										helperText={`${title.length}/55`}
									/>

									<Box>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Tentukan link untuk galang dana ini{" "}
											<span style={{ color: "red" }}>*</span>
										</Typography>
										<Input
											value={slug}
											onChange={(e) => {
												setSlugTouched(true);
												setSlugError("");
												setSlugAvailable(false);
												setSlug(makeSlug(e.target.value));
											}}
											error={slugError || undefined}
											helperText={
												slugError
													? undefined
													: slugChecking
														? "Memeriksa ketersediaan..."
														: slug && slugAvailable
															? undefined
															: "Contoh: bantuoperasiibusiti"
											}
											maxLength={60}
											placeholder="Contoh: bantuoperasiibusiti"
										/>
										{!slugError && !slugChecking && slug && slugAvailable && (
											<Typography
												sx={{
													mt: 0.5,
													fontSize: 12,
													color: "success.main",
												}}
											>
												URL public ini dapat digunakan
											</Typography>
										)}
									</Box>

									<FileUploadField
										label="Upload Cover/Thumbnail Galang Dana *"
										note="Disarankan ukuran 664 x 357 piksel."
										accept="image/*"
										cropAspect={664 / 357}
										aspectRatio="664/357"
										value={coverPreview}
										onUploaded={(url) => {
											setCoverPreview(url);
											setCoverFile(null);
										}}
										onClear={() => {
											setCoverPreview("");
											setCoverFile(null);
											setCoverName("");
										}}
									/>

									</Stack>
							</Box>
						)}

						{stepKey === "cerita" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Tuliskan cerita tentang galang dana ini{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>

								<StoryCreationSection
									mode="wizard"
									category="sakit"
									story={story}
									storyStructure={storyStructure}
									onSave={(html, structure) => {
										setStory(html);
										setStoryStructure(structure);
										setShowStoryEditor(false); // Update local state if needed
									}}
									loaded={storyLoaded}
									defaultShowEditor={showStoryEditor}
								/>
							</Box>
						)}

						{stepKey === "ajakan" && (
							<AjakanCreationSection
								value={cta}
								onChange={setCta}
								placeholder="Contoh: Penghasilan saya hanya Rp20rb/hari, padahal Abi butuh biaya berobat..."
								error={ctaLeft < 0}
								campaignTitle={title}
								coverUrl={coverPreview}
							/>
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
							<div>
								<p className="mb-2 text-sm font-semibold text-foreground">
									Untuk apa galang dana ini? <span className="text-red-500">*</span>
								</p>
								<div className="flex flex-col gap-2">
									{purposes.map((p) => {
										const selected = purposeKey === p.key;
										return (
											<button
												key={p.key}
												type="button"
												onClick={() => setPurposeKey(selected ? "" : p.key)}
												className={[
													"flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-all",
													selected
														? "border-primary bg-primary/5"
														: "border-foreground/10 bg-white hover:border-foreground/20",
												].join(" ")}
											>
												<span className={[
													"mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors",
													selected
														? "border-primary bg-primary text-white"
														: "border-foreground/20 bg-white",
												].join(" ")}>
													{selected && (
														<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
															<path d="M20 6 9 17l-5-5" />
														</svg>
													)}
												</span>
												<div className="min-w-0 flex-1">
													<p className="text-[13.5px] font-bold text-foreground">{p.title}</p>
													{p.desc && (
														<p className="mt-0.5 text-xs text-foreground/55">{p.desc}</p>
													)}
												</div>
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* STEP: data diri */}
						{stepKey === "data_diri" && (
							<Box>
								<Stack spacing={1.25}>
									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Nama kamu sesuai KTP{" "}
											<span style={{ color: "red" }}>*</span>
										</Typography>
										<Input
											value={ktpName}
											onChange={(e) => setKtpName(e.target.value)}
											placeholder="Nama sesuai KTP"
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
											Masukkan no. ponsel kamu{" "}
											<span style={{ color: "red" }}>*</span>
										</Typography>
										<Typography
											sx={{ color: "text.secondary", fontSize: 12.5, mb: 1 }}
										>
											Seluruh notifikasi akan dikirim melalui nomor ini
										</Typography>
										<Input
											value={phoneOther}
											onChange={(e) =>
												setPhoneOther(onlyDigits(e.target.value).slice(0, 15))
											}
											inputMode="numeric"
											placeholder="Masukkan no. ponsel"
											error={
												phoneOther.length > 0 && phoneOther.length < 10
													? "Nomor ponsel belum lengkap (minimal 10 digit)"
													: undefined
											}
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Pekerjaan kamu saat ini{" "}
											<span style={{ color: "red" }}>*</span>
										</Typography>
										<Input
											value={job}
											onChange={(e) => setJob(e.target.value)}
											placeholder="Contoh: Karyawan swasta, Pelajar"
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Nama sekolah/tempat kerja{" "}
											<span style={{ color: "red" }}>*</span>
										</Typography>
										<Input
											value={workplace}
											onChange={(e) => setWorkplace(e.target.value)}
											placeholder="Masukkan nama sekolah/tempat kerja"
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
											Akun media sosial kamu{" "}
											<span style={{ color: "red" }}>*</span>
										</Typography>
										<Typography
											sx={{ color: "text.secondary", fontSize: 12.5, mb: 1 }}
										>
											Galang dana akan ditolak jika akun media sosial kamu tidak
											dapat ditemukan
										</Typography>

										<Stack spacing={1.5}>
											<FormControl fullWidth size="small">
												<InputLabel>Pilih platform</InputLabel>
												<Select
													value={soc}
													label="Pilih platform"
													onChange={(e) => {
														setSoc(e.target.value as typeof soc);
														setSocHandle("");
													}}
													sx={{ borderRadius: 2 }}
												>
													<MenuItem value="instagram">Instagram</MenuItem>
													<MenuItem value="facebook">Facebook</MenuItem>
													<MenuItem value="twitter">Twitter / X</MenuItem>
													<MenuItem value="linkedin">LinkedIn</MenuItem>
												</Select>
											</FormControl>

											{soc ? (
												<TextField
													fullWidth
													size="small"
													placeholder="username"
													value={socHandle}
													onChange={(e) => {
														const v = e.target.value.trim();
														setSocHandle(v.startsWith("@") ? v.slice(1) : v);
													}}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Typography sx={{ fontSize: 13, color: "text.secondary", whiteSpace: "nowrap" }}>
																	{({
																		instagram: "instagram.com/",
																		facebook: "facebook.com/",
																		twitter: "x.com/",
																		linkedin: "linkedin.com/in/",
																	} as Record<string, string>)[soc]}
																</Typography>
															</InputAdornment>
														),
													}}
													sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
												/>
											) : null}
										</Stack>
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
											Nama penerima manfaat{" "}
											<span style={{ color: "red" }}>*</span>
										</Typography>
										<Input
											value={receiverName}
											onChange={(e) => setReceiverName(e.target.value)}
											placeholder="Contoh: Ahmad Fauzi, Ibu Siti, Anak-anak Panti Harapan"
											error={
												receiverName.length > 0 &&
												receiverName.trim().length < 3
													? "Minimal 3 karakter"
													: undefined
											}
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Tujuan galang dana <span style={{ color: "red" }}>*</span>
										</Typography>
										<Input
											value={goal}
											onChange={(e) => setGoal(e.target.value)}
											placeholder="Contoh: Bantuan pendidikan, santunan anak yatim"
											error={
												goal.length > 0 && goal.trim().length < 10
													? "Minimal 10 karakter"
													: undefined
											}
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Lokasi <span style={{ color: "red" }}>*</span>
										</Typography>
										<Textarea
											value={location}
											onChange={(e) => setLocation(e.target.value)}
											rows={2}
											placeholder="Contoh: Kelurahan..., Kecamatan..., Kota/Kab..."
											error={
												location.length > 0 && location.trim().length < 8
													? "Minimal 8 karakter"
													: undefined
											}
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Jumlah penerima manfaat (orang){" "}
											<span style={{ color: "rgba(15,23,42,.55)" }}>(opsional)</span>
										</Typography>
										<Input
											value={beneficiaries}
											onChange={(e) => setBeneficiaries(onlyDigits(e.target.value))}
											inputMode="numeric"
											placeholder="Contoh: 100"
										/>
									</Box>
								</Stack>
							</Box>
						)}

						{/* STEP: target */}
						{stepKey === "target" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
									Tentukan perkiraan biaya yang dibutuhkan{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>

								<Input
									value={formatIDR(targetOther)}
									onChange={(e) => setTargetOther(e.target.value)}
									placeholder="Masukkan jumlah kebutuhan biaya"
									inputMode="numeric"
									startAdornment={<span>Rp</span>}
								/>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Tentukan lama galang dana berlangsung{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>

									<RadioGroup
										aria-label="Lama galang dana berlangsung"
										value={durationOther}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											const val = e.target.value as
												| "30"
												| "60"
												| "120"
												| "custom"
												| "";
											setDurationOther(val);
											if (val === "custom" && !customStartOther) {
												setCustomStartOther(format(new Date(), "yyyy-MM-dd"));
											}
										}}
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
													{x.v === "custom" && durationOther === "custom" && (
														<Box sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
															<DateRangePickerInput
																start={customStartOther}
																end={customEndOther}
																onChange={(start, end) => {
																	if (start !== customStartOther)
																		setCustomStartOther(start || "");
																	if (end !== customEndOther)
																		setCustomEndOther(end || "");
																}}
															/>
														</Box>
													)}
												</Paper>
											))}
										</Stack>
									</RadioGroup>
								</Box>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Isi rincian penggunaan dana{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<Textarea
										value={usageOther}
										onChange={(e) => setUsageOther(e.target.value)}
										rows={4}
										placeholder="Contoh: biaya bahan bangunan Rp2.000.000, biaya tukang Rp10.000.000"
										error={
											usageOther.length > 0 && usageOther.trim().length < 55
												? `Minimal 55 karakter (${usageOther.trim().length}/55)`
												: undefined
										}
									/>
								</Box>
							</Box>
						)}

						{/* STEP: judul */}
						{stepKey === "judul" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Beri judul untuk galang dana ini{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>

								<Stack spacing={1.25}>
									<Input
										value={titleOther}
										onChange={(e) => {
											const value = e.target.value.slice(0, 55);
											setTitleOther(value);
											if (!slugOtherTouched || !slugOther) {
												const generated = makeSlug(value);
												setSlugOther(generated);
												setSlugOtherError("");
											}
										}}
										placeholder="Contoh: Bantu renovasi masjid terdampak bencana"
										helperText={`${titleOther.length}/55`}
									/>

									{categoryExamples.length > 0 && (
										<Box>
											<Typography
												sx={{
													fontSize: 12.5,
													color: "text.secondary",
													mb: 0.5,
												}}
											>
												Contoh judul dari admin:
											</Typography>
											<Stack
												direction="row"
												spacing={1}
												sx={{ flexWrap: "wrap" }}
											>
												{categoryExamples.map((ex) => (
													<Button
														key={ex}
														variant="outlined"
														size="small"
														onClick={() => {
															const value = ex.slice(0, 55);
															setTitleOther(value);
															if (!slugOtherTouched || !slugOther) {
																const generated = makeSlug(value);
																setSlugOther(generated);
																setSlugOtherError("");
															}
														}}
														sx={{
															textTransform: "none",
															fontSize: 12,
															borderRadius: 999,
															mb: 0.5,
														}}
													>
														{ex}
													</Button>
												))}
											</Stack>
										</Box>
									)}

									<Box>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Tentukan link untuk galang dana ini{" "}
											<span style={{ color: "red" }}>*</span>
										</Typography>
										<Input
											value={slugOther}
											onChange={(e) => {
												setSlugOtherTouched(true);
												setSlugOtherError("");
												setSlugOtherAvailable(false);
												setSlugOther(makeSlug(e.target.value));
											}}
											error={slugOtherError || undefined}
											helperText={
												slugOtherError
													? undefined
													: slugOtherChecking
														? "Memeriksa ketersediaan..."
														: slugOther && slugOtherAvailable
															? undefined
															: "Contoh: banturenovasimasjid"
											}
											maxLength={60}
											placeholder="Contoh: banturenovasimasjid"
										/>
										{!slugOtherError &&
											!slugOtherChecking &&
											slugOther &&
											slugOtherAvailable && (
												<Typography
													sx={{
														mt: 0.5,
														fontSize: 12,
														color: "success.main",
													}}
												>
													Link ini dapat digunakan
												</Typography>
											)}
									</Box>

									<FileUploadField
										label="Upload Cover/Thumbnail Galang Dana *"
										note="Disarankan ukuran 664 x 357 piksel."
										accept="image/*"
										cropAspect={664 / 357}
										aspectRatio="664/357"
										value={coverPreviewOther}
										onUploaded={(url) => {
											setCoverPreviewOther(url);
											setCoverFileOther(null);
										}}
										onClear={() => {
											setCoverPreviewOther("");
											setCoverFileOther(null);
											setCoverNameOther("");
										}}
									/>
								</Stack>
							</Box>
						)}

						{/* STEP: cerita */}
						{stepKey === "cerita" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Tuliskan cerita tentang galang dana ini
								</Typography>

								{/* Loading */}
								<StoryCreationSection
									mode="wizard"
									category="lainnya"
									purposeKey={purposeKey}
									story={storyOther}
									storyStructure={storyStructureOther}
									onSave={(html, structure) => {
										setStoryOther(html);
										setStoryStructureOther(structure);
									}}
									loaded={storyOtherLoaded}
									defaultShowEditor={showStoryEditorOther}
								/>
							</Box>
						)}

						{/* STEP: ajakan */}
						{stepKey === "ajakan" && (
							<>
								<AjakanCreationSection
									value={ctaOther}
									onChange={setCtaOther}
									placeholder="Contoh: Kami butuh bantuan agar fasilitas bisa dipakai warga kembali..."
									error={ctaOtherLeft < 0}
									campaignTitle={titleOther}
									coverUrl={coverPreviewOther}
								/>

								<div className="mt-4">
									<p className="mb-1.5 text-xs font-semibold text-foreground/60">
										Syarat penggalangan dana
									</p>
									<div className="rounded-xl border border-foreground/10 p-2.5">
										<label className="flex cursor-pointer items-start gap-2">
											<input
												type="checkbox"
												checked={agreeA}
												onChange={(e) => setAgreeA(e.target.checked)}
												className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
											/>
											<span className="text-xs leading-relaxed text-foreground/70">
												Pemilik rekening bertanggung jawab atas penggunaan dana yang diterima dari galang dana ini.
											</span>
										</label>
										<hr className="my-2 border-foreground/8" />
										<label className="flex cursor-pointer items-start gap-2">
											<input
												type="checkbox"
												checked={agreeB}
												onChange={(e) => setAgreeB(e.target.checked)}
												className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
											/>
											<span className="text-xs leading-relaxed text-foreground/70">
												Kamu sebagai penggalang dana bertanggung jawab atas permintaan pencairan dan pelaporan penggunaan dana.
											</span>
										</label>
									</div>
								</div>
							</>
						)}
					</>
				)}
			</Box>

			{/* Bottom actions */}
			<div className="fixed inset-x-0 bottom-0 z-[99] mx-auto max-w-[480px] border-t border-divider bg-white pb-[env(safe-area-inset-bottom)] lg:max-w-[960px]">
				<div className="mx-auto max-w-[480px] px-4 py-3 lg:max-w-[960px] lg:px-6">
					<div className="flex items-center gap-3">
						<button
							onClick={goPrev}
							disabled={step === 0}
							className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/70 transition-colors hover:bg-foreground/5 disabled:opacity-30"
						>
							<ChevronLeftRoundedIcon fontSize="small" />
							Sebelumnya
						</button>

						<div className="flex-1" />

						<button
							onClick={onClickNext}
							disabled={!canNext || submitting}
							className="flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-40"
						>
							{submitting
								? "Menyimpan..."
								: stepKey === "ajakan"
									? isEdit
										? "Simpan Perubahan"
										: "Selesai"
									: "Selanjutnya"}
							{!submitting && <ChevronRightRoundedIcon fontSize="small" />}
						</button>
					</div>

					{!isContentEdit && (
						<button
							onClick={handleSaveDraft}
							disabled={submitting}
							className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-foreground/50 transition-colors hover:bg-foreground/5 disabled:opacity-30"
						>
							Simpan dan lanjutkan nanti
						</button>
					)}
				</div>
			</div>

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
				<Box sx={{ p: 3 }}>
					<Typography sx={{ fontWeight: 600, fontSize: 15, mb: 2 }}>
						Baca dan beri tanda syarat penggalangan di bawah ini
					</Typography>

					<Stack spacing={1}>
						<FormControlLabel
							sx={{ "& .MuiFormControlLabel-label": { fontSize: 13 } }}
							control={
								<Checkbox
									checked={t1}
									onChange={(e) => setT1(e.target.checked)}
								/>
							}
							label="Pemilik rekening bertanggung jawab atas penggunaan dana yang diterima dari galang dana ini."
						/>
						<FormControlLabel
							sx={{ "& .MuiFormControlLabel-label": { fontSize: 13 } }}
							control={
								<Checkbox
									checked={t2}
									onChange={(e) => setT2(e.target.checked)}
								/>
							}
							label="Kamu sebagai penggalang dana bertanggung jawab atas permintaan pencairan dan pelaporan penggunaan dana."
						/>
						<FormControlLabel
							sx={{ "& .MuiFormControlLabel-label": { fontSize: 13 } }}
							control={
								<Checkbox
									checked={t3}
									onChange={(e) => setT3(e.target.checked)}
								/>
							}
							label="Pasien dan/atau keluarga benar-benar membutuhkan biaya dari galang dana ini."
						/>
						<FormControlLabel
							sx={{ "& .MuiFormControlLabel-label": { fontSize: 13 } }}
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
