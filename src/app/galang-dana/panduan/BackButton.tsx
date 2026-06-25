"use client";

import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

export default function BackButton() {
	const router = useRouter();

	return (
		<IconButton
			onClick={() => {
				if (window.history.length > 1) {
					router.back();
					return;
				}
				router.push("/galang-dana");
			}}
			edge="start"
			aria-label="Kembali"
			sx={{ color: "text.primary" }}
		>
			<ArrowBackIosNewRoundedIcon fontSize="small" />
		</IconButton>
	);
}
