"use client";

import { Box, Typography, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import type { AdminPermission } from "@prisma/client";
import { ALL_ADMIN_PERMISSIONS, PERMISSION_LABELS } from "@/lib/admin-access";

export default function PermissionChecklist({
	value,
	onChange,
}: {
	value: AdminPermission[];
	onChange: (next: AdminPermission[]) => void;
}) {
	const toggle = (perm: AdminPermission) => {
		onChange(
			value.includes(perm) ? value.filter((p) => p !== perm) : [...value, perm],
		);
	};

	return (
		<Box>
			<Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>
				Izin Akses Admin
			</Typography>
			<Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
				Pilih area mana saja yang boleh dikelola pengguna ini.
			</Typography>
			<FormGroup>
				{ALL_ADMIN_PERMISSIONS.map((perm) => (
					<FormControlLabel
						key={perm}
						control={
							<Checkbox
								size="small"
								checked={value.includes(perm)}
								onChange={() => toggle(perm)}
							/>
						}
						label={<Typography sx={{ fontSize: 13.5 }}>{PERMISSION_LABELS[perm]}</Typography>}
					/>
				))}
			</FormGroup>
		</Box>
	);
}
