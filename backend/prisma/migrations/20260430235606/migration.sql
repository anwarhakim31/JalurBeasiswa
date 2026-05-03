/*
  Warnings:

  - You are about to drop the column `aktif` on the `Beasiswa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Beasiswa" DROP COLUMN "aktif",
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
