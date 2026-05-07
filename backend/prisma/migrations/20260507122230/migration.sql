-- CreateEnum
CREATE TYPE "StatusHasil" AS ENUM ('Disetujui', 'Ditolak', 'Diproses');

-- AlterTable
ALTER TABLE "Hasil" ADD COLUMN     "status" "StatusHasil" NOT NULL DEFAULT 'Diproses';
