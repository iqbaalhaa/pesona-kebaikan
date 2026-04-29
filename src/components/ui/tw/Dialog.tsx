"use client";

import { Fragment } from "react";
import {
	Dialog as HDialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl";
}

const widthMap = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
};

export default function Dialog({
	open,
	onClose,
	children,
	maxWidth = "md",
}: DialogProps) {
	return (
		<Transition show={open} as={Fragment}>
			<HDialog onClose={onClose} className="relative z-50">
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-200"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-150"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
				</TransitionChild>

				<div className="fixed inset-0 flex items-center justify-center p-4">
					<TransitionChild
						as={Fragment}
						enter="ease-out duration-200"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-150"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<DialogPanel
							className={`w-full ${widthMap[maxWidth]} rounded-2xl bg-surface p-5 shadow-xl`}
						>
							{children}
						</DialogPanel>
					</TransitionChild>
				</div>
			</HDialog>
		</Transition>
	);
}

export function DialogHeader({
	title,
	onClose,
}: {
	title: string;
	onClose?: () => void;
}) {
	return (
		<div className="mb-3 flex items-center justify-between">
			<DialogTitle className="text-lg font-bold text-foreground">
				{title}
			</DialogTitle>
			{onClose && (
				<button
					onClick={onClose}
					className="rounded-lg p-1 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
				>
					<X size={20} />
				</button>
			)}
		</div>
	);
}

export function DialogBody({ children }: { children: React.ReactNode }) {
	return <div className="text-sm text-foreground/80">{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
	return (
		<div className="mt-4 flex justify-end gap-2">{children}</div>
	);
}
