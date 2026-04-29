import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronLeft, Facebook, Instagram, Twitter } from "lucide-react";
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
		process.env.NEXT_PUBLIC_BASE_URL || "https://pesonakebaikan.id";
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
		"/defaultimg.webp";

	return {
		title: `${blog.title} | Pesona Kebaikan`,
		description,
		openGraph: {
			title: blog.title,
			description,
			type: "article",
			url: postUrl,
			siteName: "Pesona Kebaikan",
			images: [{ url: cover, width: 1200, height: 630, alt: blog.title }],
		},
		twitter: {
			card: "summary_large_image",
			title: blog.title,
			description,
			images: [cover],
		},
		alternates: { canonical: postUrl },
	};
}

// WhatsApp icon not in lucide — inline SVG
function WhatsAppIcon() {
	return (
		<svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
		</svg>
	);
}

export default async function BlogDetailPage({ params }: Props) {
	const resolvedParams = await params;
	const blog = await blogService.getBlogById(resolvedParams.id);

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
		"/defaultimg.webp";

	const video = blog.gallery.find((m) => m.type === "video")?.url;

	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || "https://pesonakebaikan.id";
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
		image: cover,
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
			icon: <Twitter size={18} />,
			label: "Share on X",
		},
		{
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
			icon: <Facebook size={18} />,
			label: "Share on Facebook",
		},
		{
			href: "https://www.instagram.com/",
			icon: <Instagram size={18} />,
			label: "Share on Instagram",
		},
		{
			href: `https://wa.me/?text=${encodeURIComponent(blog.title + " " + postUrl)}`,
			icon: <WhatsAppIcon />,
			label: "Share on WhatsApp",
		},
	];

	return (
		<div className="mx-auto max-w-[800px] px-2 pb-4 pt-2.5">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<div className="mb-2 flex items-center justify-between">
				<Link
					href="/blog"
					className="inline-flex items-center gap-1 text-sm font-extrabold text-primary"
				>
					<ChevronLeft size={16} />
					Kembali
				</Link>
			</div>

			<div className="flex flex-col gap-1">
				<div className="flex flex-row items-center gap-1">
					<span className="rounded bg-foreground/8 px-2 py-0.5 text-xs font-bold">
						{blog.category?.name || "Uncategorized"}
					</span>
					<span className="text-xs font-extrabold text-foreground/55">
						{new Date(blog.createdAt).toLocaleDateString("id-ID", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}
					</span>
				</div>
				<h1 className="text-[22px] font-black leading-tight text-foreground md:text-[32px]">
					{blog.title}
				</h1>
			</div>

			<div className="mt-2 overflow-hidden rounded-2xl border border-foreground/8">
				<img
					src={cover}
					alt={blog.title}
					className="h-[220px] w-full object-cover md:h-[420px]"
				/>
			</div>

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
		</div>
	);
}
