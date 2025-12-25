import ReportList from "@/components/admin/ReportList";
import { Box } from "@mui/material";

export const metadata = {
	title: "Pusat Pengaduan - Admin Pesona Kebaikan",
};

export default function AdminReportsPage() {
	return (
		<Box sx={{ p: 3 }}>
			<ReportList />
		</Box>
	);
}
