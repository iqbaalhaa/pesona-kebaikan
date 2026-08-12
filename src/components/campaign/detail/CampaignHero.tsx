"use client";

import * as React from "react";
import Image from "next/image";
import { Box } from "@mui/material";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

interface CampaignHeroProps {
	images: string[];
	title: string;
}

const HeroImage = ({
	src,
	alt,
	priority,
}: {
	src: string;
	alt: string;
	priority: boolean;
}) => {
	const [errored, setErrored] = React.useState(false);
	if (!src || errored) {
		return <ImagePlaceholder className="absolute inset-0" iconClassName="h-10 w-10" />;
	}
	return (
		<Image
			src={src}
			alt={alt}
			fill
			unoptimized
			style={{ objectFit: "cover" }}
			priority={priority}
			onError={() => setErrored(true)}
		/>
	);
};

export default function CampaignHero({ images, title }: CampaignHeroProps) {
	const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
	const carouselRef = React.useRef<HTMLDivElement>(null);
	// No cover image at all — one static placeholder slide, no carousel chrome.
	const slides = images.length > 0 ? images : [""];

	const handleScroll = () => {
		if (carouselRef.current) {
			const scrollLeft = carouselRef.current.scrollLeft;
			const width = carouselRef.current.clientWidth;
			const index = Math.round(scrollLeft / width);
			setCurrentImageIndex(index);
		}
	};

	const scrollToImage = (index: number) => {
		if (carouselRef.current) {
			const width = carouselRef.current.clientWidth;
			carouselRef.current.scrollTo({
				left: width * index,
				behavior: "smooth",
			});
		}
	};

	return (
		<Box
			sx={{
				position: "relative",
				width: "100%",
				aspectRatio: "1228 / 714",
				bgcolor: "#f1f5f9",
			}}
		>
			<Box
				ref={carouselRef}
				onScroll={handleScroll}
				sx={{
					display: "flex",
					overflowX: "auto",
					scrollSnapType: "x mandatory",
					width: "100%",
					height: "100%",
					"&::-webkit-scrollbar": { display: "none" },
				}}
			>
				{slides.map((img: string, index: number) => (
					<Box
						key={index}
						sx={{
							minWidth: "100%",
							height: "100%",
							scrollSnapAlign: "start",
							position: "relative",
						}}
					>
						<HeroImage
							src={img}
							alt={`${title} - ${index + 1}`}
							priority={index === 0}
						/>
					</Box>
				))}
			</Box>
			{/* Indicators */}
			{slides.length > 1 && (
				<Box
					sx={{
						position: "absolute",
						bottom: 32, // Lifted up to not be covered by the rounded card
						left: 0,
						right: 0,
						display: "flex",
						justifyContent: "center",
						gap: 1,
						zIndex: 10,
					}}
				>
					{slides.map((_: any, index: number) => (
						<Box
							key={index}
							onClick={() => scrollToImage(index)}
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor:
									currentImageIndex === index
										? "white"
										: "rgba(255,255,255,0.5)",
								cursor: "pointer",
								boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
							}}
						/>
					))}
				</Box>
			)}
		</Box>
	);
}
