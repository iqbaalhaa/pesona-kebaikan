-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CampaignMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EWALLET', 'VIRTUAL_ACCOUNT', 'TRANSFER', 'CARD');

-- CreateTable
CREATE TABLE "CampaignCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "target" DECIMAL(19,2) NOT NULL,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "status" "CampaignStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignMedia" (
    "id" TEXT NOT NULL,
    "type" "CampaignMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "isThumbnail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "CampaignMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorPhone" TEXT,
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(19,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignCategory_name_key" ON "CampaignCategory"("name");

-- CreateIndex
CREATE INDEX "Campaign_categoryId_idx" ON "Campaign"("categoryId");

-- CreateIndex
CREATE INDEX "Campaign_createdById_idx" ON "Campaign"("createdById");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "CampaignMedia_campaignId_idx" ON "CampaignMedia"("campaignId");

-- CreateIndex
CREATE INDEX "Donation_campaignId_idx" ON "Donation"("campaignId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CampaignCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMedia" ADD CONSTRAINT "CampaignMedia_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
