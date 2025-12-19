import { Box } from "@mui/material";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>{children}</Box>;
}
