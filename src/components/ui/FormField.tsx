"use client";

import * as React from "react";

interface FormFieldProps {
	label: string;
	required?: boolean;
	error?: boolean;
	errorText?: string;
	children: React.ReactNode;
	className?: string;
}

export default function FormField({
	label,
	required = false,
	error = false,
	errorText,
	children,
	className = "",
}: FormFieldProps) {
	return (
		<div className={className}>
			<p className="mb-1 text-sm font-semibold text-foreground">
				{label}
				{required && <span className="ml-0.5 text-red-500">*</span>}
			</p>
			<div
				className={[
					"[&_input]:border [&_input]:rounded-xl [&_input]:transition-colors",
					"[&_textarea]:border [&_textarea]:rounded-xl [&_textarea]:transition-colors",
					"[&_.MuiOutlinedInput-root]:transition-colors",
					error
						? "[&_input]:!border-red-400 [&_textarea]:!border-red-400 [&_.MuiOutlinedInput-notchedOutline]:!border-red-400"
						: "",
				].join(" ")}
			>
				{children}
			</div>
			{error && errorText && (
				<p className="mt-1 text-xs text-red-500">{errorText}</p>
			)}
		</div>
	);
}
