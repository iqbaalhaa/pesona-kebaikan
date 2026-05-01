"use client";

import * as React from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
	label?: string;
	error?: string;
	helperText?: string;
	startAdornment?: React.ReactNode;
	endAdornment?: React.ReactNode;
	fullWidth?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	helperText?: string;
	fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ label, error, helperText, startAdornment, endAdornment, fullWidth = true, className = "", ...props }, ref) => {
		const id = React.useId();

		return (
			<div className={fullWidth ? "w-full" : ""}>
				{label && (
					<label htmlFor={id} className="mb-1 block text-[13px] font-medium text-slate-600">
						{label}
					</label>
				)}
				<div className="relative">
					{startAdornment && (
						<div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">
							{startAdornment}
						</div>
					)}
					<input
						ref={ref}
						id={id}
						className={[
							"h-10 w-full rounded-xl border bg-white px-3 text-[14px] text-foreground outline-none transition-all",
							"placeholder:text-slate-400 placeholder:text-[13px]",
							"focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white",
							"hover:border-slate-300",
							error ? "border-red-400" : "border-slate-200",
							startAdornment ? "pl-9" : "",
							endAdornment ? "pr-9" : "",
							className,
						].join(" ")}
						{...props}
					/>
					{endAdornment && (
						<div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
							{endAdornment}
						</div>
					)}
				</div>
				{(error || helperText) && (
					<p className={`mt-1 text-[11px] ${error ? "text-red-500" : "text-slate-400"}`}>
						{error || helperText}
					</p>
				)}
			</div>
		);
	}
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ label, error, helperText, fullWidth = true, className = "", ...props }, ref) => {
		const id = React.useId();

		return (
			<div className={fullWidth ? "w-full" : ""}>
				{label && (
					<label htmlFor={id} className="mb-1 block text-[13px] font-medium text-slate-600">
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={id}
					className={[
						"w-full rounded-xl border bg-white px-3 py-2.5 text-[14px] text-foreground outline-none transition-all resize-none",
						"placeholder:text-slate-400 placeholder:text-[13px]",
						"focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white",
						"hover:border-slate-300",
						error ? "border-red-400" : "border-slate-200",
						className,
					].join(" ")}
					{...props}
				/>
				{(error || helperText) && (
					<p className={`mt-1 text-[11px] ${error ? "text-red-500" : "text-slate-400"}`}>
						{error || helperText}
					</p>
				)}
			</div>
		);
	}
);
Textarea.displayName = "Textarea";
