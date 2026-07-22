"use client";

import { useState, useTransition } from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { updateNotifyKeys } from "@/actions/settings";

interface Props {
	showPilihan: boolean;
	showMendesak: boolean;
}

export default function HomeVisibilityForm({ showPilihan, showMendesak }: Props) {
	const [pilihan, setPilihan] = useState(showPilihan);
	const [mendesak, setMendesak] = useState(showMendesak);
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	function save(newPilihan: boolean, newMendesak: boolean) {
		setMessage(null);
		startTransition(async () => {
			const result = await updateNotifyKeys([
				{ key: "home_show_pilihan", value: newPilihan ? "true" : "false", name: "Tampilkan Pilihan Pesona" },
				{ key: "home_show_mendesak", value: newMendesak ? "true" : "false", name: "Tampilkan Mendesak & Darurat" },
			]);
			if (result.error) {
				setMessage({ type: "error", text: result.error });
			} else {
				setMessage({ type: "success", text: "Pengaturan berhasil disimpan" });
			}
		});
	}

	function handlePilihan(checked: boolean) {
		setPilihan(checked);
		save(checked, mendesak);
	}

	function handleMendesak(checked: boolean) {
		setMendesak(checked);
		save(pilihan, checked);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between py-2 border-b border-gray-100">
				<div>
					<p className="text-sm font-medium text-gray-800">Pilihan Pesona</p>
					<p className="text-xs text-gray-500">Section kampanye unggulan / featured di beranda</p>
				</div>
				<FormControlLabel
					control={
						<Switch
							checked={pilihan}
							onChange={(e) => handlePilihan(e.target.checked)}
							disabled={isPending}
							color="success"
						/>
					}
					label=""
					sx={{ m: 0 }}
				/>
			</div>

			<div className="flex items-center justify-between py-2">
				<div>
					<p className="text-sm font-medium text-gray-800">Mendesak & Darurat</p>
					<p className="text-xs text-gray-500">Section kampanye mendesak / urgent di beranda</p>
				</div>
				<FormControlLabel
					control={
						<Switch
							checked={mendesak}
							onChange={(e) => handleMendesak(e.target.checked)}
							disabled={isPending}
							color="success"
						/>
					}
					label=""
					sx={{ m: 0 }}
				/>
			</div>

			{isPending && (
				<div className="flex items-center gap-2 text-sm text-gray-500">
					<CircularProgress size={14} />
					<span>Menyimpan...</span>
				</div>
			)}

			{message && !isPending && (
				<Alert severity={message.type} onClose={() => setMessage(null)} sx={{ py: 0.5 }}>
					{message.text}
				</Alert>
			)}
		</div>
	);
}
