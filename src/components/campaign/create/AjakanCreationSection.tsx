"use client";

import React from "react";

interface AjakanCreationSectionProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	error?: boolean;
	campaignTitle?: string;
	coverUrl?: string;
}

export default function AjakanCreationSection({
	value,
	onChange,
	placeholder,
	error,
	campaignTitle,
	coverUrl,
}: AjakanCreationSectionProps) {
	const maxLength = 160;
	const remaining = maxLength - value.length;
	const displayTitle = campaignTitle || "Judul galang dana kamu";
	const displayCover = coverUrl || "/defaultimg.webp";
	const displayCta = value || "Ajakan singkat kamu akan muncul di sini...";

	return (
		<div>
			<p className="mb-0.5 text-sm font-semibold text-foreground">
				Tulis ajakan singkat <span className="text-red-500">*</span>
			</p>
			<p className="mb-2 text-xs text-foreground/55">
				Teks ini muncul saat kamu share link campaign ke media sosial
			</p>

			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
				placeholder={placeholder}
				rows={4}
				className={[
					"w-full rounded-xl border bg-white p-3 text-[13.5px] outline-none transition-colors",
					"placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
					error ? "border-red-400" : "border-foreground/10",
				].join(" ")}
			/>

			<p className={`mt-1 text-right text-xs ${remaining < 0 ? "text-red-500" : "text-foreground/50"}`}>
				{value.length} / {maxLength}
			</p>

			{/* Live Preview */}
			<div className="mt-4 rounded-2xl border border-foreground/10 bg-slate-50 p-3">
				<p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/40">
					Preview saat di-share
				</p>

				{/* WhatsApp Preview */}
				<div className="mx-auto max-w-[280px]">
					<div className="overflow-hidden rounded-2xl border-[3px] border-[#25D366] bg-white shadow-lg">
						{/* Phone status bar */}
						<div className="flex h-4 items-center justify-center bg-[#25D366]">
							<div className="h-[3px] w-8 rounded-full bg-white/30" />
						</div>

						{/* Chat area */}
						<div className="bg-[#e5ddd5] p-2.5">
							{/* Chat bubble */}
							<div className="max-w-full rounded-lg rounded-tl-none bg-white p-2 shadow-sm">
								{/* Link preview card */}
								<div className="mb-1.5 overflow-hidden rounded-lg border border-foreground/8">
									<img
										src={displayCover}
										alt="Preview"
										className="h-[100px] w-full object-cover"
										onError={(e) => { (e.target as HTMLImageElement).src = "/defaultimg.webp"; }}
									/>
									<div className="bg-[#f0f0f0] px-2 py-1.5">
										<p className="text-[10px] font-bold leading-tight text-foreground line-clamp-2">
											{displayTitle}
										</p>
										<p className="mt-0.5 text-[9px] leading-snug text-foreground/60 line-clamp-2">
											{displayCta}
										</p>
										<p className="mt-0.5 text-[8px] text-foreground/35">
											pesonakebaikan.com
										</p>
									</div>
								</div>

								<p className="text-[11px] leading-relaxed text-foreground/80">
									Hai, aku mau minta tolong nih. Aku lagi galang dana untuk{" "}
									<span className="font-semibold">{displayTitle}</span>.{" "}
									<span className="text-[#25D366]">pesonakebaikan.com/dona...</span>
									<br />
									Terima kasih ya 🙏
								</p>
								<p className="mt-1 text-right text-[9px] text-foreground/30">
									{new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
								</p>
							</div>
						</div>
					</div>

					<p className="mt-1.5 text-center text-[10px] text-foreground/35">
						Contoh tampilan di WhatsApp
					</p>
				</div>
			</div>
		</div>
	);
}
