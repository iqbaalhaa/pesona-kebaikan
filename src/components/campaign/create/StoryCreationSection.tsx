"use client";

import * as React from "react";
import {
	Box,
	Paper,
	Typography,
	Button,
	Dialog,
	IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StoryBuilder from "@/components/campaign/create/StoryBuilder";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface StoryCreationSectionProps {
	mode: "wizard" | "editor";
	story: string;
	storyStructure?: any;
	onSave: (html: string, structure?: any) => void;
	loaded: boolean;
	category?: "sakit" | "lainnya";
	purposeKey?: string;
	defaultShowEditor?: boolean;
}

export default function StoryCreationSection({
	mode,
	story,
	storyStructure,
	onSave,
	loaded,
	category = "sakit",
	purposeKey,
	defaultShowEditor = false,
}: StoryCreationSectionProps) {
	const [showEditor, setShowEditor] = React.useState(defaultShowEditor);
	const [hasSaved, setHasSaved] = React.useState(false);

	// Update showEditor when defaultShowEditor changes, but only if it becomes true?
	// Or just trust the initial value.
	// The parent (page.tsx) sets isContentEdit based on URL, which is stable.
	// However, page.tsx sets showStoryEditor(true) inside a useEffect after data load.
	// If I pass `defaultShowEditor={showStoryEditor}`, I need the component to react to it.

	React.useEffect(() => {
		if (defaultShowEditor) {
			setShowEditor(true);
		}
	}, [defaultShowEditor]);

	// If not loaded, show loading
	if (!story && !loaded) {
		return (
			<Box sx={{ p: 4, textAlign: "center" }} data-testid="story-loading">
				<Typography variant="body2" color="text.secondary">
					Memuat...
				</Typography>
			</Box>
		);
	}

	// If not editing and not yet saved, show "Create" card
	// Also show if story exists but we want to allow editing (logic above handles preview)
	// Actually, if story exists, we show preview AND button to edit.
	// But the logic below:
	if (!showEditor && !hasSaved && !story) {
		return (
			<Paper
				elevation={0}
				sx={{
					borderRadius: 3,
					border: "1px solid",
					borderColor: "divider",
					p: 1.25,
				}}
				data-testid="story-create-card"
			>
				<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
					Kenapa cerita itu penting?
				</Typography>
				<Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.25 }}>
					Cerita yang lengkap biasanya lebih dipercaya dan peluang donasinya
					lebih tinggi.
				</Typography>

				<Button
					variant="contained"
					fullWidth
					onClick={() => setShowEditor(true)}
					sx={{ borderRadius: 2, fontWeight: 700, py: 1.15 }}
					data-testid="btn-create-story"
				>
					{story ? "Edit cerita galang dana" : "Buat cerita galang dana"}
				</Button>
			</Paper>
		);
	}

	// WIZARD MODE (Medis)
	if (mode === "wizard") {
		return (
			<>
				{/* Preview if story exists */}
				{story && (
					<Box sx={{ mb: 3 }}>
						<Paper
							variant="outlined"
							sx={{
								p: 2,
								borderRadius: 3,
								bgcolor: "grey.50",
								maxHeight: 400,
								overflow: "auto",
							}}
						>
							<Typography
								sx={{
									mb: 1,
									fontSize: 12,
									color: "text.secondary",
									fontWeight: 600,
								}}
							>
								Preview Cerita:
							</Typography>
							<Box
								sx={{
									"& p": { fontSize: 14, mb: 1, lineHeight: 1.6 },
									"& img": {
										maxWidth: "100%",
										height: "auto",
										borderRadius: 8,
									},
								}}
								dangerouslySetInnerHTML={{ __html: story }}
							/>
							<Button
								size="small"
								onClick={() => setShowEditor(true)}
								sx={{ mt: 1, fontWeight: 700 }}
								data-testid="btn-edit-story"
							>
								Edit Cerita
							</Button>
						</Paper>
					</Box>
				)}

				{/* Dialog Editor */}
				<Dialog
					fullScreen
					open={showEditor}
					onClose={() => setShowEditor(false)}
					PaperProps={{ sx: { bgcolor: "#f8fafc" } }}
					data-testid="story-editor-dialog"
				>
					<Box
						sx={{
							position: "sticky",
							top: 0,
							zIndex: 10,
							bgcolor: "white",
							boxShadow: 1,
							px: 2,
							py: 1.5,
						}}
					>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								maxWidth: 600,
								mx: "auto",
								width: "100%",
							}}
						>
							<IconButton
								edge="start"
								autoFocus
								onClick={() => setShowEditor(false)}
							>
								<CloseRoundedIcon />
							</IconButton>
							<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
								{category === "sakit"
									? "Bantuan Medis & Kesehatan"
									: "Cerita Galang Dana"}
							</Typography>
							<Box sx={{ width: 40 }} /> {/* Spacer */}
						</Box>
					</Box>

					<Box sx={{ p: 3, maxWidth: 600, mx: "auto", width: "100%" }}>
						<StoryBuilder
							category={category}
							purposeKey={purposeKey}
							initialData={
								storyStructure
									? {
											html: story,
											structure: storyStructure,
										}
									: undefined
							}
							onComplete={(html, structure) => {
								onSave(html, structure);
								setShowEditor(false);
								setHasSaved(true);
							}}
							onBack={() => setShowEditor(false)}
						/>
					</Box>
				</Dialog>
			</>
		);
	}

	// EDITOR MODE (Lainnya)
	if (mode === "editor") {
		return (
			<>
				{showEditor && (
					<Box sx={{ mt: 1.5 }} data-testid="story-editor-inline">
						<RichTextEditor
							value={story}
							onChange={(val) => {
								onSave(val);
								setHasSaved(true);
							}}
							placeholder="Tulis latar belakang, kondisi, kebutuhan biaya, rencana penggunaan dana, dan ajakan..."
							minHeight={240}
						/>
						<Button
							size="small"
							variant="outlined"
							onClick={() => setShowEditor(false)}
							sx={{ mt: 1 }}
							data-testid="btn-finish-edit"
						>
							Selesai Edit
						</Button>
					</Box>
				)}

				{story && !showEditor && hasSaved && (
					<Box
						sx={{
							mt: 2,
							p: 2,
							border: "1px solid",
							borderColor: "divider",
							borderRadius: 2,
							bgcolor: "background.paper",
						}}
						data-testid="story-preview"
					>
						<Typography
							sx={{
								mb: 1,
								fontSize: 12,
								color: "text.secondary",
								fontWeight: 600,
							}}
						>
							Preview Cerita:
						</Typography>
						<Box
							sx={{
								"& p": { fontSize: 14, mb: 1, lineHeight: 1.6 },
								"& img": {
									maxWidth: "100%",
									height: "auto",
									borderRadius: 8,
								},
							}}
							dangerouslySetInnerHTML={{ __html: story }}
						/>
						<Button
							size="small"
							onClick={() => setShowEditor(true)}
							sx={{ mt: 1, fontWeight: 700 }}
							data-testid="btn-edit-story"
						>
							Edit Cerita
						</Button>
					</Box>
				)}
			</>
		);
	}

	return null;
}
