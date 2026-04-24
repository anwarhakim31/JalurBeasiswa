/*
  Warnings:

  - You are about to drop the column `angkatan` on the `Alternatif` table. All the data in the column will be lost.
  - You are about to drop the column `prodi` on the `Alternatif` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Alternatif" DROP COLUMN "angkatan",
DROP COLUMN "prodi";

-- AlterTable
ALTER TABLE "Pengguna" ADD COLUMN     "batch" INTEGER,
ADD COLUMN     "prodi" TEXT;
