import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/SignInButton";
import { redirect } from "next/navigation";
import { Box, Typography, Paper, Stack, Link as MuiLink } from "@mui/material";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/admin");
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100dvh",
        py: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          width: "100%",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
          Pesona Kebaikan
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Masuk ke dashboard admin
        </Typography>

        <SignInButton />

        <Stack spacing={1} sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="textSecondary">
            Belum punya akun? <MuiLink href="/register">Daftar di sini</MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
