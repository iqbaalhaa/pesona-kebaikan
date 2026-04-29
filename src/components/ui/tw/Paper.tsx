import { forwardRef } from "react";

interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "elevation" | "outlined";
}

const Paper = forwardRef<HTMLDivElement, PaperProps>(
	({ variant = "elevation", className = "", children, ...props }, ref) => {
		const base =
			variant === "outlined"
				? "rounded-2xl border border-divider bg-surface"
				: "rounded-2xl bg-surface shadow-sm";

		return (
			<div ref={ref} className={`${base} ${className}`} {...props}>
				{children}
			</div>
		);
	},
);

Paper.displayName = "Paper";
export default Paper;
