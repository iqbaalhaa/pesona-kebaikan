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

/**
 * Shape of the `PageContent.data` JSON for key "donation_faq" — the FAQ list
 * shown inside FundDetailsModal's "Rincian Penggunaan Dana" popup. Admin-editable
 * via /admin/faq-donasi (src/actions/cms.ts's getPageContent/updatePageContent).
 * Shared here (rather than duplicated per-file) so the admin editor's initial
 * state and the public modal's fallback-when-unset never drift apart.
 *
 * A list of questions, each with one or more answer "items" — most questions
 * need just one item (label left blank), but an item list lets a question
 * carry multiple conditional answers (e.g. one answer for campaigns run by
 * Pesona Kebaikan/mitra, another for individual fundraisers) without forcing
 * that split into separately-worded questions.
 */
export interface DonationFaqItem {
	label: string;
	text: string;
}

export interface DonationFaq {
	question: string;
	items: DonationFaqItem[];
}

export interface DonationFaqData {
	faqs: DonationFaq[];
}

export const DEFAULT_DONATION_FAQ: DonationFaqData = {
	faqs: [
		{
			question:
				"Bagaimana jika donasi terkumpul melebihi target Rencana Penggunaan Dana",
			items: [
				{
					label: "Galang Dana Pesona Kebaikan/mitra Pesona Kebaikan",
					text: "Kelebihan donasi dari target Rencana Penggunaan Dana akan disalurkan ke banyak penerima manfaat, dengan persetujuan penerima manfaat utama.",
				},
				{
					label: "Galang dana individu",
					text: "Berapa pun donasi terkumpul akan disalurkan seluruhnya ke penerima manfaat.",
				},
			],
		},
	],
};

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
