import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Box, Typography, Paper, Stack, Link as MuiLink, TextField, Button } from "@mui/material";
import NextLink from "next/link";

export default async function RegisterPage() {
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
          Daftar akun baru
        </Typography>

        <Stack spacing={2}>
          <TextField label="Nama Lengkap" variant="outlined" fullWidth />
          <TextField label="Email" type="email" variant="outlined" fullWidth />
          <TextField label="Password" type="password" variant="outlined" fullWidth />
          <Button variant="contained" fullWidth size="large">
            Daftar
          </Button>
        </Stack>

        <Stack spacing={1} sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="textSecondary">
            Sudah punya akun? <MuiLink href="/login">Masuk di sini</MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
