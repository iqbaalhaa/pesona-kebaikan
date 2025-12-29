import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const baseOptions = (): SMTPTransport.Options => {
  const host = ((process.env.EMAIL_SERVER_HOST as string) || "smtp.gmail.com");
  const port = Number(process.env.EMAIL_SERVER_PORT ?? 587);
  const explicitSecure = process.env.EMAIL_SERVER_SECURE === "true";
  const secure = explicitSecure || port === 465;

  return {
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_SERVER_USER as string,
      pass: process.env.EMAIL_SERVER_PASSWORD as string,
    },
    requireTLS: !secure,
    pool: process.env.EMAIL_POOL === "true",
    maxConnections: Number(process.env.EMAIL_POOL_MAX_CONNECTIONS ?? 2),
    maxMessages: Number(process.env.EMAIL_POOL_MAX_MESSAGES ?? 100),
    // Align with Nodemailer recommended defaults for better resilience
    connectionTimeout: 120000,
    greetingTimeout: 30000,
    socketTimeout: 600000,
    dnsTimeout: 30000,
    logger: true,
    debug: true,
    tls: {
      servername: host,
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  };
};

const transporter = nodemailer.createTransport(baseOptions());

export const verifyTransport = async () => {
  try {
    const t = nodemailer.createTransport(baseOptions());
    await t.verify();
    return { ok: true, message: "ok" };
  } catch (e: any) {
    const msg = e?.message || "Transport verify failed";
    if (/Greeting never received|timeout|ETIMEDOUT|ECONNREFUSED|ECONNRESET|ENOTFOUND|EHOSTUNREACH/i.test(msg)) {
      try {
        const t2 = nodemailer.createTransport({
          ...baseOptions(),
          port: 465,
          secure: true,
        });
        await t2.verify();
        return { ok: true, message: "fallback-ok" };
      } catch (e2: any) {
        return { ok: false, message: e2?.message || msg };
      }
    }
    return { ok: false, message: msg };
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  try {
    const debug: any = { attempts: [] as any[], send: null };

    let currentOptions = baseOptions();
    let t = nodemailer.createTransport(currentOptions);
    try {
      await t.verify();
      debug.attempts.push({
        phase: "verify-587",
        ok: true,
        message: "ok",
        options: { host: currentOptions.host, port: currentOptions.port, secure: currentOptions.secure, requireTLS: currentOptions.requireTLS },
      });
    } catch (e: any) {
      const msg = e?.message || "";
      debug.attempts.push({
        phase: "verify-587",
        ok: false,
        message: msg,
        options: { host: currentOptions.host, port: currentOptions.port, secure: currentOptions.secure, requireTLS: currentOptions.requireTLS },
      });
      if (/Greeting never received|timeout|ETIMEDOUT|ECONNREFUSED/i.test(msg)) {
        currentOptions = { ...baseOptions(), port: 465, secure: true };
        t = nodemailer.createTransport(currentOptions);
        await t.verify();
        debug.attempts.push({
          phase: "verify-465",
          ok: true,
          message: "ok",
          options: { host: currentOptions.host, port: currentOptions.port, secure: currentOptions.secure, requireTLS: currentOptions.requireTLS },
        });
      } else {
        debug.attempts.push({
          phase: "verify-465",
          ok: false,
          message: "skip",
        });
        throw e;
      }
    }

    const message = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || "no-reply@example.com",
      to: email,
      subject: "Konfirmasi Email Anda - Pesona Kebaikan",
      envelope: {
        from: process.env.EMAIL_SERVER_USER || process.env.EMAIL_FROM || undefined,
        to: [email],
      },
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
    } as const;

    try {
      const info = await t.sendMail(message as any);
      debug.send = {
        ok: true,
        messageId: info?.messageId,
        options: { host: currentOptions.host, port: currentOptions.port, secure: currentOptions.secure },
        envelope: info?.envelope,
      };
      return { ok: true, debug };
    } catch (sendErr: any) {
      const sendMsg = sendErr?.message || "";
      debug.send = { ok: false, error: sendMsg, options: { host: currentOptions.host, port: currentOptions.port, secure: currentOptions.secure } };
      if (/ETIMEDOUT|ECONNRESET|EHOSTUNREACH|ENOTFOUND|timeout|Greeting never received/i.test(sendMsg)) {
        const altOptions: SMTPTransport.Options =
          currentOptions.port === 465
            ? { ...baseOptions(), port: 587, secure: false, requireTLS: true }
            : { ...baseOptions(), port: 465, secure: true };
        const tAlt = nodemailer.createTransport(altOptions);
        try {
          await tAlt.verify();
          debug.attempts.push({
            phase: currentOptions.port === 465 ? "fallback-verify-587" : "fallback-verify-465",
            ok: true,
            message: "ok",
            options: { host: altOptions.host, port: altOptions.port, secure: altOptions.secure, requireTLS: (altOptions as any).requireTLS },
          });
          const info2 = await tAlt.sendMail(message as any);
          debug.send = {
            ok: true,
            messageId: info2?.messageId,
            options: { host: altOptions.host, port: altOptions.port, secure: altOptions.secure },
            envelope: info2?.envelope,
            fallback: true,
          };
          return { ok: true, debug };
        } catch (altErr: any) {
          debug.attempts.push({
            phase: currentOptions.port === 465 ? "fallback-verify-587" : "fallback-verify-465",
            ok: false,
            message: altErr?.message || "fallback failed",
            options: { host: altOptions.host, port: altOptions.port, secure: altOptions.secure, requireTLS: (altOptions as any).requireTLS },
          });
          return { ok: false, message: altErr?.message || sendMsg, debug };
        }
      }
      return { ok: false, message: sendMsg || "Send email failed", debug };
    }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Send email failed", debug: e?.debug };
  }
};
