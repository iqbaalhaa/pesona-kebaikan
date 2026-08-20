"use client";

import * as React from "react";
import {
	Camera,
	Plus,
	X,
	Loader2,
	CheckCircle,
	AlertCircle,
	Eye,
	FileText,
	ExternalLink,
} from "lucide-react";
import { uploadFile } from "@/actions/upload";

type UploadAction = (
	fd: FormData,
) => Promise<{ success: boolean; url?: string; error?: string }>;

const MAX_FILE_MB = 3;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const MAX_FILES = 10;

function looksLikeImageUrl(url: string) {
	return /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(url);
}

function filenameFromUrl(url: string) {
	try {
		return decodeURIComponent(url.split("/").pop() || url);
	} catch {
		return url;
	}
}

interface MultiFileUploadFieldProps {
	label: React.ReactNode;
	accept?: string;
	values: string[];
	onChange: (urls: string[]) => void;
	note?: string;
	/** Override the server action used to upload. Defaults to uploadFile. */
	uploadAction?: UploadAction;
}

/**
 * Multi-file counterpart to FileUploadField — same visual language (thumbnail
 * row, PDF icon, lightbox), but manages an array of uploaded URLs instead of
 * one. Built as a separate component rather than extending FileUploadField
 * itself, since that component is used single-file in ~20 other places and
 * reworking its internals (crop dialog, rotate, single previewUrl state) for
 * multi-file would risk regressing all of them.
 */
export default function MultiFileUploadField({
	label,
	accept = "image/*,.pdf",
	values,
	onChange,
	note,
	uploadAction = uploadFile,
}: MultiFileUploadFieldProps) {
	const [uploading, setUploading] = React.useState(false);
	const [error, setError] = React.useState("");
	const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);

	const handleFiles = async (fileList: FileList) => {
		setError("");
		const files = Array.from(fileList);

		if (values.length + files.length > MAX_FILES) {
			setError(`Maksimal ${MAX_FILES} file.`);
			return;
		}

		const tooBig = files.find((f) => f.size > MAX_FILE_BYTES);
		if (tooBig) {
			setError(
				`Ukuran file maksimal ${MAX_FILE_MB}MB (file: ${tooBig.name}, ${(tooBig.size / 1024 / 1024).toFixed(1)}MB)`,
			);
			return;
		}

		setUploading(true);
		try {
			const uploaded: string[] = [];
			for (const file of files) {
				const fd = new FormData();
				fd.append("file", file);
				const res = await uploadAction(fd);
				if (res.success && res.url) {
					uploaded.push(res.url);
				} else {
					setError(res.error || `Gagal mengupload ${file.name}`);
				}
			}
			if (uploaded.length > 0) onChange([...values, ...uploaded]);
		} catch {
			setError("Gagal mengupload file");
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	const handleRemove = (url: string) => {
		onChange(values.filter((v) => v !== url));
	};

	return (
		<div>
			<p className="mb-1 text-sm font-semibold text-foreground">{label}</p>

			{note && <p className="mb-2 text-xs text-foreground/60">{note}</p>}

			{values.length > 0 && (
				<div className="mb-2 flex flex-col gap-2">
					{values.map((url) => {
						const isImage = looksLikeImageUrl(url);
						return (
							<div
								key={url}
								className="relative flex items-center gap-3 rounded-xl border border-foreground/10 bg-white p-2 pr-3"
							>
								<button
									type="button"
									onClick={() => setLightboxUrl(url)}
									className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-foreground/5"
									title="Lihat lebih besar"
								>
									{isImage ? (
										<img src={url} alt="Preview" className="h-full w-full object-cover" />
									) : (
										<div className="grid h-full w-full place-items-center text-foreground/40">
											<FileText size={20} />
										</div>
									)}
									<span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
										<Eye size={16} />
									</span>
								</button>
								<div className="min-w-0 flex-1">
									<p className="truncate text-xs font-medium text-foreground/80">
										{filenameFromUrl(url)}
									</p>
									<div className="flex items-center gap-1 text-[11px] font-medium text-green-700">
										<CheckCircle size={12} className="shrink-0" />
										Berhasil diupload
									</div>
								</div>
								<button
									type="button"
									onClick={() => handleRemove(url)}
									title="Hapus file"
									className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-foreground/40 hover:bg-foreground/5 hover:text-foreground/70"
								>
									<X size={16} />
								</button>
							</div>
						);
					})}
				</div>
			)}

			{uploading ? (
				<div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
					<Loader2 size={18} className="animate-spin text-primary" />
					<span className="text-sm font-medium text-primary">Mengupload...</span>
				</div>
			) : (
				<label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-foreground/20 bg-white p-3 transition-colors hover:border-primary hover:bg-primary/5">
					{values.length > 0 ? (
						<Plus size={18} className="text-foreground/40" />
					) : (
						<Camera size={20} className="text-foreground/40" />
					)}
					<span className="text-sm text-foreground/60">
						{values.length > 0
							? "Tambah file lagi"
							: `Pilih file (maks ${MAX_FILE_MB}MB, bisa lebih dari 1)`}
					</span>
					<input
						ref={inputRef}
						type="file"
						accept={accept}
						multiple
						className="hidden"
						onChange={(e) => {
							if (e.target.files && e.target.files.length > 0) {
								handleFiles(e.target.files);
							}
						}}
					/>
				</label>
			)}

			{error && (
				<div className="mt-1 flex items-center gap-1 text-xs text-red-500">
					<AlertCircle size={14} />
					{error}
				</div>
			)}

			{lightboxUrl && (
				<div
					className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/80 p-4"
					onClick={() => setLightboxUrl(null)}
				>
					<button
						type="button"
						onClick={() => setLightboxUrl(null)}
						className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
					>
						<X size={20} />
					</button>
					{looksLikeImageUrl(lightboxUrl) ? (
						<img
							src={lightboxUrl}
							alt="Preview besar"
							className="max-h-full max-w-full rounded-lg object-contain"
							onClick={(e) => e.stopPropagation()}
						/>
					) : (
						<div
							className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center"
							onClick={(e) => e.stopPropagation()}
						>
							<FileText size={40} className="text-foreground/40" />
							<p className="text-sm text-foreground/70">
								Berkas PDF tidak dapat ditampilkan langsung di sini.
							</p>
							<a
								href={lightboxUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
							>
								<ExternalLink size={16} />
								Buka di tab baru
							</a>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
