import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_SECURE === "true", 
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject: "Konfirmasi Email Anda - Pesona Kebaikan",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Konfirmasi Email Anda</h2>
        <p>Terima kasih telah mendaftar di Pesona Kebaikan. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:</p>
        <a href="${confirmLink}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verifikasi Email</a>
        <p>Atau salin dan tempel tautan berikut di browser Anda:</p>
        <p><a href="${confirmLink}">${confirmLink}</a></p>
        <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
        <p>Jika Anda tidak merasa mendaftar, silakan abaikan email ini.</p>
      </div>
    `,
  });
};
