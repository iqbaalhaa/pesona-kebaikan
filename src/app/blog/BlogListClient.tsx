"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Share2, Twitter, Facebook, Copy, X } from "lucide-react";

type BlogPost = {
	id: string;
	title: string;
	excerpt: string;
	cover: string;
	date: string;
	tag: string;
};

type BlogListClientProps = {
	posts: BlogPost[];
	categories: string[];
};

function WhatsAppIcon({ size = 16 }: { size?: number }) {
	return (
		<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
		</svg>
	);
}

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

		const url = `${window.location.origin}/blog/${post.id}`;
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
		{ id: "twitter", label: "X", icon: <Twitter size={16} /> },
		{ id: "facebook", label: "Facebook", icon: <Facebook size={16} /> },
		{ id: "whatsapp", label: "WhatsApp", icon: <WhatsAppIcon size={16} /> },
		{ id: "copy", label: "Salin Link", icon: <Copy size={16} /> },
	];

	return (
		<div className="mx-auto max-w-[800px] px-2 pt-2.5">
			<div className="mb-2 flex items-center justify-between">
				<h1 className="text-2xl font-black text-foreground">Blog</h1>
			</div>

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
			<div className="flex flex-col gap-3">
				{posts.length === 0 ? (
					<p className="mt-4 text-center text-text-secondary">
						Tidak ada artikel ditemukan.
					</p>
				) : (
					posts.map((post) => (
						<Link key={post.id} href={`/blog/${post.id}`} className="block">
							<div className="flex flex-col gap-2 rounded-xl border border-foreground/8 bg-white p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md sm:flex-row dark:bg-surface">
								<img
									src={post.cover}
									alt={post.title}
									className="h-[200px] w-full shrink-0 rounded-lg bg-foreground/4 object-cover sm:h-[160px] sm:w-[200px]"
								/>
								<div className="flex flex-1 flex-col justify-center">
									<div className="mb-1.5 flex items-center gap-1">
										<button
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												handleFilterChange(post.tag);
											}}
											className="cursor-pointer rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-white"
										>
											{post.tag}
										</button>
										<span className="text-[11.5px] font-bold text-foreground/55">
											{post.date}
										</span>
									</div>
									<h2 className="mb-1 line-clamp-2 text-lg font-extrabold leading-tight text-foreground">
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
					<div className="fixed inset-x-0 bottom-0 z-50 animate-[slideUp_200ms_ease] rounded-t-2xl bg-white p-4 shadow-xl dark:bg-surface">
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
	);
}
