import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { FacebookIcon, InstagramIcon, TwitterIcon, WhatsAppIcon } from "@/components/ui/SocialIcons";
import { blogService } from "@/services/blogService";
import { CopyLinkButton } from "@/components/blog/CopyLinkButton";

type Props = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const resolvedParams = await params;
	const blog = await blogService.getBlogById(resolvedParams.id);

	if (!blog) {
		return {
			title: "Artikel tidak ditemukan | Pesona Kebaikan",
			robots: { index: false, follow: false },
		};
	}

	const siteUrl =
		process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.com";
	const postUrl = `${siteUrl}/blog/${blog.id}`;
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
		blogService.getBlogById(resolvedParams.id),
		blogService.getBlogs({ page: 1, limit: 50 }),
	]);

	const allBlogs = allBlogsRes.data || [];
	const currentIdx = allBlogs.findIndex((b: any) => b.id === resolvedParams.id);
	const prevBlog = currentIdx > 0 ? allBlogs[currentIdx - 1] : null;
	const nextBlog = currentIdx < allBlogs.length - 1 ? allBlogs[currentIdx + 1] : null;
	const relatedBlogs = allBlogs
		.filter((b: any) => b.id !== resolvedParams.id && b.categoryId === blog?.categoryId)
		.slice(0, 3);

	if (!blog) {
		return (
			<div className="px-2 py-4">
				<p className="text-lg font-black">Tidak ditemukan</p>
				<Link
					href="/blog"
					className="mt-2 inline-flex items-center gap-1 text-sm font-extrabold text-primary"
				>
					<ChevronLeft size={16} />
					Kembali
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
	const postUrl = `${baseUrl}/blog/${blog.id}`;

	const plainTextContent = blog.content.replace(/<[^>]*>?/gm, "");
	const description =
		plainTextContent.length > 160
			? `${plainTextContent.substring(0, 157)}...`
			: plainTextContent;

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
		},
		{
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
			icon: <FacebookIcon size={18} />,
			label: "Share on Facebook",
		},
		{
			href: "https://www.instagram.com/",
			icon: <InstagramIcon size={18} />,
			label: "Share on Instagram",
		},
		{
			href: `https://wa.me/?text=${encodeURIComponent(blog.title + " " + postUrl)}`,
			icon: <WhatsAppIcon size={18} />,
			label: "Share on WhatsApp",
		},
	];

	return (
		<div className="mx-auto max-w-[800px] px-4 pb-6 pt-3">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<div className="mb-3">
				<Link
					href="/blog"
					className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
				>
					<ArrowLeft size={18} />
				</Link>
			</div>

			<div className="flex flex-col gap-1">
				<div className="flex flex-row items-center gap-1.5">
					<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
						{blog.category?.name || "Uncategorized"}
					</span>
					<span className="text-xs text-slate-400">
						{new Date(blog.createdAt).toLocaleDateString("id-ID", {
							day: "2-digit",
							month: "short",
							year: "numeric",
							timeZone: "Asia/Jakarta",
						})}
					</span>
				</div>
				<h1 className="mt-1 text-[20px] font-black leading-tight text-foreground md:text-[28px]">
					{blog.title}
				</h1>
			</div>

			{cover && (
				<div className="mt-2 overflow-hidden rounded-2xl border border-foreground/8">
					<img
						src={cover}
						alt={blog.title}
						className="h-[220px] w-full object-cover md:h-[420px]"
					/>
				</div>
			)}

			<div className="mt-4">
				<div
					className="prose prose-slate max-w-none [&_a]:text-primary [&_a]:underline [&_h1]:font-extrabold [&_h2]:font-extrabold [&_h3]:font-extrabold [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-2xl [&_p]:mb-2 [&_p]:leading-relaxed [&_p]:text-foreground/80"
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

			<hr className="my-4 border-foreground/8" />

			<div>
				<p className="mb-1.5 text-sm font-bold text-foreground">
					Bagikan Artikel
				</p>
				<div className="flex flex-row gap-1.5">
					{socialLinks.map((s) => (
						<a
							key={s.label}
							href={s.href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={s.label}
							className="grid h-9 w-9 place-items-center rounded-lg border border-foreground/12 text-foreground/70 transition-colors hover:bg-foreground/5"
						>
							{s.icon}
						</a>
					))}
					<CopyLinkButton url={postUrl} />
				</div>
			</div>

			{/* Prev / Next */}
			{(prevBlog || nextBlog) && (
				<div className="mt-6 grid grid-cols-2 gap-3">
					{prevBlog ? (
						<Link href={`/blog/${prevBlog.id}`} className="group flex flex-col gap-1 rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:border-primary/30">
							<span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
								<ChevronLeft size={14} /> Sebelumnya
							</span>
							<span className="text-[13px] font-bold leading-tight text-slate-700 line-clamp-2 group-hover:text-primary">
								{prevBlog.title}
							</span>
						</Link>
					) : <div />}
					{nextBlog ? (
						<Link href={`/blog/${nextBlog.id}`} className="group flex flex-col items-end gap-1 rounded-xl border border-slate-100 bg-white p-3 text-right transition-colors hover:border-primary/30">
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
									href={`/blog/${rb.id}`}
									className="flex gap-3 rounded-xl border border-slate-100 bg-white p-2.5 transition-colors hover:border-primary/30"
								>
									{rbCover ? (
										<img
											src={rbCover}
											alt={rb.title}
											className="h-16 w-16 shrink-0 rounded-lg object-cover"
										/>
									) : (
										<div className="h-16 w-16 shrink-0 rounded-lg bg-foreground/6" />
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
