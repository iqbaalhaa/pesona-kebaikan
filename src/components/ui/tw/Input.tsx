import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: boolean;
	helperText?: string;
	fullWidth?: boolean;
	startAdornment?: React.ReactNode;
	endAdornment?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			error,
			helperText,
			fullWidth,
			startAdornment,
			endAdornment,
			className = "",
			id,
			...props
		},
		ref,
	) => {
		const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

		return (
			<div className={fullWidth ? "w-full" : ""}>
				{label && (
					<label
						htmlFor={inputId}
						className="mb-1 block text-sm font-semibold text-foreground/70"
					>
						{label}
					</label>
				)}
				<div className="relative flex items-center">
					{startAdornment && (
						<span className="pointer-events-none absolute left-3 text-foreground/40">
							{startAdornment}
						</span>
					)}
					<input
						ref={ref}
						id={inputId}
						className={[
							"w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors",
							"placeholder:text-foreground/40",
							"focus:border-primary focus:ring-2 focus:ring-primary/20",
							error
								? "border-error focus:border-error focus:ring-error/20"
								: "border-divider",
							startAdornment ? "pl-10" : "",
							endAdornment ? "pr-10" : "",
							className,
						]
							.filter(Boolean)
							.join(" ")}
						{...props}
					/>
					{endAdornment && (
						<span className="absolute right-3 text-foreground/40">
							{endAdornment}
						</span>
					)}
				</div>
				{helperText && (
					<p
						className={`mt-1 text-xs ${error ? "text-error" : "text-foreground/50"}`}
					>
						{helperText}
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";
export default Input;
