"use client";

import * as React from "react";
import { Camera, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { uploadFile } from "@/actions/upload";

const MAX_FILE_MB = 3;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

interface FileUploadFieldProps {
	label: string;
	accept?: string;
	value?: string;
	onUploaded: (url: string) => void;
	onClear?: () => void;
	preview?: boolean;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function FileUploadField({
	label,
	accept = "image/*",
	value,
	onUploaded,
	onClear,
	preview = true,
}: FileUploadFieldProps) {
	const [state, setState] = React.useState<UploadState>(value ? "success" : "idle");
	const [error, setError] = React.useState("");
	const [previewUrl, setPreviewUrl] = React.useState(value || "");
	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (value) {
			setPreviewUrl(value);
			setState("success");
		}
	}, [value]);

	const handleFile = async (file: File) => {
		setError("");

		if (file.size > MAX_FILE_BYTES) {
			setError(`Ukuran file maksimal ${MAX_FILE_MB}MB (file: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
			setState("error");
			return;
		}

		if (preview && file.type.startsWith("image/")) {
			setPreviewUrl(URL.createObjectURL(file));
		}

		setState("uploading");

		try {
			const fd = new FormData();
			fd.append("file", file);
			const res = await uploadFile(fd);

			if (res.success && res.url) {
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

	const handleClear = () => {
		setState("idle");
		setPreviewUrl("");
		setError("");
		onClear?.();
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div>
			<p className="mb-1 text-sm font-semibold text-foreground">{label}</p>

			{/* Preview */}
			{previewUrl && preview && (
				<div className="relative mb-2 overflow-hidden rounded-xl">
					<img
						src={previewUrl}
						alt="Preview"
						className="h-[140px] w-full object-cover"
					/>
					<button
						onClick={handleClear}
						className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
					>
						<X size={14} />
					</button>
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
		</div>
	);
}
