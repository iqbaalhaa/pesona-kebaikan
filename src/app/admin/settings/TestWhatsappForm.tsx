"use client";

import { useState } from "react";
import { sendTestWhatsapp } from "@/actions/test-wa";
import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export default function TestWhatsappForm() {
	const [phone, setPhone] = useState("");
	const [message, setMessage] = useState("Tes notifikasi WhatsApp dari Pesona Kebaikan.");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setResult(null);

		const res = await sendTestWhatsapp(phone, message);

		if (res.success) {
			setResult({ type: "success", text: "Pesan tes berhasil dikirim." });
		} else {
			setResult({ type: "error", text: res.error || "Gagal mengirim pesan tes." });
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-md">
			{result && (
				<Alert severity={result.type} onClose={() => setResult(null)}>
					{result.text}
				</Alert>
			)}

			<TextField
				fullWidth
				label="Nomor Tujuan"
				variant="outlined"
				value={phone}
				onChange={(e) => setPhone(e.target.value)}
				placeholder="08xxxxxxxxxx"
				disabled={loading}
				helperText="Kirim pesan tes untuk verifikasi konfigurasi"
			/>

			<TextField
				fullWidth
				label="Pesan"
				variant="outlined"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				multiline
				minRows={2}
				disabled={loading}
			/>

			<div className="flex justify-end">
				<Button
					type="submit"
					variant="outlined"
					color="primary"
					startIcon={
						loading ? (
							<CircularProgress size={20} color="inherit" />
						) : (
							<SendIcon />
						)
					}
					disabled={loading || !phone}
				>
					{loading ? "Mengirim..." : "Kirim Tes"}
				</Button>
			</div>
		</form>
	);
}
