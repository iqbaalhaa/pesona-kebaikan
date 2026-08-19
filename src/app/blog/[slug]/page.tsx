import Link from "next/link";
import { Metadata } from "next";
import { ChevronLeft, ChevronRight, ArrowLeft, Clock } from "lucide-react";
import { FacebookIcon, InstagramIcon, TwitterIcon, WhatsAppIcon } from "@/components/ui/SocialIcons";
import { blogService } from "@/services/blogService";
import { CopyLinkButton } from "@/components/blog/CopyLinkButton";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const resolvedParams = await params;
	const blog = await blogService.getBlogBySlug(resolvedParams.slug);

	if (!blog) {
		return {
			title: "Artikel tidak ditemukan | Pesona Kebaikan",
			robots: { index: false, follow: false },
		};
	}

	const siteUrl =
		process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.com";
	// Canonicalize to the pretty slug even when this page was reached via a
	// legacy /blog/{id} link (getBlogBySlug falls back to id lookup).
	const postUrl = `${siteUrl}/blog/${blog.slug || blog.id}`;
	const plainTextContent = blog.content.replace(/<[^>]*>?/gm, "");
	const description =
		plainTextContent.length > 160
			? `${plainTextContent.substring(0, 157)}...`
			: plainTextContent;

	const contentImageMatch = blog.content.match(
		/<img[^>]+src=["']([^"']+)["']/i,
	);
	const contentImage = contentImageMatch ? contentImageMatch[1] : null;

	const hasHeroImage = blog.heroImage && blog.heroImage.trim().length > 0;

	const cover =
		(hasHeroImage ? blog.heroImage : null) ||
		contentImage ||
		blog.gallery.find((m) => m.type === "image")?.url ||
		null;

	return {
		title: `${blog.title} | Pesona Kebaikan`,
		description,
		openGraph: {
			title: blog.title,
			description,
			type: "article",
			url: postUrl,
			siteName: "Pesona Kebaikan",
			...(cover ? { images: [{ url: cover, width: 1200, height: 630, alt: blog.title }] } : {}),
		},
		twitter: {
			card: "summary_large_image",
			title: blog.title,
			description,
			...(cover ? { images: [cover] } : {}),
		},
		alternates: { canonical: postUrl },
	};
}

