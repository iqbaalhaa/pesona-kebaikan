interface ChipProps {
	label: string;
	size?: "small" | "medium";
	color?: "default" | "primary" | "success" | "warning" | "error";
	icon?: React.ReactNode;
	onDelete?: () => void;
	onClick?: () => void;
	className?: string;
}

const colorMap = {
	default: "bg-foreground/8 text-foreground",
	primary: "bg-primary/12 text-primary",
	success: "bg-success/12 text-success",
	warning: "bg-warning/12 text-warning",
	error: "bg-error/12 text-error",
};

export default function Chip({
	label,
	size = "medium",
	color = "default",
	icon,
	onDelete,
	onClick,
	className = "",
}: ChipProps) {
	const Tag = onClick ? "button" : "span";
	return (
		<Tag
			onClick={onClick}
			className={[
				"inline-flex items-center gap-1 rounded-full font-bold",
				size === "small" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
				colorMap[color],
				onClick ? "cursor-pointer transition-opacity hover:opacity-80" : "",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{icon}
			{label}
			{onDelete && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
				>
					×
				</button>
			)}
		</Tag>
	);
}
