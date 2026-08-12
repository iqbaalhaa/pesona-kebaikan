/**
 * Neutral "no image" placeholder — used wherever a campaign/banner/cover has
 * no real image (or the real image failed to load), instead of falling back
 * to a generic stock photo file. Pure CSS + inline icon, no image request.
 */
export default function ImagePlaceholder({
	className = "",
	iconClassName = "h-8 w-8",
}: {
	className?: string;
	iconClassName?: string;
}) {
	return (
		<div
			className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className}`}
			aria-hidden="true"
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
				className={iconClassName}
			>
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<circle cx="9" cy="9" r="2" />
				<path d="m21 15-5-5L5 21" />
			</svg>
		</div>
	);
}
