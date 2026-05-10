"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

export interface CarouselItem {
	id: string;
	image: string;
	link?: string;
	title?: string;
}

const defaultSlides: CarouselItem[] = [
	{ id: "def1", image: "/brand/carousel1.webp" },
	{ id: "def2", image: "/brand/carousel2.webp" },
];

function SlideImage({ src, alt, priority }: { src: string; alt: string; priority: boolean }) {
	const [imgSrc, setImgSrc] = React.useState(src);
	return (
		<Image
			src={imgSrc}
			alt={alt}
			fill
			priority={priority}
			unoptimized
			sizes="420px"
			style={{ objectFit: "cover" }}
			onError={() => setImgSrc("/defaultimg.webp")}
		/>
	);
}

export default function HeroCarousel({ items = [] }: { items?: CarouselItem[] }) {
	const [active, setActive] = React.useState(0);
	const displaySlides = items.length > 0 ? items : defaultSlides;

	React.useEffect(() => {
		const t = setInterval(() => setActive((p) => (p + 1) % displaySlides.length), 4500);
		return () => clearInterval(t);
	}, [displaySlides.length]);

	return (
		<div role="region" aria-roledescription="carousel" aria-label="Banner kampanye" className="relative z-0 aspect-[4/5] w-full overflow-hidden bg-[#0b1220] md:rounded-b">
			{displaySlides.map((s, i) => {
				const Content = (
					<>
						<SlideImage src={s.image} alt={s.title || "Banner kampanye donasi"} priority={i === 0} />
						<div className="absolute inset-0 bg-gradient-to-b from-black/92 via-black/75 to-transparent to-58% from-0% via-24%" />
					</>
				);
				return (
					<div
						key={s.id || i}
						className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}
					>
						{s.link ? (
							<Link href={s.link} aria-label={s.title || "Lihat kampanye"} className="relative block h-full w-full">{Content}</Link>
						) : (
							<div className="relative h-full w-full">{Content}</div>
						)}
					</div>
				);
			})}
			{displaySlides[active]?.title && (
				<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 pt-16 text-center">
					<div className="max-w-[320px]">
						<h1 className="text-[22px] font-black leading-[1.15] text-white">
							{displaySlides[active].title}
						</h1>
						<p className="mt-1 text-[13px] text-white/85">
							Donasi cepat, transparan, dan terasa dampaknya.
						</p>
					</div>
				</div>
			)}
			{displaySlides.length > 1 && (
				<>
					<button
						onClick={() => setActive((p) => (p - 1 + displaySlides.length) % displaySlides.length)}
						aria-label="Slide sebelumnya"
						className="absolute left-3 top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 active:scale-95"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
					<button
						onClick={() => setActive((p) => (p + 1) % displaySlides.length)}
						aria-label="Slide berikutnya"
						className="absolute right-3 top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 active:scale-95"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
					<div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
						{displaySlides.map((_, i) => (
							<button
								key={i}
								onClick={() => setActive(i)}
								aria-label={`Ke slide ${i + 1}`}
								className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
