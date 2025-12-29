"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { newVerification } from "@/actions/new-verification";
import { Box, Typography, Paper, Alert, CircularProgress, Button, Container } from "@mui/material";
import Link from "next/link";

function VerificationContent() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Token tidak ditemukan!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Terjadi kesalahan!");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "#2E7D32" }}>
        Verifikasi Email
      </Typography>

      <Box sx={{ my: 3, display: "flex", justifyContent: "center", width: "100%" }}>
        {!success && !error && <CircularProgress color="success" />}
        {success && <Alert severity="success" sx={{ width: "100%" }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}
      </Box>

      <Link href="/auth/login" passHref style={{ textDecoration: 'none' }}>
         <Button variant="contained" color="success" sx={{ mt: 2 }}>
            Kembali ke Login
         </Button>
      </Link>
    </Paper>
  );
}

export default function NewVerificationPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8fafc",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Suspense fallback={<CircularProgress />}>
          <VerificationContent />
        </Suspense>
      </Container>
    </Box>
  );
}
