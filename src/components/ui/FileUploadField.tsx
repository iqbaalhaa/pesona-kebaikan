"use client";

import * as React from "react";
import { Camera, X, Loader2, CheckCircle, AlertCircle, RotateCcw, RotateCw, Crop as CropIcon } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import { uploadFile } from "@/actions/upload";

type UploadAction = (fd: FormData) => Promise<{ success: boolean; url?: string; error?: string }>;
import { rotateImageFile } from "@/lib/rotateImage";
import getCroppedImg from "@/lib/cropImage";

const MAX_FILE_MB = 3;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

interface FileUploadFieldProps {
	label: string;
	accept?: string;
	value?: string;
	onUploaded: (url: string) => void;
	onClear?: () => void;
	preview?: boolean;
	note?: string;
	/** Preview aspect ratio, e.g. "664/357". When set, preview matches the
	 *  final stored crop instead of a fixed 140px box. */
	aspectRatio?: string;
	/** When set (e.g. 664/357), opens a crop dialog before upload so the user
	 *  controls which part of an off-ratio image is kept. */
	cropAspect?: number;
	/** Override the server action used to upload. Defaults to uploadFile. */
	uploadAction?: UploadAction;
}

async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
	const blob = await (await fetch(dataUrl)).blob();
	return new File([blob], name, { type: blob.type || "image/jpeg" });
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function FileUploadField({
	label,
	accept = "image/*",
	value,
	onUploaded,
	onClear,
	preview = true,
	note,
	aspectRatio,
	cropAspect,
	uploadAction = uploadFile,
}: FileUploadFieldProps) {
	const [state, setState] = React.useState<UploadState>(value ? "success" : "idle");
	const [error, setError] = React.useState("");
	const [previewUrl, setPreviewUrl] = React.useState(value || "");
	const [rotating, setRotating] = React.useState(false);
	const inputRef = React.useRef<HTMLInputElement>(null);
	// Last image File actually uploaded — kept so manual rotate can re-process it.
	const lastFileRef = React.useRef<File | null>(null);

	// Crop dialog state
	const [cropSrc, setCropSrc] = React.useState<string | null>(null);
	const [cropName, setCropName] = React.useState("cover.jpg");
	const [crop, setCrop] = React.useState({ x: 0, y: 0 });
	const [zoom, setZoom] = React.useState(1);
	const [rotation, setRotation] = React.useState(0);
	const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
	const [cropping, setCropping] = React.useState(false);

	const onCropComplete = React.useCallback((_: Area, areaPixels: Area) => {
		setCroppedAreaPixels(areaPixels);
	}, []);

	const closeCrop = () => {
		if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
		setCropSrc(null);
		setCrop({ x: 0, y: 0 });
		setZoom(1);
		setRotation(0);
		setCroppedAreaPixels(null);
		if (inputRef.current) inputRef.current.value = "";
	};

	const confirmCrop = async () => {
		if (!cropSrc || !croppedAreaPixels) return;
		setCropping(true);
		try {
			const dataUrl = await getCroppedImg(cropSrc, croppedAreaPixels, rotation);
			if (!dataUrl) {
				setError("Gagal memproses crop");
				return;
			}
			const file = await dataUrlToFile(dataUrl, cropName);
			closeCrop();
			if (preview) setPreviewUrl(URL.createObjectURL(file));
			await uploadFileToServer(file);
		} finally {
			setCropping(false);
		}
	};

	React.useEffect(() => {
		if (value) {
			setPreviewUrl(value);
			setState("success");
		}
	}, [value]);

	const uploadFileToServer = async (file: File) => {
		setState("uploading");
		try {
			const fd = new FormData();
			fd.append("file", file);
			const res = await uploadAction(fd);

			if (res.success && res.url) {
				lastFileRef.current = file.type.startsWith("image/") ? file : null;
				setState("success");
				setPreviewUrl(res.url);
				onUploaded(res.url);
			} else {
				setState("error");
				setError(res.error || "Gagal mengupload file");
				setPreviewUrl("");
			}
		} catch {
			setState("error");
			setError("Gagal mengupload file");
			setPreviewUrl("");
		}
	};

	const handleFile = async (file: File) => {
		setError("");

		if (file.size > MAX_FILE_BYTES) {
			setError(`Ukuran file maksimal ${MAX_FILE_MB}MB (file: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
			setState("error");
			return;
		}

		// Off-ratio control: let the user pick the crop before uploading.
		if (cropAspect && file.type.startsWith("image/")) {
			setCropName(file.name.replace(/\.[^.]+$/, "") + ".jpg");
			setCrop({ x: 0, y: 0 });
			setZoom(1);
			setRotation(0);
			setCropSrc(URL.createObjectURL(file));
			return;
		}

		if (preview && file.type.startsWith("image/")) {
			setPreviewUrl(URL.createObjectURL(file));
		}

		await uploadFileToServer(file);
	};

	const handleRotate = async (deg: number) => {
		const current = lastFileRef.current;
		if (!current || rotating) return;
		setRotating(true);
		setError("");
		try {
			const rotated = await rotateImageFile(current, deg);
			await uploadFileToServer(rotated);
		} finally {
			setRotating(false);
		}
	};

	const handleClear = () => {
		setState("idle");
		setPreviewUrl("");
		setError("");
		lastFileRef.current = null;
		onClear?.();
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div>
			<p className="mb-1 text-sm font-semibold text-foreground">{label}</p>

			{note && (
				<p className="mb-2 text-xs text-foreground/60">{note}</p>
			)}

			{/* Preview */}
			{previewUrl && preview && (
				<div className="relative mb-2 overflow-hidden rounded-xl">
					<img
						src={previewUrl}
						alt="Preview"
						className={aspectRatio ? "w-full object-cover" : "h-[140px] w-full object-cover"}
						style={aspectRatio ? { aspectRatio } : undefined}
					/>
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
					>
						<X size={14} />
					</button>

					{/* Manual rotate controls (only for freshly uploaded image) */}
					{lastFileRef.current && (
						<div className="absolute bottom-2 right-2 flex gap-1">
							<button
								type="button"
								disabled={rotating}
								onClick={() => handleRotate(-90)}
								title="Putar kiri"
								className="grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:opacity-50"
							>
								{rotating ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
							</button>
							<button
								type="button"
								disabled={rotating}
								onClick={() => handleRotate(90)}
								title="Putar kanan"
								className="grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:opacity-50"
							>
								{rotating ? <Loader2 size={14} className="animate-spin" /> : <RotateCw size={14} />}
							</button>
						</div>
					)}
				</div>
			)}

			{/* Upload button */}
			{state !== "uploading" && !previewUrl && (
				<label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-foreground/20 bg-white p-3 transition-colors hover:border-primary hover:bg-primary/5">
					<Camera size={20} className="text-foreground/40" />
					<span className="text-sm text-foreground/60">Pilih file (maks {MAX_FILE_MB}MB)</span>
					<input
						ref={inputRef}
						type="file"
						accept={accept}
						className="hidden"
						onChange={(e) => {
							const f = e.target.files?.[0];
							if (f) handleFile(f);
						}}
					/>
				</label>
			)}

			{/* Uploading state */}
			{state === "uploading" && (
				<div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
					<Loader2 size={18} className="animate-spin text-primary" />
					<span className="text-sm font-medium text-primary">Mengupload...</span>
				</div>
			)}

			{/* Success indicator (non-image or no preview) */}
			{state === "success" && !previewUrl && (
				<div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
					<CheckCircle size={18} className="text-green-600" />
					<span className="text-sm font-medium text-green-700">File berhasil diupload</span>
					<button onClick={handleClear} className="ml-auto text-foreground/40 hover:text-foreground/70">
						<X size={16} />
					</button>
				</div>
			)}

			{/* Error */}
			{error && (
				<div className="mt-1 flex items-center gap-1 text-xs text-red-500">
					<AlertCircle size={14} />
					{error}
				</div>
			)}

			{/* Change button when has preview */}
			{previewUrl && state === "success" && (
				<label className="mt-1 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline">
					<Camera size={14} />
					Ganti file
					<input
						type="file"
						accept={accept}
						className="hidden"
						onChange={(e) => {
							const f = e.target.files?.[0];
							if (f) handleFile(f);
						}}
					/>
				</label>
			)}

			{/* Crop dialog */}
			{cropSrc && cropAspect && (
				<div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/70 p-4">
					<div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
						<div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
							<h3 className="text-sm font-semibold text-foreground">Atur Posisi Crop</h3>
							<button
								type="button"
								onClick={closeCrop}
								className="grid h-7 w-7 place-items-center rounded-full text-foreground/50 hover:bg-gray-100"
							>
								<X size={16} />
							</button>
						</div>

						<div className="relative h-72 w-full bg-gray-900">
							<Cropper
								image={cropSrc}
								crop={crop}
								zoom={zoom}
								rotation={rotation}
								aspect={cropAspect}
								onCropChange={setCrop}
								onZoomChange={setZoom}
								onRotationChange={setRotation}
								onCropComplete={onCropComplete}
							/>
						</div>

						<div className="flex items-center gap-3 px-4 py-3">
							<span className="text-xs text-foreground/60">Zoom</span>
							<input
								type="range"
								min={1}
								max={3}
								step={0.01}
								value={zoom}
								onChange={(e) => setZoom(Number(e.target.value))}
								className="flex-1 accent-primary"
							/>
							<button
								type="button"
								onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
								title="Putar kiri"
								className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 text-foreground/70 hover:bg-gray-100"
							>
								<RotateCcw size={16} />
							</button>
							<button
								type="button"
								onClick={() => setRotation((r) => (r + 90) % 360)}
								title="Putar kanan"
								className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 text-foreground/70 hover:bg-gray-100"
							>
								<RotateCw size={16} />
							</button>
						</div>

						<div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
							<button
								type="button"
								onClick={closeCrop}
								disabled={cropping}
								className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-gray-100 disabled:opacity-50"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={confirmCrop}
								disabled={cropping || !croppedAreaPixels}
								className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
							>
								{cropping ? <Loader2 size={16} className="animate-spin" /> : <CropIcon size={16} />}
								{cropping ? "Memproses..." : "Terapkan"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
