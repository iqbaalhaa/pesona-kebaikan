import nodemailer, { type SentMessageInfo } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type Mail from "nodemailer/lib/mailer";
import { prisma } from "@/lib/prisma";

const getMailConfig = async () => {
	try {
		const keys = await prisma.notifyKey.findMany({
			where: {
				key: {
					in: [
						"email_sender",
						"email_app_password",
						"email_verification_subject",
						"email_verification_content",
					],
				},
			},
		});
		const getVal = (k: string) => keys.find((x) => x.key === k)?.value;
		return {
			sender:
				getVal("email_sender") ||
				process.env.EMAIL_FROM ||
				process.env.EMAIL_SERVER_USER ||
				"no-reply@example.com",
			password:
				getVal("email_app_password") || process.env.EMAIL_SERVER_PASSWORD,
			subject:
				getVal("email_verification_subject") ||
				"Kode Verifikasi Email - Pesona Kebaikan",
			content: getVal("email_verification_content"),
		};
	} catch {
		// Fallback if DB fails
		return {
			sender:
				process.env.EMAIL_FROM ||
				process.env.EMAIL_SERVER_USER ||
				"no-reply@example.com",
			password: process.env.EMAIL_SERVER_PASSWORD,
			subject: "Kode Verifikasi Email - Pesona Kebaikan",
			content: undefined,
		};
	}
};

