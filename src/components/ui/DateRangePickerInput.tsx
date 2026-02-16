"use client";

import React, { useState } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import { format } from "date-fns";
import { Box, TextField, Popover, Button, Stack } from "@mui/material";
import "react-datepicker/dist/react-datepicker.css";

// Register locale
registerLocale("id", id);

interface DateRangePickerInputProps {
	start: string | null;
	end: string | null;
	onChange: (start: string | null, end: string | null) => void;
	label?: string;
}

export default function DateRangePickerInput({
	start,
	end,
	onChange,
	label = "Rentang Tanggal",
}: DateRangePickerInputProps) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [tempStart, setTempStart] = useState<Date | null>(
		start ? new Date(start) : null,
	);
	const [tempEnd, setTempEnd] = useState<Date | null>(
		end ? new Date(end) : null,
	);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
		// Reset temp state to current props when opening
		setTempStart(start ? new Date(start) : null);
		setTempEnd(end ? new Date(end) : null);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleApply = () => {
		onChange(
			tempStart ? format(tempStart, "yyyy-MM-dd") : null,
			tempEnd ? format(tempEnd, "yyyy-MM-dd") : null,
		);
		handleClose();
	};

	const handleDateChange = (dates: [Date | null, Date | null]) => {
		const [newStart, newEnd] = dates;
		setTempStart(newStart);
		setTempEnd(newEnd);
	};

	// Format display value
	let displayValue = "";
	if (start && end) {
		displayValue = `${format(new Date(start), "dd/MM/yyyy")} - ${format(
			new Date(end),
			"dd/MM/yyyy",
		)}`;
	} else if (start) {
		displayValue = `${format(new Date(start), "dd/MM/yyyy")} - ...`;
	} else if (end) {
		displayValue = `... - ${format(new Date(end), "dd/MM/yyyy")}`;
	}

	const open = Boolean(anchorEl);

	return (
		<Box>
			<TextField
				label={label}
				value={displayValue}
				onClick={handleClick}
				fullWidth
				size="small"
				placeholder="Pilih rentang tanggal"
				InputProps={{
					readOnly: true,
				}}
				sx={{
					"& .MuiInputBase-input": { fontSize: 13.5, cursor: "pointer" },
					"& .MuiInputLabel-root": { fontSize: 13.5 },
					"& .MuiInputBase-root": { cursor: "pointer" },
				}}
			/>
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
			>
				<Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
					{/* Custom styling overrides for react-datepicker */}
					<style>{`
            .react-datepicker {
              font-family: inherit;
              border: none;
              font-size: 0.9rem;
            }
            .react-datepicker__header {
              background-color: white;
              border-bottom: none;
              padding-top: 10px;
            }
            .react-datepicker__current-month {
              font-weight: 600;
              margin-bottom: 10px;
            }
            .react-datepicker__day-name {
              color: #666;
            }
            .react-datepicker__day--selected, 
            .react-datepicker__day--in-selecting-range, 
            .react-datepicker__day--in-range {
              background-color: #1976d2 !important;
              color: white !important;
            }
            .react-datepicker__day--keyboard-selected {
              background-color: #bbdefb !important;
              color: black !important;
            }
            .react-datepicker__triangle {
              display: none;
            }
            .react-datepicker__month-container {
              padding: 0 10px;
            }
          `}</style>
					<ReactDatePicker
						selected={tempStart}
						onChange={handleDateChange}
						startDate={tempStart}
						endDate={tempEnd}
						selectsRange
						inline
						monthsShown={2}
						locale="id"
						dateFormat="dd/MM/yyyy"
					/>
					<Stack direction="row" justifyContent="flex-end" spacing={1}>
						<Button onClick={handleClose} color="inherit" size="small">
							Cancel
						</Button>
						<Button onClick={handleApply} variant="contained" size="small">
							Apply
						</Button>
					</Stack>
				</Box>
			</Popover>
		</Box>
	);
}
