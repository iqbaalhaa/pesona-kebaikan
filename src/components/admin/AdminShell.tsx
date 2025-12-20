"use client";

import React from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminShell({
	children,
}: {
	children: React.ReactNode;
}) {
	const [mobileOpen, setMobileOpen] = React.useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	return (
		<div
			className="min-h-[100lvh] w-full bg-gradient-to-br from-primary/[0.15] to-[#F6F8FC] dark:from-primary/[0.05] dark:to-[#0b1220] transition-colors duration-300"
			style={
				{
					["--radius" as any]: "16px",
				} as React.CSSProperties
			}
		>
			<div className="mx-auto w-full max-w-[1400px] px-3 py-4 lg:px-6 lg:py-6">
				<div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[300px_1fr]">
					{/* Sidebar */}
					<AdminSidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />

					{/* Main */}
					<div className="space-y-4">
						<AdminHeader onMobileToggle={handleDrawerToggle} />
						<main>{children}</main>
					</div>
				</div>
			</div>
		</div>
	);
}
