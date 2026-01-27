"use client";

import { useState } from "react";
import { updateNotifyKey } from "@/actions/settings";
import { Button, TextField, Alert, CircularProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

interface SettingsFormProps {
	initialKey: string;
	initialValue: string;
	initialName: string;
	label?: string;
	placeholder?: string;
	type?: string;
}

export default function SettingsForm({
	initialKey,
	initialValue,
	initialName,
	label = "Client ID / Secret Key",
	placeholder = "Masukkan key disini...",
	type = "password",
}: SettingsFormProps) {
	const [value, setValue] = useState(initialValue);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);

		const res = await updateNotifyKey(initialKey, value, initialName);

		if (res.error) {
			setMessage({ type: "error", text: res.error });
		} else {
			setMessage({ type: "success", text: "Pengaturan berhasil disimpan" });
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-md">
			{message && (
				<Alert severity={message.type} onClose={() => setMessage(null)}>
					{message.text}
				</Alert>
			)}

			<div className="space-y-4">
				<TextField
					fullWidth
					label={label}
					variant="outlined"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={placeholder}
					type={type}
					disabled={loading}
					helperText={`Konfigurasi untuk ${initialName}`}
				/>

				<div className="flex justify-end">
					<Button
						type="submit"
						variant="contained"
						color="primary"
						startIcon={
							loading ? (
								<CircularProgress size={20} color="inherit" />
							) : (
								<SaveIcon />
							)
						}
						disabled={loading}
					>
						{loading ? "Menyimpan..." : "Simpan Perubahan"}
					</Button>
				</div>
			</div>
		</form>
	);
}
