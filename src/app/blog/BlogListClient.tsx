"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Share2, Copy, X } from "lucide-react";
import { TwitterIcon, FacebookIcon, WhatsAppIcon } from "@/components/ui/SocialIcons";
import CategoryPill from "@/components/common/CategoryPill";

type BlogPost = {
	id: string;
	slug: string | null;
	title: string;
	excerpt: string;
	cover: string | null;
	date: string;
	tag: string;
};

type BlogListClientProps = {
	posts: BlogPost[];
	categories: string[];
};

export default function BlogListClient({
	posts,
	categories,
}: BlogListClientProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentCategory = searchParams.get("category") || "Semua";

	const [sharePostId, setSharePostId] = React.useState<string | null>(null);

	const handleFilterChange = (category: string) => {
		if (category === "Semua") {
			router.push("/blog");
		} else {
			router.push(`/blog?category=${category}`);
		}
	};

	const handleShare = (platform: string) => {
		if (!sharePostId) return;
		const post = posts.find((p) => p.id === sharePostId);
		if (!post) return;

		const url = `${window.location.origin}/blog/${post.slug || post.id}`;
		const text = post.title;

		let shareUrl = "";
		switch (platform) {
			case "twitter":
				shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
				break;
			case "facebook":
				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
				break;
			case "whatsapp":
				shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
				break;
			case "copy":
				navigator.clipboard.writeText(url);
				setSharePostId(null);
				return;
		}

		if (shareUrl) {
			window.open(shareUrl, "_blank", "noopener,noreferrer");
		}
		setSharePostId(null);
	};

	const shareOptions = [
		{ id: "twitter", label: "X", icon: <TwitterIcon size={16} /> },
		{ id: "facebook", label: "Facebook", icon: <FacebookIcon size={16} /> },
		{ id: "whatsapp", label: "WhatsApp", icon: <WhatsAppIcon size={16} /> },
		{ id: "copy", label: "Salin Link", icon: <Copy size={16} /> },
	];

	return (
		<div>
			<div className="sticky top-0 z-10 border-b border-divider bg-white px-4 pb-2 pt-4 lg:px-6">
				<h1 className="text-xl font-black text-foreground">Blog</h1>
				<p className="mt-0.5 text-xs text-text-secondary">Artikel inspiratif seputar donasi dan kebaikan</p>
			</div>

			<div className="mx-auto max-w-[800px] px-4">
			{/* Category filters */}
			<div className="mt-2 mb-3 flex gap-1 overflow-x-auto pb-0.5">
				{["Semua", ...categories].map((tag) => (
					<button
						key={tag}
						onClick={() => handleFilterChange(tag)}
						className={[
							"shrink-0 cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition-colors",
							currentCategory === tag
								? "bg-primary text-white"
								: "border border-foreground/15 text-foreground/70 hover:bg-foreground/5",
						].join(" ")}
					>
						{tag}
					</button>
				))}
			</div>

			{/* Posts */}
			<div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
				{posts.length === 0 ? (
					<p className="mt-4 text-center text-text-secondary lg:col-span-2">
						Tidak ada artikel ditemukan.
					</p>
				) : (
					posts.map((post) => (
						<Link key={post.id} href={`/blog/${post.slug || post.id}`} className="block h-full">
							<div className="flex h-full flex-col gap-2 rounded-xl border border-foreground/8 bg-white p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md sm:flex-row lg:flex-col">
								{post.cover ? (
									<img
										src={post.cover}
										alt={post.title}
										className="h-[200px] w-full shrink-0 rounded-lg bg-foreground/4 object-cover sm:h-[160px] sm:w-[200px] lg:h-[180px] lg:w-full"
									/>
								) : (
									<div className="h-[200px] w-full shrink-0 rounded-lg bg-foreground/6 sm:h-[160px] sm:w-[200px] lg:h-[180px] lg:w-full" />
								)}
								<div className="flex flex-1 flex-col justify-center">
									<div className="mb-1.5 flex items-center gap-1">
										<CategoryPill
											label={post.tag}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleFilterChange(post.tag);
											}}
										/>
										<span className="text-[11.5px] font-bold text-foreground/55">
											{post.date}
										</span>
									</div>
									<h2 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-foreground">
										{post.title}
									</h2>
									<p className="mb-2 line-clamp-2 text-[14.5px] leading-relaxed text-foreground/70">
										{post.excerpt}
									</p>
									<div className="mt-auto flex items-center justify-between">
										<span className="text-[13px] font-bold text-primary">
											Baca Selengkapnya
										</span>
										<button
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setSharePostId(post.id);
											}}
											className="rounded-lg p-1.5 text-foreground/40 transition-colors hover:text-primary"
										>
											<Share2 size={16} />
										</button>
									</div>
								</div>
							</div>
						</Link>
					))
				)}
			</div>

			{/* Share bottom sheet */}
			{sharePostId && (
				<>
					<div
						className="fixed inset-0 z-40 bg-black/40"
						onClick={() => setSharePostId(null)}
					/>
					<div className="fixed inset-x-0 bottom-0 z-50 animate-[slideUp_200ms_ease] rounded-t-2xl bg-white p-4 shadow-xl">
						<div className="mb-3 flex items-center justify-between">
							<h3 className="text-base font-extrabold text-foreground">
								Bagikan ke
							</h3>
							<button
								onClick={() => setSharePostId(null)}
								className="rounded-lg p-1 text-foreground/50 hover:bg-foreground/5"
							>
								<X size={20} />
							</button>
						</div>
						<div className="flex flex-col">
							{shareOptions.map((option) => (
								<button
									key={option.id}
									onClick={() => handleShare(option.id)}
									className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-foreground/5"
								>
									<span className="text-foreground/80">{option.icon}</span>
									<span className="text-[14.5px] font-semibold text-foreground">
										{option.label}
									</span>
								</button>
							))}
						</div>
					</div>
				</>
			)}

			<style jsx>{`
				@keyframes slideUp {
					from {
						transform: translateY(100%);
					}
					to {
						transform: translateY(0);
					}
				}
			`}</style>
		</div>
		</div>
	);
}
