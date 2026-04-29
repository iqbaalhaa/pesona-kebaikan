import { forwardRef } from "react";
import Link from "next/link";

type ButtonVariant = "contained" | "outlined" | "text";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	href?: string;
	fullWidth?: boolean;
	startIcon?: React.ReactNode;
	endIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
	contained:
		"bg-primary text-white hover:bg-primary-dark shadow-sm active:shadow-none",
	outlined:
		"border border-primary text-primary hover:bg-primary/5 active:bg-primary/10",
	text: "text-primary hover:bg-primary/5 active:bg-primary/10",
};

const sizeClasses: Record<ButtonSize, string> = {
	small: "px-3 py-1.5 text-xs",
	medium: "px-4 py-2 text-sm",
	large: "px-6 py-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "contained",
			size = "medium",
			href,
			fullWidth,
			startIcon,
			endIcon,
			className = "",
			children,
			disabled,
			...props
		},
		ref,
	) => {
		const classes = [
			"inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-150",
			"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
			variantClasses[variant],
			sizeClasses[size],
			fullWidth ? "w-full" : "",
			disabled ? "opacity-40 pointer-events-none" : "cursor-pointer",
			className,
		]
			.filter(Boolean)
			.join(" ");

		if (href && !disabled) {
			return (
				<Link href={href} className={classes}>
					{startIcon}
					{children}
					{endIcon}
				</Link>
			);
		}

		return (
			<button ref={ref} className={classes} disabled={disabled} {...props}>
				{startIcon}
				{children}
				{endIcon}
			</button>
		);
	},
);

Button.displayName = "Button";
export default Button;
