'use client';

import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { registerUser } from "@/actions/register";
import NextLink from "next/link";

export default function RegisterPage() {
  return (
    <Box component="form" className="space-y-6" action={registerUser}>
      <div className="text-center">
        <Typography variant="h4" className="font-bold">
          Daftar Akun
        </Typography>
        <Typography variant="body2" className="text-gray-500 mt-2">
          Buat akun baru untuk mulai berdonasi
        </Typography>
      </div>

      <div className="space-y-4">
        <TextField name="name" fullWidth label="Nama Lengkap" placeholder="John Doe" required />
        <TextField name="email" fullWidth label="Email" type="email" placeholder="you@example.com" required />
        <TextField name="password" fullWidth label="Password" type="password" placeholder="••••••••" required />
      </div>

      <Button type="submit" fullWidth variant="contained" size="large">
        Daftar
      </Button>

      <div className="text-center mt-4">
        <Typography variant="body2">
          Sudah punya akun?{" "}
          <Link component={NextLink} href="/auth/login" className="font-semibold text-primary hover:underline">
            Login disini
          </Link>
        </Typography>
      </div>
    </Box>
  );
}
