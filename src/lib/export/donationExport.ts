import type { TxRow } from "@/app/admin/campaign/[id]/_components/shared";
import { idr, methodLabel, statusMeta } from "@/app/admin/campaign/[id]/_components/shared";

function sanitizeFilename(name: string) {
	return name.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
}

function toExportRows(rows: TxRow[]) {
	return rows.map((r) => ({
		Nama: r.donorName,
		"No. HP": r.donorPhone || "-",
		Email: r.donorEmail || "-",
		Jumlah: idr(r.amount),
		Tanggal: r.createdAt,
		Metode: methodLabel(r.method),
		Status: statusMeta(r.status).label,
		Pesan: r.message || "-",
		"Izin Dihubungi": r.allowContact ? "Ya" : "Tidak",
		Anonim: r.isAnonymous ? "Ya" : "Tidak",
		Akun: r.account ? "Terdaftar" : "Tamu",
	}));
}

export async function exportDonorsToPDF(rows: TxRow[], campaignTitle: string) {
	const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
		import("jspdf"),
		import("jspdf-autotable"),
	]);

	const doc = new jsPDF({ orientation: "landscape" });
	const pageWidth = doc.internal.pageSize.width;
	doc.setFontSize(18);
	doc.setFont("helvetica", "bold");
	doc.text("PESONA KEBAIKAN", pageWidth / 2, 15, { align: "center" });
	doc.setFontSize(10);
	doc.setFont("helvetica", "italic");
	doc.text('"Menebar Kebaikan, Menuai Keberkahan"', pageWidth / 2, 22, {
		align: "center",
	});
	doc.setLineWidth(0.5);
	doc.line(15, 25, pageWidth - 15, 25);
	doc.setFontSize(14);
	doc.setFont("helvetica", "bold");
	doc.text(`Data Donatur — ${campaignTitle}`, pageWidth / 2, 35, {
		align: "center",
	});

	const exportRows = toExportRows(rows);
	autoTable(doc, {
		head: [Object.keys(exportRows[0] || {})],
		body: exportRows.map((r) => Object.values(r)),
		startY: 40,
		styles: { fontSize: 8 },
		headStyles: { fillColor: [11, 169, 118], halign: "center" },
	});

	const finalY = (doc as any).lastAutoTable?.finalY || 40;
	doc.setFontSize(9);
	doc.text(
		`Dicetak: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} • Total: ${rows.length} donasi`,
		15,
		finalY + 10,
	);

	doc.save(`donatur_${sanitizeFilename(campaignTitle)}.pdf`);
}

export async function exportDonorsToCSV(rows: TxRow[], campaignTitle: string) {
	const XLSX = await import("xlsx");
	const ws = XLSX.utils.json_to_sheet(toExportRows(rows));
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Donatur");
	XLSX.writeFile(wb, `donatur_${sanitizeFilename(campaignTitle)}.csv`, {
		bookType: "csv",
	});
}
