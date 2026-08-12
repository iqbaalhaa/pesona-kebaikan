"use client";

import * as React from "react";
import { Gavel, Loader2 } from "lucide-react";
import { getPageContent } from "@/actions/cms";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PageContainer from "@/components/profile/PageContainer";

export default function TermsPage() {
	const [content, setContent] = React.useState<string>("");
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		async function load() {
			try {
				const page = await getPageContent("terms");
				if (page?.content) {
					setContent(page.content);
				}
			} catch (e) {
				console.error("Failed to load terms", e);
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	return (
		<PageContainer>
			<ProfileHeader title="Syarat & Ketentuan" />

			<div className="mb-3 flex items-center gap-2 rounded-xl bg-slate-100 p-2">
				<Gavel size={20} className="shrink-0 text-slate-500" />
				<p className="text-[13px] leading-snug text-slate-600">
					Harap membaca syarat dan ketentuan ini dengan saksama sebelum
					menggunakan platform Pesona Kebaikan.
				</p>
			</div>

			{loading ? (
				<div className="flex justify-center py-8">
					<Loader2 size={24} className="animate-spin text-primary" />
				</div>
			) : content ? (
				<div
					className="sun-editor-editable [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-extrabold [&_h3]:text-foreground [&_li]:mb-0.5 [&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-foreground/70 [&_ol]:mb-1.5 [&_ol]:pl-3 [&_p]:mb-1.5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground/70 [&_ul]:mb-1.5 [&_ul]:pl-3"
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			) : (
				<p className="text-center text-text-secondary">
					Belum ada konten syarat & ketentuan.
				</p>
			)}

			<div className="mt-4 border-t border-foreground/10 pt-3">
				<p className="text-xs text-foreground/50">
					Terakhir diperbarui:{" "}
					{new Date().toLocaleDateString("id-ID", {
						day: "numeric",
						month: "long",
						year: "numeric",
						timeZone: "Asia/Jakarta",
					})}
				</p>
			</div>
		</PageContainer>
	);
}
