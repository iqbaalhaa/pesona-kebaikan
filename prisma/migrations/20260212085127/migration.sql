/*
  Warnings:

  - A unique constraint covering the columns `[referenceNo]` on the table `Withdrawal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "referenceNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_referenceNo_key" ON "Withdrawal"("referenceNo");
