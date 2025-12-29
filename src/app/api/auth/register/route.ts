import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password harus diisi" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email,
        password: hashedPassword,
      },
    });

    // For development, if email config is missing, we skip sending email
    if (process.env.EMAIL_SERVER_HOST) {
      const verificationToken = await generateVerificationToken(email);
      try {
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // We still want to return success if user is created, but maybe warn
      }
    } else {
      console.warn("Skipping email verification - SMTP config missing");
    }

    return NextResponse.json({ success: true, message: "Registrasi berhasil!" });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat registrasi" }, { status: 500 });
  }
}
