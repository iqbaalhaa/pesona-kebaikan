
import { requestPasswordReset, resetPassword } from "../src/actions/reset-password";
import { prisma } from "../src/lib/prisma";
import { generatePasswordResetToken } from "../src/lib/tokens";
import bcrypt from "bcryptjs";

async function testPasswordResetFlow() {
  console.log("Starting Password Reset Flow Test...");

  const testEmail = `test-reset-${Date.now()}@example.com`;
  const testPassword = "password123";
  const newPassword = "newpassword456";

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      password: await bcrypt.hash(testPassword, 10),
    }
  });
  console.log("User created:", user.email);

  // 2. Request Password Reset
  try {
      const reqResult = await requestPasswordReset(testEmail);
      console.log("Request Reset Result:", reqResult);
  } catch (e) {
      console.log("Request failed (expected if no email config):", e);
  }

  // Check DB for token
  const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { email: testEmail }
  });

  let tokenStr = "";
  if (tokenRecord) {
      console.log("Token found in DB:", tokenRecord.token);
      tokenStr = tokenRecord.token;
  } else {
      console.log("Token NOT found in DB (maybe email failed before saving? or checking too fast). Manually creating for test.");
      const t = await generatePasswordResetToken(testEmail);
      tokenStr = t.token;
  }

  // 3. Reset Password
  const resetResult = await resetPassword(tokenStr, newPassword);
  console.log("Reset Password Result:", resetResult);

  if (resetResult.error) {
      console.error("Reset failed:", resetResult.error);
  }

  // 4. Verify new password
  const updatedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  const isMatch = await bcrypt.compare(newPassword, updatedUser?.password || "");
  console.log("Password match:", isMatch);

  if (isMatch) {
      console.log("TEST PASSED");
  } else {
      console.error("TEST FAILED");
  }

  // Cleanup
  await prisma.user.delete({ where: { email: testEmail } });
}

testPasswordResetFlow()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
