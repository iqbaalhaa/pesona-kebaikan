"use client";

import React, { useEffect, useState } from "react";
import { Heart, User, FileText, Download } from "lucide-react";
import {
	FacebookIcon,
	InstagramIcon,
	TwitterIcon,
	LinkedinIcon,
	YoutubeIcon,
} from "@/components/ui/SocialIcons";
import { getPageContent } from "@/actions/cms";
import ProfileHeader from "@/components/profile/ProfileHeader";

interface OrgMember {
	name: string;
	position: string;
	image: string;
}

interface Socials {
	facebook: string;
	instagram: string;
	twitter: string;
	linkedin: string;
	youtube: string;
}

interface Legality {
	title: string;
	url: string;
}

interface AboutData {
	banner: string;
	vision: string;
	mission: string;
	goals: string;
	achievements: string;
	socials: Socials;
	organization: OrgMember[];
	legality: Legality[];
}

function HtmlContent({ content }: { content: string }) {
	if (!content) return null;
	return (
		<div
			dangerouslySetInnerHTML={{ __html: content }}
			className="prose max-w-none leading-relaxed text-slate-700"
		/>
	);
}

const socialIcons: Record<string, React.ReactNode> = {
	facebook: <FacebookIcon size={20} />,
	instagram: <InstagramIcon size={20} />,
	twitter: <TwitterIcon size={20} />,
	linkedin: <LinkedinIcon size={20} />,
	youtube: <YoutubeIcon size={20} />,
};

export default function AboutPage() {
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState("Tentang Kami");
	const [content, setContent] = useState("");
	const [aboutData, setAboutData] = useState<AboutData | null>(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const page = await getPageContent("about");
				if (page) {
					setTitle(page.title);
					setContent(page.content);
					if (page.data) setAboutData(page.data as any);
				}
			} catch (error) {
				console.error("Failed to load about data", error);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, []);

	if (loading) {
		return (
			<div className="px-2 pb-6 pt-2.5">
				<div className="mb-4 h-[200px] animate-pulse rounded-2xl bg-foreground/5" />
				<div className="mb-2 h-10 w-3/5 animate-pulse rounded bg-foreground/5" />
				<div className="mb-1 h-5 animate-pulse rounded bg-foreground/5" />
				<div className="mb-1 h-5 animate-pulse rounded bg-foreground/5" />
				<div className="h-5 w-4/5 animate-pulse rounded bg-foreground/5" />
			</div>
		);
	}

	const sections = [
		{ key: "vision", label: "Visi", content: aboutData?.vision },
		{ key: "mission", label: "Misi", content: aboutData?.mission },
		{ key: "goals", label: "Tujuan", content: aboutData?.goals },
		{
			key: "achievements",
			label: "Capaian & Prestasi",
			content: aboutData?.achievements,
		},
	].filter((s) => s.content);

	return (
		<div className="pb-8">
			<ProfileHeader title={title} container maxWidth="md" />

			{aboutData?.banner ? (
				<div
					className="mb-4 h-[200px] w-full bg-cover bg-center md:h-[350px]"
					style={{ backgroundImage: `url(${aboutData.banner})` }}
				/>
			) : (
				<div className="mx-auto max-w-2xl px-2">
					<div className="mb-4 flex flex-col items-center rounded-2xl bg-gradient-to-br from-primary to-green-600 p-4 text-center text-white">
						<div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
							<Heart size={40} />
						</div>
						<h1 className="text-2xl font-extrabold">{title}</h1>
					</div>
				</div>
			)}

			<div className="mx-auto max-w-2xl px-2">
				{content && (
					<div className="mb-6">
						<HtmlContent content={content} />
					</div>
				)}

				{sections.length > 0 && (
					<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
						{sections.map((s) => (
							<div
								key={s.key}
								className="h-full rounded-xl border border-slate-200 bg-slate-50 p-3"
							>
								<h3 className="mb-1 text-base font-bold text-primary">
									{s.label}
								</h3>
								<HtmlContent content={s.content!} />
							</div>
						))}
					</div>
				)}

				{aboutData?.organization && aboutData.organization.length > 0 && (
					<div className="mb-6">
						<h2 className="mb-4 text-center text-xl font-extrabold text-foreground">
							Tim Kami
						</h2>
						<div className="grid grid-cols-2 justify-center gap-3 sm:grid-cols-4 md:grid-cols-4">
							{aboutData.organization.map((member, index) => (
								<div
									key={index}
									className="h-full rounded-xl border border-slate-200 p-2 text-center"
								>
									{member.image ? (
										<img
											src={member.image}
											alt={member.name}
											className="mx-auto mb-2 h-[100px] w-[100px] rounded-full bg-slate-100 object-cover"
										/>
									) : (
										<div className="mx-auto mb-2 grid h-[100px] w-[100px] place-items-center rounded-full bg-slate-100">
											<User size={50} className="text-slate-400" />
										</div>
									)}
									<p className="mb-0.5 text-sm font-bold text-foreground">
										{member.name}
									</p>
									<p className="text-xs leading-tight text-slate-500">
										{member.position}
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{aboutData?.legality && aboutData.legality.length > 0 && (
					<div className="mb-6">
						<h2 className="mb-3 text-xl font-extrabold text-foreground">
							Legalitas & Dokumen
						</h2>
						<div className="flex flex-col gap-2">
							{aboutData.legality.map((doc, index) => (
								<a
									key={index}
									href={doc.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 no-underline transition-colors hover:border-slate-300 hover:bg-slate-50"
								>
									<span className="rounded-lg bg-sky-100 p-1 text-sky-600">
										<FileText size={20} />
									</span>
									<span className="flex-1">
										<span className="block text-sm font-semibold text-foreground">
											{doc.title}
										</span>
										<span className="text-xs text-text-secondary">
											Klik untuk melihat dokumen
										</span>
									</span>
									<Download size={18} className="text-foreground/40" />
								</a>
							))}
						</div>
					</div>
				)}

				{aboutData?.socials && (
					<div className="border-t border-slate-200 pt-4 text-center">
						<h3 className="mb-2 text-base font-bold text-foreground">
							Ikuti Kami
						</h3>
						<div className="flex justify-center gap-2">
							{Object.entries(aboutData.socials)
								.filter(([, url]) => url)
								.map(([key, url]) => (
									<a
										key={key}
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
									>
										{socialIcons[key]}
									</a>
								))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
