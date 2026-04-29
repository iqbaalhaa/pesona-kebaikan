"use client";

import * as React from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
	id: string;
	title: string;
	subtitle?: string;
	image?: string;
}

interface SearchDropdownProps {
	placeholder?: string;
	onSearch: (query: string) => Promise<SearchResult[]>;
	onSelect: (result: SearchResult) => void;
	onSubmit?: (query: string) => void;
	debounceMs?: number;
	minChars?: number;
	overlay?: boolean;
}

export default function SearchDropdown({
	placeholder = "Cari...",
	onSearch,
	onSelect,
	onSubmit,
	debounceMs = 500,
	minChars = 3,
	overlay = false,
}: SearchDropdownProps) {
	const [query, setQuery] = React.useState("");
	const [results, setResults] = React.useState<SearchResult[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [open, setOpen] = React.useState(false);
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.length >= minChars) {
				setLoading(true);
				setOpen(true);
				try {
					const res = await onSearch(query);
					setResults(res);
				} catch {
					setResults([]);
				} finally {
					setLoading(false);
				}
			} else {
				setResults([]);
				setOpen(false);
			}
		}, debounceMs);
		return () => clearTimeout(timer);
	}, [query, minChars, debounceMs, onSearch]);

	React.useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const inputClasses = overlay
		? "bg-white/14 border-white/28 text-white placeholder:text-white/70 focus:border-primary"
		: "bg-foreground/4 border-transparent text-foreground placeholder:text-foreground/50 focus:border-primary";

	const dropdownBg = overlay
		? "bg-[rgba(20,20,20,0.85)] backdrop-blur-xl border border-white/10"
		: "bg-surface shadow-lg";

	return (
		<div ref={containerRef} className="relative flex-1 min-w-0">
			<div className="relative">
				<Search
					size={18}
					className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${overlay ? "text-white/90" : "text-foreground/40"}`}
					strokeWidth={2.5}
				/>
				<input
					type="search"
					aria-label={placeholder}
					role="combobox"
					aria-expanded={open}
					aria-autocomplete="list"
					placeholder={placeholder}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => { if (query.length >= minChars) setOpen(true); }}
					onKeyDown={(e) => {
						if (e.key === "Enter" && onSubmit) {
							onSubmit(query);
							setOpen(false);
						}
					}}
					className={`h-10 w-full rounded-xl border pl-10 pr-3 text-[13px] outline-none backdrop-blur-lg transition-colors ${inputClasses}`}
				/>
			</div>

			{open && (query.length >= minChars || results.length > 0) && (
				<div className={`fixed left-0 right-0 top-[72px] z-[1200] max-h-[400px] overflow-y-auto rounded-lg ${dropdownBg}`}>
					{loading ? (
						<div className="flex justify-center p-2">
							<Loader2 size={24} className={`animate-spin ${overlay ? "text-white" : "text-primary"}`} />
						</div>
					) : results.length > 0 ? (
						<>
							{results.map((r) => (
								<button
									key={r.id}
									onClick={() => { onSelect(r); setOpen(false); }}
									className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${overlay ? "hover:bg-white/8" : "hover:bg-foreground/4"}`}
								>
									{r.image && (
										<img src={r.image} alt={r.title} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
									)}
									<div className="min-w-0 flex-1">
										<p className={`line-clamp-2 text-sm font-bold leading-tight ${overlay ? "text-white" : "text-foreground"}`}>
											{r.title}
										</p>
										{r.subtitle && (
											<p className={`text-xs ${overlay ? "text-white/70" : "text-foreground/50"}`}>
												{r.subtitle}
											</p>
										)}
									</div>
								</button>
							))}
							{onSubmit && (
								<>
									<hr className={overlay ? "border-white/10" : "border-divider"} />
									<button
										onClick={() => { onSubmit(query); setOpen(false); }}
										className="w-full py-2.5 text-center text-sm font-bold text-primary"
									>
										Lihat semua hasil
									</button>
								</>
							)}
						</>
					) : (
						<div className="p-3 text-center">
							<p className={`text-sm ${overlay ? "text-white/70" : "text-foreground/50"}`}>
								Tidak ditemukan hasil untuk &ldquo;{query}&rdquo;
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
