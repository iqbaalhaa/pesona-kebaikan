import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { prisma } from "@/lib/prisma";

const getMailConfig = async () => {
  try {
    const keys = await prisma.notifyKey.findMany({
      where: { key: { in: ["email_sender", "email_app_password", "email_verification_subject", "email_verification_content"] } }
    });
    const getVal = (k: string) => keys.find(x => x.key === k)?.value;
    return {
      sender: getVal("email_sender") || process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || "no-reply@example.com",
      password: getVal("email_app_password") || process.env.EMAIL_SERVER_PASSWORD,
      subject: getVal("email_verification_subject") || "Kode Verifikasi Email - Pesona Kebaikan",
      content: getVal("email_verification_content"),
    };
  } catch (e) {
    // Fallback if DB fails
    return {
      sender: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || "no-reply@example.com",
      password: process.env.EMAIL_SERVER_PASSWORD,
      subject: "Kode Verifikasi Email - Pesona Kebaikan",
      content: undefined,
    };
  }
};

const baseOptions = (config: { sender: string; password?: string }): SMTPTransport.Options => {
  const host = ((process.env.EMAIL_SERVER_HOST as string) || "smtp.gmail.com");
  const port = Number(process.env.EMAIL_SERVER_PORT ?? 587);
  const explicitSecure = process.env.EMAIL_SERVER_SECURE === "true";
  const secure = explicitSecure || port === 465;

  const opts: any = {
    host,
    port,
    secure,
    auth: {
      user: config.sender,
      pass: config.password || process.env.EMAIL_SERVER_PASSWORD || "",
    },
    requireTLS: !secure,
    pool: process.env.EMAIL_POOL === "true",
    maxConnections: Number(process.env.EMAIL_POOL_MAX_CONNECTIONS ?? 2),
    maxMessages: Number(process.env.EMAIL_POOL_MAX_MESSAGES ?? 100),
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
  return opts as SMTPTransport.Options;
};

export const verifyTransport = async () => {
  try {
    const config = await getMailConfig();
    const t = nodemailer.createTransport(baseOptions(config));
    await t.verify();
    return { ok: true, message: "ok" };
  } catch (e: any) {
    const msg = e?.message || "Transport verify failed";
    if (/Greeting never received|timeout|ETIMEDOUT|ECONNREFUSED|ECONNRESET|ENOTFOUND|EHOSTUNREACH/i.test(msg)) {
      try {
        const config = await getMailConfig();
        const t2 = nodemailer.createTransport({
          ...baseOptions(config),
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
  try {
    const debug: any = { attempts: [] as any[], send: null };
    const config = await getMailConfig();

    let currentOptions = baseOptions(config);
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
        currentOptions = { ...baseOptions(config), port: 465, secure: true };
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

    const htmlContent = config.content 
      ? config.content.replace("{{token}}", token)
      : `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Kode Verifikasi Email</h2>
        <p>Terima kasih telah mendaftar di Pesona Kebaikan. Berikut adalah kode OTP verifikasi Anda:</p>
        <div style="padding: 15px; background-color: #f0fdf4; border: 1px solid #61ce70; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #166534; margin: 20px 0;">
          ${token}
        </div>
        <p>Kode ini akan kedaluwarsa dalam 1 jam.</p>
        <p>Jika Anda tidak merasa meminta kode ini, silakan abaikan email ini.</p>
      </div>
      `;

    const message = {
      from: config.sender,
      to: email,
      subject: config.subject,
      envelope: {
        from: config.sender,
        to: [email],
      },
      html: htmlContent,
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
            ? { ...baseOptions(config), port: 587, secure: false, requireTLS: true }
            : { ...baseOptions(config), port: 465, secure: true };
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
