"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import type { SxProps } from "@mui/material";

export default function PageContainer({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps;
}) {
  return <Box sx={{ px: 2, pt: 2.5, pb: 6, ...sx }}>{children}</Box>;
}
