interface CategoryPillProps {
	label: string;
	onClick?: (e: React.MouseEvent) => void;
	variant?: "default" | "overlay";
}

export default function CategoryPill({ label, onClick, variant = "default" }: CategoryPillProps) {
	const base = "inline-block rounded-md px-1.5 py-px text-[10px] font-bold leading-normal";
	const styles = variant === "overlay"
		? `${base} bg-white/92 text-foreground backdrop-blur-lg`
		: `${base} bg-primary/10 text-primary`;

	if (onClick) {
		return (
			<button type="button" onClick={onClick} className={`${styles} cursor-pointer`}>
				{label}
			</button>
		);
	}

	return <span className={styles}>{label}</span>;
}
