"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Divider from "@mui/material/Divider";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";

import { getPageContent, updatePageContent } from "@/actions/cms";
import {
	DEFAULT_DONATION_FAQ,
	type DonationFaqData,
	type DonationFaqItem,
} from "@/lib/constants";

const EMPTY_ITEM: DonationFaqItem = { label: "", text: "" };

export default function AdminDonationFaqPage() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<DonationFaqData>({ faqs: [] });

	// Add/Edit dialog
	const [openDialog, setOpenDialog] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [formQuestion, setFormQuestion] = useState("");
	const [formItems, setFormItems] = useState<DonationFaqItem[]>([
		{ ...EMPTY_ITEM },
	]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({
		open: false,
		message: "",
		severity: "info",
	});

	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
	}>({
		open: false,
		title: "",
		message: "",
		onConfirm: () => {},
	});

	const showSnackbar = (
		message: string,
		severity: "success" | "error" | "info" | "warning" = "info",
	) => {
		setSnackbar({ open: true, message, severity });
	};

	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const page = await getPageContent("donation_faq");
			setData(page?.data ? (page.data as any) : DEFAULT_DONATION_FAQ);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	/** Persists the full FAQ list in one go — donation_faq is a single JSON blob, not per-row records. */
	const persist = async (faqs: DonationFaqData["faqs"]) => {
		await updatePageContent("donation_faq", {
			title: "FAQ Penggunaan Dana",
			content: "",
			data: { faqs },
		});
		setData({ faqs });
	};

	const handleOpenCreate = () => {
		setEditingIndex(null);
		setFormQuestion("");
		setFormItems([{ ...EMPTY_ITEM }]);
		setOpenDialog(true);
	};

	const handleOpenEdit = (index: number) => {
		const faq = data.faqs[index];
		setEditingIndex(index);
		setFormQuestion(faq.question);
		setFormItems(faq.items.map((i) => ({ ...i })));
		setOpenDialog(true);
	};

	const handleItemChange = (
		itemIndex: number,
		field: "label" | "text",
		value: string,
	) => {
		setFormItems((prev) => {
			const next = [...prev];
			next[itemIndex] = { ...next[itemIndex], [field]: value };
			return next;
		});
	};

	const addFormItem = () => {
		setFormItems((prev) => [...prev, { ...EMPTY_ITEM }]);
	};

	const removeFormItem = (itemIndex: number) => {
		setFormItems((prev) => prev.filter((_, i) => i !== itemIndex));
	};

	const handleSubmit = async () => {
		if (!formQuestion.trim()) {
			showSnackbar("Pertanyaan tidak boleh kosong", "error");
			return;
		}
		if (formItems.length === 0 || formItems.some((i) => !i.text.trim())) {
			showSnackbar("Semua jawaban wajib diisi", "error");
			return;
		}

		const newFaq = {
			question: formQuestion.trim(),
			items: formItems.map((i) => ({ label: i.label.trim(), text: i.text.trim() })),
		};

		setIsSubmitting(true);
		try {
			const newFaqs = [...data.faqs];
			if (editingIndex !== null) newFaqs[editingIndex] = newFaq;
			else newFaqs.push(newFaq);

			await persist(newFaqs);
			showSnackbar(
				editingIndex !== null ? "Pertanyaan berhasil diperbarui" : "Pertanyaan berhasil ditambahkan",
				"success",
			);
			setOpenDialog(false);
		} catch (error) {
			console.error(error);
			showSnackbar("Terjadi kesalahan saat menyimpan", "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = (index: number) => {
		setConfirmDialog({
			open: true,
			title: "Hapus Pertanyaan",
			message: `Yakin ingin menghapus "${data.faqs[index].question}"?`,
			onConfirm: async () => {
				try {
					await persist(data.faqs.filter((_, i) => i !== index));
					showSnackbar("Pertanyaan berhasil dihapus", "success");
				} catch (error) {
					console.error(error);
					showSnackbar("Gagal menghapus pertanyaan", "error");
				}
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	const answerPreview = (faq: DonationFaqData["faqs"][0]) =>
		faq.items
			.map((i) => (i.label ? `${i.label}: ${i.text}` : i.text))
			.join(" • ");

	return (
		<Box>
			<Box
				sx={{
					mb: 4,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: 3,
							bgcolor: "#e0f2fe",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#0284c7",
						}}
					>
						<QuizRoundedIcon />
					</Box>
					<Box>
						<Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
							FAQ Penggunaan Dana
						</Typography>
						<Typography variant="body2" sx={{ color: "#64748b" }}>
							Kelola daftar FAQ yang tampil di popup &quot;Rincian Penggunaan
							Dana&quot; pada halaman donasi — bukan Pusat Bantuan.
						</Typography>
					</Box>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleOpenCreate}
					sx={{
						bgcolor: "#0ba976",
						fontWeight: 700,
						textTransform: "none",
						borderRadius: 2,
						boxShadow: "none",
						"&:hover": { bgcolor: "#16a34a", boxShadow: "none" },
					}}
				>
					Tambah Pertanyaan
				</Button>
			</Box>

			<TableContainer
				component={Paper}
				elevation={0}
				sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflowX: "auto" }}
			>
				<Table>
					<TableHead sx={{ bgcolor: "#f8fafc" }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700, color: "#475569" }}>
								Pertanyaan
							</TableCell>
							<TableCell sx={{ fontWeight: 700, color: "#475569" }}>
								Jawaban
							</TableCell>
							<TableCell
								sx={{
									fontWeight: 700,
									color: "#475569",
									width: 120,
									textAlign: "center",
								}}
							>
								Aksi
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={3} align="center" sx={{ py: 4 }}>
									Memuat data...
								</TableCell>
							</TableRow>
						) : data.faqs.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={3}
									align="center"
									sx={{ py: 4, color: "#94a3b8" }}
								>
									Belum ada pertanyaan. Klik &quot;Tambah Pertanyaan&quot; untuk
									mulai.
								</TableCell>
							</TableRow>
						) : (
							data.faqs.map((faq, index) => (
								<TableRow key={index} hover>
									<TableCell
										sx={{
											fontWeight: 600,
											color: "#1e293b",
											verticalAlign: "top",
											maxWidth: 280,
										}}
									>
										{faq.question}
									</TableCell>
									<TableCell
										sx={{
											color: "#64748b",
											verticalAlign: "top",
											maxWidth: 420,
										}}
									>
										<Typography
											variant="body2"
											sx={{
												display: "-webkit-box",
												WebkitLineClamp: 3,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
											}}
										>
											{answerPreview(faq)}
										</Typography>
									</TableCell>
									<TableCell align="center" sx={{ verticalAlign: "top" }}>
										<IconButton
											size="small"
											onClick={() => handleOpenEdit(index)}
											sx={{ color: "#3b82f6" }}
										>
											<EditIcon fontSize="small" />
										</IconButton>
										<IconButton
											size="small"
											onClick={() => handleDelete(index)}
											sx={{ color: "#ef4444" }}
										>
											<DeleteIcon fontSize="small" />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Add/Edit dialog */}
			<Dialog
				open={openDialog}
				onClose={() => !isSubmitting && setOpenDialog(false)}
				fullWidth
				maxWidth="sm"
				scroll="paper"
			>
				<DialogTitle sx={{ fontWeight: 700 }}>
					{editingIndex !== null ? "Edit Pertanyaan" : "Tambah Pertanyaan Baru"}
				</DialogTitle>
				<DialogContent dividers>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
						<TextField
							label="Pertanyaan"
							fullWidth
							value={formQuestion}
							onChange={(e) => setFormQuestion(e.target.value)}
						/>

						<Divider />

						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Typography variant="body2" sx={{ fontWeight: 700, color: "#334155" }}>
								Jawaban
							</Typography>
							<Button startIcon={<AddIcon />} size="small" onClick={addFormItem}>
								Tambah Jawaban
							</Button>
						</Box>
						<Typography variant="caption" sx={{ color: "#94a3b8" }}>
							Cukup 1 jawaban untuk pertanyaan biasa. Tambah lebih dari 1 kalau
							jawabannya beda tergantung kondisi (misal campaign mitra Pesona
							Kebaikan vs. individu) — isi &quot;Judul kondisi&quot; untuk
							membedakannya, kosongkan kalau tidak perlu.
						</Typography>

						{formItems.map((item, itemIndex) => (
							<Box
								key={itemIndex}
								sx={{
									p: 2,
									border: "1px solid #e2e8f0",
									borderRadius: 2,
									position: "relative",
									bgcolor: "#f8fafc",
								}}
							>
								{formItems.length > 1 && (
									<IconButton
										size="small"
										color="error"
										sx={{ position: "absolute", top: 8, right: 8 }}
										onClick={() => removeFormItem(itemIndex)}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								)}
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										gap: 2,
										pr: formItems.length > 1 ? 5 : 0,
									}}
								>
									{formItems.length > 1 && (
										<TextField
											fullWidth
											size="small"
											label="Judul kondisi"
											value={item.label}
											onChange={(e) =>
												handleItemChange(itemIndex, "label", e.target.value)
											}
										/>
									)}
									<TextField
										fullWidth
										multiline
										rows={3}
										size="small"
										label="Jawaban"
										value={item.text}
										onChange={(e) =>
											handleItemChange(itemIndex, "text", e.target.value)
										}
									/>
								</Box>
							</Box>
						))}
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button
						onClick={() => setOpenDialog(false)}
						disabled={isSubmitting}
						sx={{ color: "#64748b" }}
					>
						Batal
					</Button>
					<Button
						variant="contained"
						onClick={handleSubmit}
						disabled={isSubmitting}
						sx={{
							bgcolor: "#0ba976",
							fontWeight: 700,
							boxShadow: "none",
							"&:hover": { bgcolor: "#16a34a", boxShadow: "none" },
						}}
					>
						{isSubmitting ? "Menyimpan..." : "Simpan"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete confirmation */}
			<Dialog
				open={confirmDialog.open}
				onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>{confirmDialog.title}</DialogTitle>
				<DialogContent>
					<DialogContentText>{confirmDialog.message}</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button
						onClick={() =>
							setConfirmDialog((prev) => ({ ...prev, open: false }))
						}
						sx={{ color: "#64748b" }}
					>
						Batal
					</Button>
					<Button
						onClick={confirmDialog.onConfirm}
						variant="contained"
						color="error"
						sx={{ fontWeight: 700, boxShadow: "none" }}
					>
						Ya, Hapus
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				sx={{ zIndex: 99999 }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					variant="filled"
					sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
