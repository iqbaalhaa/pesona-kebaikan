import type { NotificationType } from "@prisma/client";

/**
 * Notification types that represent "admin/staff action needed" — these are
 * the ones surfaced in the admin panel bell (AdminHeader). They never show
 * up in the public-facing notification popover (NotificationPopover), which
 * only renders the KABAR/PESAN tabs, so admins never see internal review
 * alerts leak into their own donor-facing notification list.
 */
export const ADMIN_NOTIFICATION_TYPES: NotificationType[] = [
	"NEW_CAMPAIGN",
	"WITHDRAWAL_REQUEST",
	"VERIFICATION_REQUEST",
	"CAMPAIGN_CHANGE_REQUEST",
];

export const CATEGORY_TITLE: Record<string, string> = {
	pendidikan: "Bantuan Pendidikan",
	bencana: "Bencana Alam",
	"bencana-alam": "Bencana Alam",
	bencana_alam: "Bencana Alam",
	difabel: "Difabel",
	infrastruktur: "Infrastruktur Umum",
	usaha: "Karya Kreatif & Modal Usaha",
	sosial: "Kegiatan Sosial",
	kemanusiaan: "Kemanusiaan",
	lingkungan: "Lingkungan",
	rumah_ibadah: "Rumah Ibadah",
	"rumah-ibadah": "Rumah Ibadah",
	medis: "Bantuan Medis & Kesehatan",
};
