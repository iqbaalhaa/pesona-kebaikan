"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Image from "next/image";
import Typography from "@mui/material/Typography";

const slides = [
	{ src: "/brand/carousel1.webp" },
	{ src: "/brand/carousel2.webp" },
];

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
			sx={{
				position: "relative",
				width: "100%",
				height: 360,
				overflow: "hidden",
				borderTopLeftRadius: 0,
				borderTopRightRadius: 0,
				borderBottomLeftRadius: 24,
				borderBottomRightRadius: 24,
				bgcolor: "#0b1220",
			}}
		>
			{slides.map((s, i) => (
				<Box
					key={s.src}
					sx={{
						position: "absolute",
						inset: 0,
						opacity: i === active ? 1 : 0,
						transition: "opacity 700ms ease",
					}}
				>
					<Image
						src={s.src}
						alt={`slide-${i + 1}`}
						fill
						priority={i === 0}
						sizes="420px"
						style={{ objectFit: "cover" }}
					/>
					<Box
						sx={{
							position: "absolute",
							inset: 0,
							background:
								"linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 24%, rgba(0,0,0,0.35) 58%, rgba(0,0,0,0.00) 100%)",
						}}
					/>
				</Box>
			))}
			<Box
				sx={{
					position: "absolute",
					inset: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					px: 2.5,
					pt: "64px",
					pointerEvents: "none",
				}}
			>
				<Box sx={{ maxWidth: 320 }}>
					<Typography
						sx={{
							color: "#fff",
							fontSize: 22,
							fontWeight: 900,
							lineHeight: 1.15,
						}}
					>
						Mau berbuat baik apa hari ini?
					</Typography>
					<Typography
						sx={{ mt: 1, color: "rgba(255,255,255,.86)", fontSize: 13 }}
					>
						Donasi cepat, transparan, dan terasa dampaknya.
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}
