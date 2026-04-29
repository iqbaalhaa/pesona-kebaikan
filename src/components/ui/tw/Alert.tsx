import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

type Severity = "success" | "error" | "warning" | "info";

interface AlertProps {
	severity?: Severity;
	children: React.ReactNode;
	onClose?: () => void;
	className?: string;
}

const config: Record<
	Severity,
	{ bg: string; border: string; text: string; icon: React.ReactNode }
> = {
	success: {
		bg: "bg-success/8",
		border: "border-success/20",
		text: "text-success",
		icon: <CheckCircle size={18} />,
	},
	error: {
		bg: "bg-error/8",
		border: "border-error/20",
		text: "text-error",
		icon: <AlertCircle size={18} />,
	},
	warning: {
		bg: "bg-warning/8",
		border: "border-warning/20",
		text: "text-warning",
		icon: <AlertTriangle size={18} />,
	},
	info: {
		bg: "bg-info/8",
		border: "border-info/20",
		text: "text-info",
		icon: <Info size={18} />,
	},
};

export default function Alert({
	severity = "info",
	children,
	onClose,
	className = "",
}: AlertProps) {
	const c = config[severity];
	return (
		<div
			className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${c.bg} ${c.border} ${className}`}
		>
			<span className={`mt-0.5 shrink-0 ${c.text}`}>{c.icon}</span>
			<div className="flex-1 text-foreground/80">{children}</div>
			{onClose && (
				<button
					onClick={onClose}
					className="shrink-0 rounded p-0.5 text-foreground/40 hover:text-foreground/70"
				>
					×
				</button>
			)}
		</div>
	);
}