export default async function BlogDetailPage({ params }: Props) {
	const resolvedParams = await params;
	const [blog, allBlogsRes] = await Promise.all([
		blogService.getBlogBySlug(resolvedParams.slug),
		blogService.getBlogs({ page: 1, limit: 50 }),
	]);

	const allBlogs = allBlogsRes.data || [];
	// Match by the resolved blog's own id (not resolvedParams.slug directly —
	// the param can be either a slug or a legacy id, but `blog.id` is always
	// the real id once resolved).
	const currentIdx = blog ? allBlogs.findIndex((b: any) => b.id === blog.id) : -1;
	const prevBlog = currentIdx > 0 ? allBlogs[currentIdx - 1] : null;
	const nextBlog =
		currentIdx >= 0 && currentIdx < allBlogs.length - 1
			? allBlogs[currentIdx + 1]
			: null;
	const relatedBlogs = allBlogs
		.filter((b: any) => b.id !== blog?.id && b.categoryId === blog?.categoryId)
		.slice(0, 3);

	if (!blog) {
		return (
			<div className="mx-auto max-w-[800px] px-4 py-10 text-center">
				<p className="text-lg font-black text-foreground">
					Artikel tidak ditemukan
				</p>
				<p className="mt-1 text-sm text-slate-400">
					Mungkin sudah dihapus atau tautannya salah.
				</p>
				<Link
					href="/blog"
					className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-primary/90"
				>
					<ChevronLeft size={16} />
					Kembali ke Blog
				</Link>
			</div>
		);
	}

	const contentImageMatch = blog.content.match(
		/<img[^>]+src=["']([^"']+)["']/i,
	);
	const contentImage = contentImageMatch ? contentImageMatch[1] : null;

	const hasHeroImage = blog.heroImage && blog.heroImage.trim().length > 0;

	const cover =
		(hasHeroImage ? blog.heroImage : null) ||
		contentImage ||
		blog.gallery.find((m) => m.type === "image")?.url ||
		null;

	const video = blog.gallery.find((m) => m.type === "video")?.url;

	const baseUrl =
		process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.com";
	const postUrl = `${baseUrl}/blog/${blog.slug || blog.id}`;

	const plainTextContent = blog.content.replace(/<[^>]*>?/gm, "");
	const description =
		plainTextContent.length > 160
			? `${plainTextContent.substring(0, 157)}...`
			: plainTextContent;

	// Rough reading-time estimate (~200 words/min) — small touch that makes
	// the article header feel less bare, especially on cover-less posts.
	const wordCount = plainTextContent.trim()
		? plainTextContent.trim().split(/\s+/).length
		: 0;
	const readingMinutes = Math.max(1, Math.round(wordCount / 200));

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: blog.title,
		description,
		...(cover ? { image: cover } : {}),
		datePublished: new Date(blog.createdAt).toISOString(),
		dateModified: new Date(blog.updatedAt || blog.createdAt).toISOString(),
		author: { "@type": "Organization", name: "Pesona Kebaikan" },
		publisher: {
			"@type": "Organization",
			name: "Pesona Kebaikan",
			logo: { "@type": "ImageObject", url: `${baseUrl}/brand/logo.png` },
		},
		mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
	};

	const socialLinks = [
		{
			href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(postUrl)}`,
			icon: <TwitterIcon size={18} />,
			label: "Share on X",
			className: "bg-black text-white hover:bg-black/85",
		},
		{
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
			icon: <FacebookIcon size={18} />,
			label: "Share on Facebook",
			className: "bg-[#1877F2] text-white hover:bg-[#1877F2]/85",
		},
		{
			href: "https://www.instagram.com/",
			icon: <InstagramIcon size={18} />,
			label: "Share on Instagram",
			className:
				"bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white hover:opacity-85",
		},
		{
			href: `https://wa.me/?text=${encodeURIComponent(blog.title + " " + postUrl)}`,
			icon: <WhatsAppIcon size={18} />,
			label: "Share on WhatsApp",
			className: "bg-[#25D366] text-white hover:bg-[#25D366]/85",
		},
	];

	const metaRow = (light: boolean) => (
		<div
			className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${light ? "text-white/80" : "text-slate-400"}`}
		>
			<span
				className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
					light ? "bg-white/20 text-white backdrop-blur-sm" : "bg-primary/10 text-primary"
				}`}
			>
				{blog.category?.name || "Uncategorized"}
			</span>
			<span>
				{new Date(blog.createdAt).toLocaleDateString("id-ID", {
					day: "2-digit",
					month: "short",
					year: "numeric",
					timeZone: "Asia/Jakarta",
				})}
			</span>
			<span className="flex items-center gap-1">
				<Clock size={12} />
				{readingMinutes} menit baca
			</span>
		</div>
	);

	return (
		<div className="mx-auto max-w-[800px] px-4 pb-10 pt-3">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<div className="mb-3">
				<Link
					href="/blog"
					className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
				>
					<ArrowLeft size={18} />
				</Link>
			</div>

			<article className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_-14px_rgba(15,23,42,0.18)]">
				{cover ? (
					<div className="relative h-[220px] w-full md:h-[420px]">
						<img
							src={cover}
							alt={blog.title}
							className="h-full w-full object-cover"
						/>
					</div>
				) : (
					// No cover photo — a colored header band still gives the article
					// some visual presence instead of dropping straight into text.
					<div className="relative overflow-hidden bg-gradient-to-br from-[var(--brand)] to-emerald-700 px-5 py-8 md:px-8 md:py-12">
						<div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
						<div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/10" />
						<div className="relative">
							{metaRow(true)}
							<h1 className="mt-3 text-[22px] font-black leading-tight text-white md:text-[32px]">
								{blog.title}
							</h1>
						</div>
					</div>
				)}

				<div className="p-5 md:p-8">
					{cover && (
						<div className="flex flex-col gap-1">
							{metaRow(false)}
							<h1 className="mt-1 text-[20px] font-black leading-tight text-foreground md:text-[28px]">
								{blog.title}
							</h1>
						</div>
					)}

					<div className={cover ? "mt-4" : undefined}>
						<div
							className="prose prose-slate max-w-none [&_a]:text-primary [&_a]:underline [&_h1]:mb-2 [&_h1]:mt-6 [&_h1]:font-extrabold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-[19px] [&_h2]:font-extrabold [&_h3]:mb-1.5 [&_h3]:mt-5 [&_h3]:text-[17px] [&_h3]:font-extrabold [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-2xl [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_strong]:font-extrabold [&_strong]:text-foreground"
							dangerouslySetInnerHTML={{ __html: blog.content }}
						/>

						{video && (
							<div className="mt-3 overflow-hidden rounded-2xl border border-foreground/8">
								<video
									src={video}
									controls
									className="h-[220px] w-full bg-black md:h-[360px]"
								/>
							</div>
						)}
					</div>

					{/* Share panel */}
					<div className="mt-6 rounded-2xl bg-slate-50 p-4">
						<p className="mb-2.5 text-sm font-bold text-foreground">
							Bagikan Artikel
						</p>
						<div className="flex flex-row flex-wrap gap-2">
							{socialLinks.map((s) => (
								<a
									key={s.label}
									href={s.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={s.label}
									className={`grid h-10 w-10 place-items-center rounded-full shadow-sm transition-colors ${s.className}`}
								>
									{s.icon}
								</a>
							))}
							<CopyLinkButton url={postUrl} />
						</div>
					</div>
				</div>
			</article>

			{/* Prev / Next */}
			{(prevBlog || nextBlog) && (
				<div className="mt-4 grid grid-cols-2 gap-3">
					{prevBlog ? (
						<Link
							href={`/blog/${prevBlog.slug || prevBlog.id}`}
							className="group flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
						>
							<span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
								<ChevronLeft size={14} /> Sebelumnya
							</span>
							<span className="text-[13px] font-bold leading-tight text-slate-700 line-clamp-2 group-hover:text-primary">
								{prevBlog.title}
							</span>
						</Link>
					) : <div />}
					{nextBlog ? (
						<Link
							href={`/blog/${nextBlog.slug || nextBlog.id}`}
							className="group flex flex-col items-end gap-1 rounded-2xl border border-slate-100 bg-white p-3 text-right shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
						>
							<span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
								Berikutnya <ChevronRight size={14} />
							</span>
							<span className="text-[13px] font-bold leading-tight text-slate-700 line-clamp-2 group-hover:text-primary">
								{nextBlog.title}
							</span>
						</Link>
					) : <div />}
				</div>
			)}

			{/* Related Articles */}
			{relatedBlogs.length > 0 && (
				<div className="mt-6">
					<h3 className="mb-3 text-[15px] font-black text-foreground">Artikel Terkait</h3>
					<div className="flex flex-col gap-3">
						{relatedBlogs.map((rb: any) => {
							const rbCover = rb.heroImage || rb.gallery?.[0]?.url || null;
							return (
								<Link
									key={rb.id}
									href={`/blog/${rb.slug || rb.id}`}
									className="flex gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
								>
									{rbCover ? (
										<img
											src={rbCover}
											alt={rb.title}
											className="h-16 w-16 shrink-0 rounded-lg object-cover"
										/>
									) : (
										<ImagePlaceholder
											className="h-16 w-16 shrink-0 rounded-lg"
											iconClassName="h-6 w-6"
										/>
									)}
									<div className="min-w-0 flex-1">
										<p className="text-[13px] font-bold leading-tight text-slate-800 line-clamp-2">
											{rb.title}
										</p>
										<p className="mt-1 text-[11px] text-slate-400">
											{new Date(rb.createdAt).toLocaleDateString("id-ID", {
												day: "2-digit",
												month: "short",
												year: "numeric",
												timeZone: "Asia/Jakarta",
											})}
										</p>
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
