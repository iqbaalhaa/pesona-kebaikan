"use client";

import * as React from "react";
import Link from "next/link";

export interface BannerItem {
	id: string;
	image: string;
	title?: string;
	link?: string;
}

export default function BannerSection({ items }: { items: BannerItem[] }) {
	const [current, setCurrent] = React.useState(0);
	const timerRef = React.useRef<ReturnType<typeof setInterval>>(null);

	React.useEffect(() => {
		if (items.length <= 1) return;
		timerRef.current = setInterval(() => {
			setCurrent((prev) => (prev + 1) % items.length);
		}, 4000);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [items.length]);

	if (items.length === 0) return null;

	const Wrapper = items[current]?.link ? Link : "div";
	const wrapperProps = items[current]?.link
		? { href: items[current].link! }
		: {};

	return (
		<div className="mt-7 px-4">
			<div className="mb-3 flex items-center gap-1.5">
				<div className="h-6 w-1 rounded bg-primary" />
				<h3 className="text-[15px] font-black tracking-tight text-foreground">
					Yang Baru di Pesona Kebaikan
				</h3>
			</div>

			<div className="relative overflow-hidden rounded-2xl">
				<div
					className="flex transition-transform duration-500 ease-out"
					style={{ transform: `translateX(-${current * 100}%)` }}
				>
					{items.map((item) => {
						const Inner = item.link ? Link : "div";
						const innerProps = item.link ? { href: item.link } : {};
						return (
							<div key={item.id} className="w-full shrink-0">
								<Inner
									{...(innerProps as any)}
									className="block"
								>
									<img
										src={item.image}
										alt={item.title || "Banner"}
										className="aspect-[2/1] w-full rounded-2xl object-cover"
									/>
								</Inner>
							</div>
						);
					})}
				</div>

				{items.length > 1 && (
					<>
						<button
							onClick={() => setCurrent((p) => (p - 1 + items.length) % items.length)}
							aria-label="Slide sebelumnya"
							className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 active:scale-95"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>
						<button
							onClick={() => setCurrent((p) => (p + 1) % items.length)}
							aria-label="Slide berikutnya"
							className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 active:scale-95"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
						<div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
							{items.map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrent(i)}
									aria-label={`Ke slide ${i + 1}`}
									className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
