import { auth } from "@/auth";
import { getNotifyKey, getNotifyKeys } from "@/actions/settings";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";
import EmailSettingsForm from "./EmailSettingsForm";

export default async function SettingsPage() {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		redirect("/auth/login");
	}

	// Fetch existing key (e.g., 'whatsapp_client_id')
	const notifyKey = await getNotifyKey("whatsapp_client_id");
	const secretKey = await getNotifyKey("whatsapp_secret_key");

	// Fetch Email Settings
	const emailKeys = await getNotifyKeys([
		"email_sender",
		"email_app_password",
		"email_verification_subject",
		"email_verification_content",
	]);

	const getVal = (key: string) => emailKeys.find((k) => k.key === key)?.value;

	const defaultContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Kode Verifikasi Email</h2>
        <p>Terima kasih telah mendaftar di Pesona Kebaikan. Berikut adalah kode OTP verifikasi Anda:</p>
        <div style="padding: 15px; background-color: #f0fdf4; border: 1px solid #61ce70; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #166534; margin: 20px 0;">
          {{token}}
        </div>
        <p>Kode ini akan kedaluwarsa dalam 1 jam.</p>
        <p>Jika Anda tidak merasa meminta kode ini, silakan abaikan email ini.</p>
      </div>
  `.trim();

	const emailSettings = {
		email_sender:
			getVal("email_sender") ??
			(process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || ""),
		email_app_password:
			getVal("email_app_password") ?? (process.env.EMAIL_SERVER_PASSWORD || ""),
		email_verification_subject:
			getVal("email_verification_subject") ??
			"Kode Verifikasi Email - Pesona Kebaikan",
		email_verification_content:
			getVal("email_verification_content") ?? defaultContent,
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h1>

			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
				<h2 className="text-lg font-semibold mb-4">Notifikasi WhatsApp</h2>
				<p className="text-sm text-gray-500 mb-6">
					Konfigurasi Client ID untuk layanan notifikasi WhatsApp gateway.
				</p>

				<SettingsForm
					initialKey="whatsapp_client_id"
					initialValue={notifyKey?.value || ""}
					initialName={notifyKey?.name || "WhatsApp Gateway Client ID"}
					label="WhatsApp Client ID"
					placeholder="Masukkan Client ID (UUID)"
				/>

				<div className="my-4"></div>

				<SettingsForm
					initialKey="whatsapp_secret_key"
					initialValue={secretKey?.value || ""}
					initialName={secretKey?.name || "WhatsApp Gateway Secret Key"}
					label="WhatsApp Secret Key"
					placeholder="Masukkan Secret Key"
				/>
			</div>

			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
				<h2 className="text-lg font-semibold mb-4">Pengaturan Email</h2>
				<p className="text-sm text-gray-500 mb-6">
					Konfigurasi pengirim email, password aplikasi (SMTP), subjek, dan
					template isi email verifikasi.
				</p>

				<EmailSettingsForm initialSettings={emailSettings} />
			</div>
		</div>
	);
}