const baseOptions = (config: {
	sender: string;
	password?: string;
}): SMTPTransport.Options => {
	const host = (process.env.EMAIL_SERVER_HOST as string) || "smtp.gmail.com";
	const port = Number(process.env.EMAIL_SERVER_PORT ?? 587);
	const explicitSecure = process.env.EMAIL_SERVER_SECURE === "true";
	const secure = explicitSecure || port === 465;

	// Extract email if sender is in "Name <email>" format
	const senderEmailMatch = config.sender.match(/<(.+)>/);
	const senderEmail = senderEmailMatch ? senderEmailMatch[1] : config.sender;
	// Prioritize EMAIL_SERVER_USER for auth, otherwise use extracted sender email
	const authUser = process.env.EMAIL_SERVER_USER || senderEmail;

	const opts: SMTPTransport.Options = {
		host,
		port,
		secure,
		auth: {
			user: authUser,
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
	return opts;
};

export const verifyTransport = async () => {
	try {
		const config = await getMailConfig();
		const t = nodemailer.createTransport(baseOptions(config));
		await t.verify();
		return { ok: true, message: "ok" };
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : "Transport verify failed";
		if (
			/Greeting never received|timeout|ETIMEDOUT|ECONNREFUSED|ECONNRESET|ENOTFOUND|EHOSTUNREACH/i.test(
				msg,
			)
		) {
			try {
				const config = await getMailConfig();
				const t2 = nodemailer.createTransport({
					...baseOptions(config),
					port: 465,
					secure: true,
				});
				await t2.verify();
				return { ok: true, message: "fallback-ok" };
			} catch (e2: unknown) {
				return {
					ok: false,
					message:
						e2 instanceof Error ? e2.message : msg,
				};
			}
		}
		return { ok: false, message: msg };
	}
};

export const sendVerificationEmail = async (email: string, token: string) => {
	try {
		type AttemptLog = {
			phase: string;
			ok: boolean;
			message: string;
			options?: {
				host?: string;
				port?: number;
				secure?: boolean;
				requireTLS?: boolean;
			};
		};
		type SendLog =
			| {
					ok: true;
					messageId?: string;
					options: { host?: string; port?: number; secure?: boolean };
					envelope?: unknown;
					fallback?: boolean;
			  }
			| {
					ok: false;
					error: string;
					options: { host?: string; port?: number; secure?: boolean };
			  };
		const debug: { attempts: AttemptLog[]; send: SendLog | null } = {
			attempts: [],
			send: null,
		};
		const config = await getMailConfig();

		let currentOptions = baseOptions(config);
		let t = nodemailer.createTransport(currentOptions);
		try {
			await t.verify();
			debug.attempts.push({
				phase: "verify-587",
				ok: true,
				message: "ok",
				options: {
					host: currentOptions.host,
					port: currentOptions.port,
					secure: currentOptions.secure,
					requireTLS: (currentOptions as SMTPTransport.Options).requireTLS,
				},
			});
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "";
			debug.attempts.push({
				phase: "verify-587",
				ok: false,
				message: msg,
				options: {
					host: currentOptions.host,
					port: currentOptions.port,
					secure: currentOptions.secure,
					requireTLS: (currentOptions as SMTPTransport.Options).requireTLS,
				},
			});
			if (/Greeting never received|timeout|ETIMEDOUT|ECONNREFUSED/i.test(msg)) {
				currentOptions = { ...baseOptions(config), port: 465, secure: true };
				t = nodemailer.createTransport(currentOptions);
				await t.verify();
				debug.attempts.push({
					phase: "verify-465",
					ok: true,
					message: "ok",
					options: {
						host: currentOptions.host,
						port: currentOptions.port,
						secure: currentOptions.secure,
						requireTLS: (currentOptions as SMTPTransport.Options).requireTLS,
					},
				});
			} else {
				debug.attempts.push({
					phase: "verify-465",
					ok: false,
					message: "skip",
				});
				throw e as unknown;
			}
		}

		const htmlContent = config.content
			? config.content.replace("{{token}}", token)
			: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Kode Verifikasi Email</h2>
        <p>Terima kasih telah mendaftar di Pesona Kebaikan. Berikut adalah kode OTP verifikasi Anda:</p>
        <div style="padding: 15px; background-color: #f0fdf4; border: 1px solid #0ba976; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #166534; margin: 20px 0;">
          ${token}
        </div>
        <p>Kode ini akan kedaluwarsa dalam 1 jam.</p>
        <p>Jika Anda tidak merasa meminta kode ini, silakan abaikan email ini.</p>
      </div>
      `;

		const message: Mail.Options = {
			from: config.sender,
			to: email,
			subject: config.subject,
			envelope: {
				from: config.sender.match(/<(.+)>/)?.[1] || config.sender,
				to: [email],
			},
			html: htmlContent,
		};

		try {
			const info: SentMessageInfo = await t.sendMail(message);
			debug.send = {
				ok: true,
				messageId: info?.messageId,
				options: {
					host: currentOptions.host,
					port: currentOptions.port,
					secure: currentOptions.secure,
				},
				envelope: info?.envelope,
			};
			return { ok: true, debug };
		} catch (sendErr: unknown) {
			const sendMsg = sendErr instanceof Error ? sendErr.message : "";
			debug.send = {
				ok: false,
				error: sendMsg,
				options: {
					host: currentOptions.host,
					port: currentOptions.port,
					secure: currentOptions.secure,
				},
			};
			if (
				/ETIMEDOUT|ECONNRESET|EHOSTUNREACH|ENOTFOUND|timeout|Greeting never received/i.test(
					sendMsg,
				)
			) {
				const altOptions: SMTPTransport.Options =
					currentOptions.port === 465
						? {
								...baseOptions(config),
								port: 587,
								secure: false,
								requireTLS: true,
							}
						: { ...baseOptions(config), port: 465, secure: true };
				const tAlt = nodemailer.createTransport(altOptions);
				try {
					await tAlt.verify();
					debug.attempts.push({
						phase:
							currentOptions.port === 465
								? "fallback-verify-587"
								: "fallback-verify-465",
						ok: true,
						message: "ok",
						options: {
							host: altOptions.host,
							port: altOptions.port,
							secure: altOptions.secure,
							requireTLS: (altOptions as SMTPTransport.Options).requireTLS,
						},
					});
					const info2: SentMessageInfo = await tAlt.sendMail(message);
					debug.send = {
						ok: true,
						messageId: info2?.messageId,
						options: {
							host: altOptions.host,
							port: altOptions.port,
							secure: altOptions.secure,
						},
						envelope: info2?.envelope,
						fallback: true,
					};
					return { ok: true, debug };
				} catch (altErr: unknown) {
					debug.attempts.push({
						phase:
							currentOptions.port === 465
								? "fallback-verify-587"
								: "fallback-verify-465",
						ok: false,
						message:
							altErr instanceof Error ? altErr.message : "fallback failed",
						options: {
							host: altOptions.host,
							port: altOptions.port,
							secure: altOptions.secure,
							requireTLS: (altOptions as SMTPTransport.Options).requireTLS,
						},
					});
					return {
						ok: false,
						message:
							(altErr instanceof Error ? altErr.message : undefined) ||
							sendMsg,
						debug,
					};
				}
			}
			return { ok: false, message: sendMsg || "Send email failed", debug };
		}
	} catch (e: unknown) {
		return {
			ok: false,
			message: e instanceof Error ? e.message : "Send email failed",
			debug: undefined,
		};
	}
};
