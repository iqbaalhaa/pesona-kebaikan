/*
  Warnings:

  - You are about to drop the column `headerImage` on the `Blog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "headerImage",
ADD COLUMN     "heroImage" TEXT;
