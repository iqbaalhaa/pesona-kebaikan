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
					<div className="mt-2 flex justify-center gap-1.5">
						{items.map((_, i) => (
							<button
								key={i}
								onClick={() => setCurrent(i)}
								className={`h-2 rounded-full transition-all ${
									i === current
										? "w-5 bg-primary"
										: "w-2 bg-slate-300"
								}`}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
