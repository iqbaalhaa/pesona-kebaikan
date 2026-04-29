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
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import StepProgress from "@/components/ui/StepProgress";

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
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "")
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
					setSocHandle(m.socHandle || "");
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
					(!!medicalResumeFile || !!medicalResumeUrl) &&
					(!!medicalExamFile || !!medicalExamUrl)
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
		if (stepKey === "ajakan") return ctaOther.trim().length >= 10;
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
		medicalResumeFile,
		medicalResumeUrl,
		medicalExamFile,
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

					if (medicalResumeFile) {
						formData.append("resume_medis", medicalResumeFile);
					}
					if (medicalExamFile) {
						formData.append("surat_rs", medicalExamFile);
					}

					if (coverFile) formData.append("cover", coverFile);

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

					if (coverFileOther) formData.append("cover", coverFileOther);

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

				if (medicalResumeFile) {
					formData.append("resume_medis", medicalResumeFile);
				}
				if (medicalExamFile) {
					formData.append("surat_rs", medicalExamFile);
				}

				if (coverFile) formData.append("cover", coverFile);

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

				if (coverFileOther) formData.append("cover", coverFileOther);

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
												<TextField
													size="small"
													fullWidth
													placeholder="Sebutkan hubungan dengan pasien"
													value={whoOther}
													onChange={(e) => setWhoOther(e.target.value)}
													sx={{ "& .MuiInputBase-input": { fontSize: 13.5 } }}
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
										<TextField
											size="small"
											sx={{
												"& .MuiInputBase-input": { fontSize: 13.5 },
												"& .MuiInputLabel-root": { fontSize: 13.5 },
											}}
											value={hospital}
											onChange={(e) => setHospital(e.target.value)}
											fullWidth
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

									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
										value={phone}
										onChange={(e) =>
											setPhone(onlyDigits(e.target.value).slice(0, 15))
										}
										fullWidth
										placeholder="Pastikan nomor aktif memiliki WA"
										inputMode="numeric"
										error={phone.length > 0 && phone.length < 10}
										helperText={
											phone.length > 0 && phone.length < 10 ? (
												<Typography
													component="span"
													sx={{ fontSize: 11, color: "error.main" }}
												>
													Nomor ponsel belum lengkap (minimal 10 digit)
												</Typography>
											) : null
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
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
										label={
											<>
												Nama pasien <span style={{ color: "red" }}>*</span>
											</>
										}
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
										label={
											<>
												Usia pasien <span style={{ color: "red" }}>*</span>
											</>
										}
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
										label={
											<>
												Domisili pasien (kota/kab){" "}
												<span style={{ color: "red" }}>*</span>
											</>
										}
										value={patientCity}
										onChange={(e) => setPatientCity(e.target.value)}
										fullWidth
									/>

									<Paper variant="outlined" sx={{ borderRadius: 2, p: 1 }}>
										<Typography sx={{ fontWeight: 600, mb: 0.5 }}>
											Jenis kelamin <span style={{ color: "red" }}>*</span>
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
									Apakah pasien sedang menjalani rawat inap di rumah sakit?{" "}
									<span style={{ color: "red" }}>*</span>
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

								{inpatient === "ya" && (
									<Box sx={{ mt: 2 }}>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Nama Rumah Sakit <span style={{ color: "red" }}>*</span>
										</Typography>
										<TextField
											size="small"
											sx={{
												"& .MuiInputBase-input": { fontSize: 13.5 },
												"& .MuiInputLabel-root": { fontSize: 13.5 },
											}}
											value={hospital}
											onChange={(e) => setHospital(e.target.value)}
											fullWidth
											placeholder="Masukkan nama rumah sakit"
										/>
									</Box>
								)}

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Upaya pengobatan yang sudah atau sedang dilakukan{" "}
										<span style={{ color: "red" }}>*</span>
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
										error={treatment.length > 0 && treatment.length < 55}
										helperText={
											treatment.length > 0 && treatment.length < 55
												? `Minimal 55 karakter (${treatment.length}/55)`
												: ""
										}
									/>
								</Box>

								<Box sx={{ mt: 2 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
										Dari mana sumber biaya pengobatan/perawatan sebelumnya?{" "}
										<span style={{ color: "red" }}>*</span>
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

									<Stack spacing={1.25}>
										<Paper
											variant="outlined"
											sx={{ borderRadius: 2, p: 1, display: "flex", gap: 1 }}
										>
											<input
												id="resume-medis-upload"
												type="file"
												accept="image/*,.pdf"
												hidden
												onChange={(e) => {
													const f = e.target.files?.[0] || null;
													setMedicalResumeFile(f);
													if (f) {
														setMedicalResumeUrl("");
													}
												}}
											/>
											<Button
												component="label"
												htmlFor="resume-medis-upload"
												variant="outlined"
												sx={{ borderRadius: 999, fontWeight: 700, minWidth: 0 }}
											>
												Pilih file
											</Button>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Typography sx={{ fontSize: 13, fontWeight: 600 }}>
													Surat keterangan medis / diagnosis
												</Typography>
												<Typography
													sx={{ fontSize: 12.5, color: "text.secondary" }}
													noWrap
												>
													{medicalResumeFile?.name ||
														(medicalResumeUrl
															? "Dokumen sudah tersimpan"
															: "") ||
														"Belum ada file"}
												</Typography>
											</Box>
										</Paper>

										<Paper
											variant="outlined"
											sx={{ borderRadius: 2, p: 1, display: "flex", gap: 1 }}
										>
											<input
												id="hasil-pemeriksaan-upload"
												type="file"
												accept="image/*,.pdf"
												hidden
												onChange={(e) => {
													const f = e.target.files?.[0] || null;
													setMedicalExamFile(f);
													if (f) {
														setMedicalExamUrl("");
													}
												}}
											/>
											<Button
												component="label"
												htmlFor="hasil-pemeriksaan-upload"
												variant="outlined"
												sx={{ borderRadius: 999, fontWeight: 700, minWidth: 0 }}
											>
												Pilih file
											</Button>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Typography sx={{ fontSize: 13, fontWeight: 600 }}>
													Hasil pemeriksaan (lab, rontgen, dsb.)
												</Typography>
												<Typography
													sx={{ fontSize: 12.5, color: "text.secondary" }}
													noWrap
												>
													{medicalExamFile?.name ||
														(medicalExamUrl ? "Dokumen sudah tersimpan" : "") ||
														"Belum ada file"}
												</Typography>
											</Box>
										</Paper>
									</Stack>
								</Box>
							</Box>
						)}

						{stepKey === "target" && (
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}>
									Tentukan perkiraan biaya yang dibutuhkan{" "}
									<span style={{ color: "red" }}>*</span>
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
										Tentukan lama galang dana berlangsung{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>

									<RadioGroup
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
										error={usage.length > 0 && usage.trim().length < 55}
										helperText={
											usage.length > 0 && usage.trim().length < 55
												? `Minimal 55 karakter (${usage.trim().length}/55)`
												: ""
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
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
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
										fullWidth
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
										<TextField
											size="small"
											sx={{
												"& .MuiInputBase-input": { fontSize: 13.5 },
												"& .MuiInputLabel-root": { fontSize: 13.5 },
											}}
											value={slug}
											onChange={(e) => {
												setSlugTouched(true);
												setSlugError("");
												setSlugAvailable(false);
												setSlug(makeSlug(e.target.value));
											}}
											onBlur={async () => {
												if (!slug) {
													setSlugError("");
													setSlugAvailable(false);
													return;
												}
												setSlugChecking(true);
												setSlugError("");
												try {
													const params = new URLSearchParams();
													params.set("slug", slug);
													if (isEdit && draftId) {
														params.set("excludeId", draftId);
													}
													const res = await fetch(
														`/api/campaigns/check-slug?${params.toString()}`,
													);
													if (!res.ok) {
														return;
													}
													const data = (await res.json()) as {
														available: boolean;
													};
													if (!data.available) {
														setSlugError(
															"URL publik sudah digunakan campaign lain",
														);
														setSlugAvailable(false);
													} else {
														setSlugAvailable(true);
													}
												} catch (e) {
												} finally {
													setSlugChecking(false);
												}
											}}
											error={!!slugError}
											helperText={
												slugError ||
												(slugChecking
													? "Memeriksa ketersediaan URL..."
													: "contoh: bantudolawan...")
											}
											fullWidth
											inputProps={{ maxLength: 60 }}
											placeholder="contoh: bantudolawan..."
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

									<Box>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Upload foto galang dana{" "}
											<span style={{ color: "red" }}>*</span>
											<span
												style={{
													color: "rgba(15,23,42,.55)",
													fontSize: 12,
													fontWeight: 400,
													marginLeft: 4,
												}}
											>
												(Max 3MB)
											</span>
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
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
									Untuk apa galang dana ini?{" "}
									<span style={{ color: "red" }}>*</span>
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
											Nama kamu sesuai KTP{" "}
											<span style={{ color: "red" }}>*</span>
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
											Masukkan no. ponsel kamu{" "}
											<span style={{ color: "red" }}>*</span>
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
												setPhoneOther(onlyDigits(e.target.value).slice(0, 15))
											}
											fullWidth
											inputMode="numeric"
											error={phoneOther.length > 0 && phoneOther.length < 10}
											helperText={
												phoneOther.length > 0 && phoneOther.length < 10 ? (
													<Typography
														component="span"
														sx={{ fontSize: 11, color: "error.main" }}
													>
														Nomor ponsel belum lengkap (minimal 10 digit)
													</Typography>
												) : null
											}
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Pekerjaan kamu saat ini{" "}
											<span style={{ color: "red" }}>*</span>
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
											Nama sekolah/tempat kerja{" "}
											<span style={{ color: "red" }}>*</span>
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
											Akun media sosial kamu{" "}
											<span style={{ color: "red" }}>*</span>
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
											Nama penerima/infrastruktur{" "}
											<span style={{ color: "red" }}>*</span>
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
											error={
												receiverName.length > 0 &&
												receiverName.trim().length < 3
											}
											helperText={
												receiverName.length > 0 &&
												receiverName.trim().length < 3 ? (
													<Typography
														component="span"
														sx={{ fontSize: 11, color: "error.main" }}
													>
														Minimal 3 karakter
													</Typography>
												) : null
											}
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Tujuan galang dana <span style={{ color: "red" }}>*</span>
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
											error={goal.length > 0 && goal.trim().length < 10}
											helperText={
												goal.length > 0 && goal.trim().length < 10 ? (
													<Typography
														component="span"
														sx={{ fontSize: 11, color: "error.main" }}
													>
														Minimal 10 karakter
													</Typography>
												) : null
											}
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Lokasi <span style={{ color: "red" }}>*</span>
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
											error={location.length > 0 && location.trim().length < 8}
											helperText={
												location.length > 0 && location.trim().length < 8 ? (
													<Typography
														component="span"
														sx={{ fontSize: 11, color: "error.main" }}
													>
														Minimal 8 karakter
													</Typography>
												) : null
											}
										/>
									</Box>

									<Box>
										<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.6 }}>
											Jumlah penerima manfaat{" "}
											<span style={{ color: "rgba(15,23,42,.55)" }}>(opsional)</span>
										</Typography>
										<TextField
											size="small"
											sx={{ "& .MuiInputBase-input": { fontSize: 13.5 } }}
											value={beneficiaries}
											onChange={(e) => setBeneficiaries(onlyDigits(e.target.value))}
											fullWidth
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
										Tentukan lama galang dana berlangsung{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>

									<RadioGroup
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
										error={
											usageOther.length > 0 && usageOther.trim().length < 55
										}
										helperText={
											usageOther.length > 0 && usageOther.trim().length < 55
												? `Minimal 55 karakter (${usageOther.trim().length}/55)`
												: ""
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
									<TextField
										size="small"
										sx={{
											"& .MuiInputBase-input": { fontSize: 13.5 },
											"& .MuiInputLabel-root": { fontSize: 13.5 },
										}}
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
										fullWidth
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
										<TextField
											size="small"
											sx={{
												"& .MuiInputBase-input": { fontSize: 13.5 },
												"& .MuiInputLabel-root": { fontSize: 13.5 },
											}}
											value={slugOther}
											onChange={(e) => {
												setSlugOtherTouched(true);
												setSlugOtherError("");
												setSlugOtherAvailable(false);
												setSlugOther(makeSlug(e.target.value));
											}}
											onBlur={async () => {
												if (!slugOther) {
													setSlugOtherError("");
													setSlugOtherAvailable(false);
													return;
												}
												setSlugOtherChecking(true);
												setSlugOtherError("");
												try {
													const params = new URLSearchParams();
													params.set("slug", slugOther);
													const res = await fetch(
														`/api/campaigns/check-slug?${params.toString()}`,
													);
													if (!res.ok) {
														return;
													}
													const data = (await res.json()) as {
														available: boolean;
													};
													if (!data.available) {
														setSlugOtherError(
															"URL publik sudah digunakan campaign lain",
														);
														setSlugOtherAvailable(false);
													} else {
														setSlugOtherAvailable(true);
													}
												} catch (e) {
												} finally {
													setSlugOtherChecking(false);
												}
											}}
											error={!!slugOtherError}
											helperText={
												slugOtherError ||
												(slugOtherChecking
													? "Memeriksa ketersediaan URL..."
													: "contoh: bantu-renovasi...")
											}
											fullWidth
											inputProps={{ maxLength: 60 }}
											placeholder="contoh: bantu-renovasi..."
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

									<Box>
										<Typography
											sx={{ fontWeight: 600, fontSize: 14, mb: 0.75 }}
										>
											Upload foto galang dana{" "}
											<span style={{ color: "red" }}>*</span>
											<span
												style={{
													color: "rgba(15,23,42,.55)",
													fontSize: 12,
													fontWeight: 400,
													marginLeft: 4,
												}}
											>
												(Max 3MB)
											</span>
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

								{/* Loading */}
								<StoryCreationSection
									mode="wizard"
									category="lainnya"
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
								/>

								<Box sx={{ mt: 3 }}>
									<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
										Syarat penggalangan dana
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
							</>
						)}
					</>
				)}
			</Box>

			{/* Bottom actions */}
			<div className="fixed inset-x-0 bottom-0 z-[99] mx-auto max-w-[480px] border-t border-divider bg-white pb-[env(safe-area-inset-bottom)]">
				<div className="mx-auto max-w-[480px] px-4 py-[5px]">
					<div className="flex items-center gap-1">
						<button
							onClick={goPrev}
							disabled={step === 0}
							className="flex items-center gap-0.5 rounded-lg px-2 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-foreground/5 disabled:opacity-30"
						>
							<ChevronLeftRoundedIcon fontSize="small" />
							Sebelumnya
						</button>

						<div className="flex-1" />

						<button
							onClick={onClickNext}
							disabled={!canNext || submitting}
							className="flex items-center gap-0.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-40"
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
							className="mt-0.5 w-full rounded-lg py-2 text-sm font-semibold text-foreground/50 transition-colors hover:bg-foreground/5 disabled:opacity-30"
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
