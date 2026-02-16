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

	const applicationIdKey =
		(await getNotifyKey("whatsapp_application_id")) ||
		(await getNotifyKey("whatsapp_client_id"));
	const applicationSecretKey =
		(await getNotifyKey("whatsapp_application_secret")) ||
		(await getNotifyKey("whatsapp_secret_key"));

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
        <div style="padding: 15px; background-color: #f0fdf4; border: 1px solid #0ba976; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #166534; margin: 20px 0;">
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
					Konfigurasi Application ID dan Application Secret untuk layanan
					notifikasi WhatsApp gateway.
				</p>

				<SettingsForm
					initialKey="whatsapp_application_id"
					initialValue={applicationIdKey?.value || ""}
					initialName={applicationIdKey?.name || "WhatsApp Application ID"}
					label="WhatsApp Application ID"
					placeholder="Masukkan Application ID"
				/>

				<div className="my-4"></div>

				<SettingsForm
					initialKey="whatsapp_application_secret"
					initialValue={applicationSecretKey?.value || ""}
					initialName={
						applicationSecretKey?.name || "WhatsApp Application Secret"
					}
					label="WhatsApp Application Secret"
					placeholder="Masukkan Application Secret"
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
