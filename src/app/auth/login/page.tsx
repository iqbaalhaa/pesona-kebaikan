'use client';

import { Box, Button, TextField, Typography, Link } from "@mui/material";
import NextLink from "next/link";
import { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  return (
    <Box component="form" className="space-y-6" action={loginAction}>
      <div className="text-center">
        <Typography variant="h4" className="font-bold">
          Login
        </Typography>
        <Typography variant="body2" className="text-gray-500 mt-2">
          Masukkan kredensial Anda
        </Typography>
      </div>

      <div className="space-y-4">
        <TextField name="email" fullWidth label="Email" type="email" placeholder="you@example.com" />
        <TextField name="password" fullWidth label="Password" type="password" placeholder="••••••••" />
      </div>

      <Button type="submit" fullWidth variant="contained" size="large">
        Login
      </Button>

      <div className="text-center mt-4">
        <Typography variant="body2">
          Belum punya akun?{" "}
          <Link component={NextLink} href="/auth/register" className="font-semibold text-primary hover:underline">
            Daftar disini
          </Link>
        </Typography>
      </div>
    </Box>
  );
}
