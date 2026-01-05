"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Props = {
  title: string;
  container?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
};

export default function ProfileHeader({ title, container = false, maxWidth = "md" }: Props) {
  const router = useRouter();
  const content = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <IconButton onClick={() => router.back()} edge="start" sx={{ color: "#0f172a" }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{title}</Typography>
    </Box>
  );
  if (container) {
    return (
      <Container maxWidth={maxWidth} sx={{ pt: 2.5, pb: 2 }}>
        {content}
      </Container>
    );
  }
  return <Box sx={{ mb: 3 }}>{content}</Box>;
}
