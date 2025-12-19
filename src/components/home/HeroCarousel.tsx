"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Image from "next/image";
import Typography from "@mui/material/Typography";

const slides = [
	{ src: "/brand/carousel1.webp" },
	{ src: "/brand/carousel2.webp" },
];

function SlideImage({ src }: { src: string }) {
	const [imgSrc, setImgSrc] = React.useState(src);

	return (
		<Image
			src={imgSrc}
			alt="slide"
			fill
			priority
			sizes="420px"
			style={{ objectFit: "cover" }}
			onError={() => setImgSrc("/defaultimg.webp")}
		/>
	);
}

export default function HeroCarousel() {
	const [active, setActive] = React.useState(0);

	React.useEffect(() => {
		const t = setInterval(
			() => setActive((p) => (p + 1) % slides.length),
			4500
		);
		return () => clearInterval(t);
	}, []);

	return (
		<Box
			className="relative w-full h-[360px] overflow-hidden bg-[#0b1220]"
			sx={{
				borderBottomLeftRadius: { md: 1 },
				borderBottomRightRadius: { md: 1 },
			}}
		>
			{slides.map((s, i) => (
				<Box
					key={s.src}
					className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
						i === active ? "opacity-100" : "opacity-0"
					}`}
				>
					<SlideImage src={s.src} />
					<div className="absolute inset-0 bg-gradient-to-b from-black/92 via-black/75 to-transparent to-58% from-0% via-24%" />
				</Box>
			))}
			<Box className="absolute inset-0 flex items-center justify-center text-center px-4 pt-16 pointer-events-none">
				<Box className="max-w-[320px]">
					<Typography
						variant="h1"
						className="text-white text-[22px] font-black leading-[1.15]"
					>
						Mau berbuat baik apa hari ini?
					</Typography>
					<Typography className="mt-1 text-white/85 text-[13px]">
						Donasi cepat, transparan, dan terasa dampaknya.
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}
