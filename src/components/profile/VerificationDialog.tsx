/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { requestEmailVerification } from "@/actions/email";
import { requestVerificationOtp, verifyOtp } from "@/actions/otp";
import { newVerification } from "@/actions/new-verification";
import { markPhoneVerified, submitVerificationRequest, updateMyAddress } from "@/actions/verification";

interface Province {
  id: string;
  name: string;
}

interface Regency {
  id: string;
  name: string;
  provinceId: string;
}

export default function VerificationDialog({
  open,
  onClose,
  userEmail,
}: {
  open: boolean;
  onClose: () => void;
  userEmail?: string | null;
}) {
  const { data: session } = useSession();
  const [verificationType, setVerificationType] = React.useState<"individu" | "organisasi" | null>(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [regencies, setRegencies] = React.useState<Regency[]>([]);
  const [selectedProvince, setSelectedProvince] = React.useState<Province | null>(null);
  const [selectedRegency, setSelectedRegency] = React.useState<Regency | null>(null);
  const [emailDebug, setEmailDebug] = React.useState<unknown>(null);
  const [phone, setPhone] = React.useState<string>("");
  const [waOtp, setWaOtp] = React.useState<string>("");
  const [waLoading, setWaLoading] = React.useState<boolean>(false);

  const [emailOtp, setEmailOtp] = React.useState<string>("");
  const [emailLoading, setEmailLoading] = React.useState<boolean>(false);

  const [waCooldown, setWaCooldown] = React.useState<number>(0);
  const [showResend, setShowResend] = React.useState<boolean>(false);
  const [docNumber, setDocNumber] = React.useState<string>("");

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (waCooldown > 0) {
      timer = setInterval(() => {
        setWaCooldown((prev) => prev - 1);
      }, 1000);
    } else if (waCooldown === 0 && showResend) {
      // Cooldown finished
    }
    return () => clearInterval(timer);
  }, [waCooldown, showResend]);

  React.useEffect(() => {
    if (open) {
      // Don't reset everything if user accidentally closed it, but maybe reset step if needed?
      // For now, let's keep state persistence as requested, so we remove the resetting logic
      // except for initial load if we want to ensure clean slate only on full reload.
      // But user asked "kalo tak sengaja diclose jg ttap yg sudah diinput", so we do NOTHING here
      // regarding state reset.
      
      // We only fetch data if needed
      if (provinces.length === 0) {
        fetch("/api/address?type=province")
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setProvinces(data);
          })
          .catch(() => {});
      }
    }
  }, [open]);

  // Initial phone set only if empty
  React.useEffect(() => {
    if (open && !phone && session?.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = (session?.user as any)?.phone || "";
      if (p) setPhone(p);
    }
  }, [open, session, phone]);

  React.useEffect(() => {
    if (selectedProvince?.id) {
      fetch(`/api/address?type=regency&provinceId=${selectedProvince.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setRegencies(data);
        })
        .catch(() => {});
    } else {
      setRegencies([]);
      setSelectedRegency(null);
    }
  }, [selectedProvince]);

  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = waOtp.split("");
    // Ensure we have 6 chars
    while (newOtp.length < 6) newOtp.push("");
    
    newOtp[index] = value;
    const otpString = newOtp.join("").substring(0, 6);
    setWaOtp(otpString);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !waOtp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").substring(0, 6);
    if (pastedData) {
      setWaOtp(pastedData);
      // Focus the last filled input or the first empty one
      const targetIndex = Math.min(pastedData.length, 5);
      const targetInput = document.getElementById(`otp-input-${targetIndex === 6 ? 5 : targetIndex}`);
      targetInput?.focus();
    }
  };

  const handleEmailOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = emailOtp.split("");
    while (newOtp.length < 6) newOtp.push("");
    newOtp[index] = value;
    setEmailOtp(newOtp.join("").substring(0, 6));
    if (value && index < 5) {
      document.getElementById(`email-otp-${index + 1}`)?.focus();
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !emailOtp[index] && index > 0) {
      document.getElementById(`email-otp-${index - 1}`)?.focus();
    }
  };

  const handleEmailPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").substring(0, 6);
    if (pasted) {
      setEmailOtp(pasted);
      const idx = Math.min(pasted.length, 5);
      document.getElementById(`email-otp-${idx === 6 ? 5 : idx}`)?.focus();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}>
      {!verificationType ? (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Pilih Jenis Akun
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Silakan pilih jenis akun yang sesuai dengan Anda untuk melanjutkan proses verifikasi.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                onClick={() => setVerificationType("individu")}
                sx={{
                  p: 2,
                  border: "2px solid #e2e8f0",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#61ce70", bgcolor: "#f0fdf4", transform: "translateY(-2px)" },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 1.5,
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(97,206,112,0.1)", display: "grid", placeItems: "center", color: "#61ce70" }}>
                  <PersonIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, mb: 0.5 }}>Individu</Typography>
                  <Typography variant="caption" color="text.secondary">Untuk penggunaan pribadi dan donasi perorangan</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                onClick={() => setVerificationType("organisasi")}
                sx={{
                  p: 2,
                  border: "2px solid #e2e8f0",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#61ce70", bgcolor: "#f0fdf4", transform: "translateY(-2px)" },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 1.5,
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(97,206,112,0.1)", display: "grid", placeItems: "center", color: "#61ce70" }}>
                  <BusinessIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, mb: 0.5 }}>Organisasi</Typography>
                  <Typography variant="caption" color="text.secondary">Untuk yayasan, lembaga, atau komunitas</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <>
          <Box sx={{ p: 3, bgcolor: "#61ce70", color: "white", position: "relative" }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Verifikasi {verificationType === "individu" ? "Individu" : "Organisasi"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Lengkapi data untuk keamanan dan kepercayaan.</Typography>
            <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8, color: "white" }}>
              <CloseIcon />
            </IconButton>
            <Button onClick={() => setVerificationType(null)} size="small" sx={{ color: "white", position: "absolute", top: 8, right: 48, minWidth: "auto", px: 1 }}>
              Ganti
            </Button>
          </Box>

          <DialogContent sx={{ p: 0 }}>
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 3 }}>
              <Step>
                <StepLabel>
                  <Typography sx={{ fontWeight: 700 }}>Verifikasi WhatsApp</Typography>
                </StepLabel>
                <StepContent>
                  <Alert icon={<WhatsAppIcon fontSize="inherit" />} severity="success" sx={{ mb: 2, borderRadius: 1, bgcolor: "#dcfce7", color: "#166534" }}>
                    Kami akan mengirimkan kode OTP ke WhatsApp Anda.
                  </Alert>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
                Nomor WhatsApp
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  InputProps={{ sx: { borderRadius: 1.5 } }}
                  disabled={waCooldown > 0}
                />
                <Button
                  variant="contained"
                  sx={{ 
                    borderRadius: 1.5, 
                    textTransform: "none", 
                    whiteSpace: "nowrap",
                    minWidth: 100,
                    bgcolor: waCooldown > 0 ? "#e2e8f0" : "#61ce70",
                    color: waCooldown > 0 ? "#94a3b8" : "white",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: waCooldown > 0 ? "#e2e8f0" : "#51b860",
                      boxShadow: "none",
                    }
                  }}
                  disabled={waLoading || !phone || waCooldown > 0}
                  onClick={async () => {
                    try {
                      setWaLoading(true);
                      const res = await requestVerificationOtp(phone);
                      if (res.success) {
                        setWaCooldown(60); // 60 seconds cooldown
                        setShowResend(true);
                      }
                      alert(res.success ? "OTP berhasil dikirim ke WhatsApp" : res.error || "Gagal mengirim OTP");
                    } finally {
                      setWaLoading(false);
                    }
                  }}
                >
                  {waLoading ? "..." : waCooldown > 0 ? `${waCooldown}s` : showResend ? "Kirim Ulang" : "Kirim Kode"}
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
                Kode OTP (6 Digit)
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="space-between" onPaste={handlePaste}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TextField
                    key={index}
                    id={`otp-input-${index}`}
                    size="small"
                    value={waOtp[index] || ""}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: "center", padding: "8px" },
                    }}
                    sx={{
                      width: "48px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        "&.Mui-focused fieldset": {
                          borderColor: "#61ce70",
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
          
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={async () => {
                if (!phone || waOtp.length < 6) {
                  alert("Nomor WhatsApp dan 6 digit OTP wajib diisi");
                  return;
                }
                try {
                  setWaLoading(true);
                  const res = await verifyOtp(phone, waOtp);
                  if (res.success) {
                    await markPhoneVerified(phone);
                    setActiveStep((s) => s + 1);
                  } else {
                    alert(res.error || "Verifikasi OTP gagal");
                  }
                } finally {
                  setWaLoading(false);
                }
              }}
              disabled={waLoading || !phone || waOtp.length < 6}
              fullWidth
              sx={{ 
                bgcolor: "#61ce70", 
                textTransform: "none", 
                fontWeight: 700, 
                borderRadius: 2, 
                boxShadow: "none",
                py: 1.5,
                "&:hover": { bgcolor: "#51b860", boxShadow: "none" }
              }}
            >
              Verifikasi & Lanjut
            </Button>
            <Button onClick={() => setActiveStep((s) => s - 1)} fullWidth sx={{ mt: 1, color: "text.secondary", textTransform: "none" }}>
              Kembali
            </Button>
          </Box>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>
                  <Typography sx={{ fontWeight: 700 }}>Verifikasi Email</Typography>
                </StepLabel>
                <StepContent>
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    Kode verifikasi (OTP) akan dikirim ke <b>{userEmail || "email anda"}</b>
                  </Alert>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
                      Kode OTP Email (6 Digit)
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="space-between" onPaste={handleEmailPaste} sx={{ mb: 2 }}>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <TextField
                          key={index}
                          id={`email-otp-${index}`}
                          size="small"
                          value={emailOtp[index] || ""}
                          onChange={(e) => handleEmailOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleEmailKeyDown(e, index)}
                          inputProps={{ maxLength: 1, style: { textAlign: "center", padding: "8px" } }}
                          sx={{
                            width: "48px",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                              "&.Mui-focused fieldset": { borderColor: "#61ce70", borderWidth: 2 },
                            },
                          }}
                        />
                      ))}
                    </Stack>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ borderRadius: 1.5, textTransform: "none" }}
                      onClick={async () => {
                        setEmailLoading(true);
                        try {
                          const res = await requestEmailVerification();
                          // setEmailDebug(res.debug);
                          alert(res.success || res.error || "Terjadi kesalahan");
                        } finally {
                          setEmailLoading(false);
                        }
                      }}
                      disabled={emailLoading}
                    >
                      {emailLoading ? "Mengirim..." : "Kirim Kode OTP"}
                    </Button>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={async () => {
                         if (emailOtp.length < 6) {
                            alert("Masukkan 6 digit kode OTP");
                            return;
                         }
                         setEmailLoading(true);
                         try {
                           const res = await newVerification(emailOtp);
                           if (res.success) {
                             alert(res.success);
                             handleNext();
                           } else {
                             alert(res.error || "Verifikasi gagal");
                           }
                         } finally {
                           setEmailLoading(false);
                         }
                      }} 
                      disabled={emailLoading || emailOtp.length < 6}
                      sx={{ bgcolor: "#61ce70", textTransform: "none", fontWeight: 700, borderRadius: 1, boxShadow: "none" }}
                    >
                      Verifikasi & Lanjut
                    </Button>
                    <Button onClick={handleBack} sx={{ mt: 1, mr: 1, color: "text.secondary", textTransform: "none" }}>
                      Kembali
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>
                  <Typography sx={{ fontWeight: 700 }}>
                    Upload {verificationType === "individu" ? "Foto KTP" : "SK Kemenkumham"}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {verificationType === "individu" ? "Pastikan foto KTP terlihat jelas dan terbaca." : "Upload dokumen SK Kemenkumham yang sah."}
                  </Typography>
                  <Box
                    sx={{
                      border: "2px dashed #e2e8f0",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                      bgcolor: "#f8fafc",
                      cursor: "pointer",
                      "&:hover": { borderColor: "#61ce70", bgcolor: "#f0fdf4" },
                    }}
                  >
                    <UploadFileIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>
                      Klik untuk upload {verificationType === "individu" ? "foto KTP" : "SK Kemenkumham"}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Format: JPG, PDF (Max 5MB)</Typography>
                  </Box>
                  <TextField
                    label={verificationType === "individu" ? "Nomor NIK KTP" : "Nomor SK Kemenkumham"}
                    fullWidth
                    size="small"
                    placeholder={verificationType === "individu" ? "16 digit NIK" : "Masukkan nomor SK"}
                    sx={{ mt: 2 }}
                    InputProps={{ sx: { borderRadius: 1 } }}
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                  />
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Button variant="contained" onClick={async () => {
                      if (!docNumber) {
                        alert("Nomor dokumen wajib diisi");
                        return;
                      }
                      const res = await submitVerificationRequest({
                        type: verificationType === "organisasi" ? "organisasi" : "individu",
                        ktpNumber: verificationType === "individu" ? docNumber : undefined,
                        organizationNumber: verificationType === "organisasi" ? docNumber : undefined,
                      });
                      if (res.success) {
                        handleNext();
                      } else {
                        alert(res.error || "Gagal menyimpan data verifikasi");
                      }
                    }} sx={{ bgcolor: "#61ce70", textTransform: "none", fontWeight: 700, borderRadius: 1, boxShadow: "none" }}>
                      Lanjut
                    </Button>
                    <Button onClick={handleBack} sx={{ mt: 1, mr: 1, color: "text.secondary", textTransform: "none" }}>
                      Kembali
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>
                  <Typography sx={{ fontWeight: 700 }}>Alamat Domisili</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Pilih provinsi dan kabupaten/kota domisili Anda.
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 2 }}>
                    <Autocomplete
                      options={provinces}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={selectedProvince}
                      onChange={(_, newValue) => setSelectedProvince(newValue)}
                      renderInput={(params) => <TextField {...params} label="Provinsi" size="small" />}
                      noOptionsText="Tidak ada data"
                    />
                    <Autocomplete
                      options={regencies}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={selectedRegency}
                      onChange={(_, newValue) => setSelectedRegency(newValue)}
                      disabled={!selectedProvince}
                      renderInput={(params) => <TextField {...params} label="Kabupaten/Kota" size="small" />}
                      noOptionsText={selectedProvince ? "Tidak ada data" : "Pilih provinsi terlebih dahulu"}
                    />
                  </Stack>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        if (!selectedProvince || !selectedRegency) return;
                        const res = await updateMyAddress(selectedProvince.id, selectedRegency.id);
                        if (res.success) {
                          handleNext();
                        } else {
                          alert(res.error || "Gagal menyimpan alamat");
                        }
                      }}
                      disabled={!selectedProvince || !selectedRegency}
                      sx={{
                        bgcolor: "#61ce70",
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1,
                        boxShadow: "none",
                        "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                      }}
                    >
                      Lanjut
                    </Button>
                    <Button onClick={handleBack} sx={{ mt: 1, mr: 1, color: "text.secondary", textTransform: "none" }}>
                      Kembali
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>
                  <Typography sx={{ fontWeight: 700 }}>Selesai</Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: "#61ce70", mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Terima Kasih!</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Data Anda telah kami terima dan sedang dalam proses verifikasi 1x24 jam.
                    </Typography>
                  </Box>
                  <Button onClick={onClose} variant="outlined" fullWidth sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}>
                    Tutup
                  </Button>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
