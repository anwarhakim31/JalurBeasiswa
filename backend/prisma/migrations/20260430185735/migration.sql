/*
  Warnings:

  - You are about to drop the column `weight` on the `Kriteria` table. All the data in the column will be lost.
  - Added the required column `bobot` to the `Kriteria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kriteria" DROP COLUMN "weight",
ADD COLUMN     "bobot" DOUBLE PRECISION NOT NULL;
