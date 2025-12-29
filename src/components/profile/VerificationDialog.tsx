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
import { requestOtp, verifyOtp } from "@/actions/otp";

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
  const [provinces, setProvinces] = React.useState<any[]>([]);
  const [regencies, setRegencies] = React.useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = React.useState<any>(null);
  const [selectedRegency, setSelectedRegency] = React.useState<any>(null);
  const [emailDebug, setEmailDebug] = React.useState<any>(null);
  const [phone, setPhone] = React.useState<string>("");
  const [waOtp, setWaOtp] = React.useState<string>("");
  const [waLoading, setWaLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) {
      setVerificationType(null);
      setActiveStep(0);
      setEmailDebug(null);
    }
  }, [open]);

  React.useEffect(() => {
    if (open) {
      const p = (session?.user as any)?.phone || "";
      setPhone(p);
    }
  }, [open, session]);

  React.useEffect(() => {
    if (open) {
      fetch("/api/address?type=province")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setProvinces(data);
        })
        .catch(() => {});
    }
  }, [open]);

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
                  <TextField
                    label="Nomor WhatsApp"
                    fullWidth
                    size="small"
                    placeholder="0812xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{ sx: { borderRadius: 1 } }}
                  />
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Kode OTP WA"
                      fullWidth
                      value={waOtp}
                      onChange={(e) => setWaOtp(e.target.value)}
                      InputProps={{ sx: { borderRadius: 1 } }}
                    />
                    <Button
                      variant="outlined"
                      sx={{ borderRadius: 2, textTransform: "none", whiteSpace: "nowrap" }}
                      disabled={waLoading || !phone}
                      onClick={async () => {
                        try {
                          setWaLoading(true);
                          const res = await requestOtp(phone, "Verifikasi Akun", "-");
                          alert(res.success ? "OTP berhasil dikirim ke WhatsApp" : res.error || "Gagal mengirim OTP");
                        } finally {
                          setWaLoading(false);
                        }
                      }}
                    >
                      Kirim Kode
                    </Button>
                  </Stack>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        if (!phone || !waOtp) {
                          alert("Nomor WhatsApp dan OTP wajib diisi");
                          return;
                        }
                        try {
                          setWaLoading(true);
                          const res = await verifyOtp(phone, waOtp);
                          if (res.success) {
                            handleNext();
                          } else {
                            alert(res.error || "Verifikasi OTP gagal");
                          }
                        } finally {
                          setWaLoading(false);
                        }
                      }}
                      disabled={waLoading || !phone || !waOtp}
                      sx={{ bgcolor: "#61ce70", textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none" }}
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
                  <Typography sx={{ fontWeight: 700 }}>Verifikasi Email</Typography>
                </StepLabel>
                <StepContent>
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    Kode verifikasi akan dikirim ke <b>{userEmail || "email anda"}</b>
                  </Alert>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <TextField size="small" placeholder="Masukkan Kode OTP" fullWidth InputProps={{ sx: { borderRadius: 1 } }} />
                    <Button
                      variant="outlined"
                      sx={{ borderRadius: 1, textTransform: "none", whiteSpace: "nowrap" }}
                      onClick={async () => {
                        const res = await requestEmailVerification();
                        setEmailDebug(res.debug);
                        alert(res.success || res.error || "Terjadi kesalahan");
                      }}
                    >
                      Kirim Kode
                    </Button>
                  </Stack>
                  {emailDebug ? (
                    <Box sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <Typography sx={{ fontWeight: 700, mb: 1 }}>Log Pengiriman Email</Typography>
                      <Stack spacing={1}>
                        {(emailDebug.attempts ?? []).map((a: any, idx: number) => (
                          <Alert key={idx} severity={a.ok ? "success" : "error"} sx={{ borderRadius: 1 }}>
                            <Typography variant="caption">
                              {a.phase}: {a.ok ? "OK" : "Gagal"} — {a.message}
                            </Typography>
                            {a.options ? (
                              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                                host={a.options.host} port={a.options.port} secure={String(a.options.secure)} requireTLS={String(a.options.requireTLS)}
                              </Typography>
                            ) : null}
                          </Alert>
                        ))}
                        {emailDebug.send ? (
                          <Alert severity={emailDebug.send.ok ? "success" : "error"} sx={{ borderRadius: 1 }}>
                            <Typography variant="caption">
                              send: {emailDebug.send.ok ? "OK" : "Gagal"} — messageId={emailDebug.send.messageId || "-"}
                            </Typography>
                            {emailDebug.send.options ? (
                              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                                host={emailDebug.send.options.host} port={emailDebug.send.options.port} secure={String(emailDebug.send.options.secure)}
                              </Typography>
                            ) : null}
                          </Alert>
                        ) : null}
                      </Stack>
                    </Box>
                  ) : null}
                  <Box sx={{ mb: 2 }}>
                    <Button variant="contained" onClick={handleNext} sx={{ bgcolor: "#61ce70", textTransform: "none", fontWeight: 700, borderRadius: 1, boxShadow: "none" }}>
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
                  />
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Button variant="contained" onClick={handleNext} sx={{ bgcolor: "#61ce70", textTransform: "none", fontWeight: 700, borderRadius: 1, boxShadow: "none" }}>
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
                      onClick={handleNext}
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
