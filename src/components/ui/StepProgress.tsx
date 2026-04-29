"use client";

import { Check } from "lucide-react";

interface Step {
	key: string;
	label: string;
}

interface StepProgressProps {
	steps: Step[];
	current: number;
	onStepClick?: (index: number) => void;
	canNavigate?: (index: number) => boolean;
}

export default function StepProgress({
	steps,
	current,
	onStepClick,
	canNavigate,
}: StepProgressProps) {
	const progress = ((current + 1) / steps.length) * 100;

	return (
		<div className="px-4 pb-4 pt-4">
			{/* Step counter */}
			<div className="mb-3 flex items-center justify-between">
				<p className="text-sm font-bold text-foreground">
					Langkah {current + 1} dari {steps.length}
				</p>
				<p className="text-xs font-semibold text-primary">
					{steps[current]?.label}
				</p>
			</div>

			{/* Progress bar */}
			<div className="mb-4 h-2 overflow-hidden rounded-full bg-foreground/8">
				<div
					className="h-full rounded-full bg-primary transition-all duration-300"
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Step dots */}
			<div className="flex items-center justify-between">
				{steps.map((step, i) => {
					const isActive = i === current;
					const isDone = i < current;
					const isFuture = i > current;
					const clickable =
						onStepClick && canNavigate ? canNavigate(i) : false;

					return (
						<button
							key={step.key}
							onClick={() => clickable && onStepClick?.(i)}
							disabled={!clickable}
							className={[
								"flex flex-col items-center gap-1.5 transition-all",
								clickable ? "cursor-pointer" : "cursor-default",
								isFuture ? "opacity-40" : "opacity-100",
							].join(" ")}
							title={step.label}
						>
							<span
								className={[
									"grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-all",
									isActive
										? "bg-primary text-white shadow-[0_0_0_4px_rgba(11,169,118,0.15)]"
										: isDone
											? "bg-primary/15 text-primary"
											: "bg-foreground/8 text-foreground/40",
								].join(" ")}
							>
								{isDone ? <Check size={14} /> : i + 1}
							</span>
							<span
								className={[
									"hidden text-[10px] font-semibold leading-tight sm:block",
									isActive
										? "text-primary"
										: isDone
											? "text-foreground/60"
											: "text-foreground/30",
								].join(" ")}
							>
								{step.label}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
