'use client';

import * as React from "react";
import { useFormStatus } from "react-dom";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Link, 
  Paper, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress
} from "@mui/material";
import NextLink from "next/link";
import { registerUser } from "@/actions/register";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        size="large"
        disabled={pending}
        sx={{ 
            borderRadius: 3, 
            py: 1.5, 
            fontWeight: 700, 
            textTransform: 'none',
            boxShadow: '0 8px 16px -4px rgba(97, 206, 112, 0.25)' 
        }}
    >
      {pending ? <CircularProgress size={24} color="inherit" /> : "Daftar Sekarang"}
    </Button>
  );
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Paper 
      elevation={0} 
      className="p-8 sm:p-10 border border-gray-100 dark:border-gray-800 rounded-3xl"
      sx={{ 
        backgroundColor: 'background.paper',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)'
      }}
    >
        {/* Back Button */}
        <Box sx={{ mb: 4 }}>
             <Link component={NextLink} href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary no-underline transition-colors">
                <ArrowBackIcon fontSize="small" />
                Kembali ke Beranda
             </Link>
        </Box>

      <div className="text-center mb-8">
        <Box className="flex justify-center mb-4">
             <div className="relative w-12 h-12">
                 <Image src="/brand/logo.png" alt="Logo" fill className="object-contain" />
             </div>
        </Box>
        <Typography variant="h5" className="font-bold mb-2">
          Buat Akun Baru
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bergabunglah untuk menebar kebaikan
        </Typography>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" action={registerUser} className="space-y-5">
        <TextField 
          name="name" 
          fullWidth 
          label="Nama Lengkap" 
          placeholder="Nama Anda" 
          required
          InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <PersonOutlineIcon color="action" fontSize="small" />
                </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />

        <TextField 
          name="email" 
          fullWidth 
          label="Email Address" 
          type="email" 
          placeholder="nama@email.com" 
          required
          InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" fontSize="small" />
                </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />
        
        <TextField 
            name="password" 
            fullWidth 
            label="Password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            required
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <LockOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                    </InputAdornment>
                ),
                sx: { borderRadius: 3 }
            }}
        />

        <SubmitButton />

        <div className="text-center mt-6">
            <Typography variant="body2" color="text.secondary">
            Sudah punya akun?{" "}
            <Link component={NextLink} href="/auth/login" className="font-bold text-primary hover:underline no-underline">
                Masuk Disini
            </Link>
            </Typography>
        </div>
      </Box>
    </Paper>
  );
}
