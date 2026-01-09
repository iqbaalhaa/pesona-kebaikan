-- CreateTable
CREATE TABLE "Amiin" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Amiin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Amiin_donationId_idx" ON "Amiin"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "Amiin_userId_donationId_key" ON "Amiin"("userId", "donationId");

-- CreateIndex
CREATE UNIQUE INDEX "Amiin_sessionId_donationId_key" ON "Amiin"("sessionId", "donationId");

-- AddForeignKey
ALTER TABLE "Amiin" ADD CONSTRAINT "Amiin_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amiin" ADD CONSTRAINT "Amiin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
