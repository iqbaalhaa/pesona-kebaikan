"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Image from "next/image";
import Typography from "@mui/material/Typography";
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

function SlideImage({ src, priority }: { src: string; priority: boolean }) {
	const [imgSrc, setImgSrc] = React.useState(src);

	return (
		<Image
			src={imgSrc}
			alt="slide"
			fill
			priority={priority}
			unoptimized
			sizes="420px"
			style={{ objectFit: "cover" }}
			onError={() => setImgSrc("/defaultimg.webp")}
		/>
	);
}

export default function HeroCarousel({
	items = [],
}: {
	items?: CarouselItem[];
}) {
	const [active, setActive] = React.useState(0);
	const displaySlides = items.length > 0 ? items : defaultSlides;

	React.useEffect(() => {
		const t = setInterval(
			() => setActive((p) => (p + 1) % displaySlides.length),
			4500
		);
		return () => clearInterval(t);
	}, [displaySlides.length]);

	return (
		<Box
			className="relative w-full h-[360px] overflow-hidden bg-[#0b1220]"
			sx={{
				borderBottomLeftRadius: { md: 1 },
				borderBottomRightRadius: { md: 1 },
			}}
		>
			{displaySlides.map((s, i) => {
				const Content = (
					<>
						<SlideImage src={s.image} priority={i === 0} />
						<div className="absolute inset-0 bg-gradient-to-b from-black/92 via-black/75 to-transparent to-58% from-0% via-24%" />
					</>
				);

				return (
					<Box
						key={s.id || i}
						className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
							i === active ? "opacity-100" : "opacity-0"
						}`}
						sx={{
							zIndex: i === active ? 10 : 0,
							pointerEvents: i === active ? "auto" : "none",
						}}
					>
						{s.link ? (
							<Link href={s.link} className="block w-full h-full relative">
								{Content}
							</Link>
						) : (
							<div className="w-full h-full relative">{Content}</div>
						)}
					</Box>
				);
			})}
			<Box className="absolute inset-0 flex items-center justify-center text-center px-4 pt-16 pointer-events-none z-20">
				<Box className="max-w-[320px]">
					<Typography
						variant="h1"
						className="text-white text-[22px] font-black leading-[1.15]"
					>
						{displaySlides[active]?.title || "Mau berbuat baik apa hari ini?"}
					</Typography>
					<Typography className="mt-1 text-white/85 text-[13px]">
						Donasi cepat, transparan, dan terasa dampaknya.
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}
