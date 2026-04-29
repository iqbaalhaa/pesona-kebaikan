export default function PageContainer({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`px-2 pb-6 pt-2.5 ${className}`}>{children}</div>
	);
}
