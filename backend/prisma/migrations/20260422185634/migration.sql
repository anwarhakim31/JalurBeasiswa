/*
  Warnings:

  - You are about to drop the column `fullnamme` on the `Alternatif` table. All the data in the column will be lost.
  - Added the required column `fullname` to the `Alternatif` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Alternatif" DROP CONSTRAINT "Alternatif_beasiswaId_fkey";

-- DropForeignKey
ALTER TABLE "Alternatif" DROP CONSTRAINT "Alternatif_nim_fkey";

-- DropForeignKey
ALTER TABLE "Hasil" DROP CONSTRAINT "Hasil_alternativeId_fkey";

-- DropForeignKey
ALTER TABLE "Hasil" DROP CONSTRAINT "Hasil_beasiswaId_fkey";

-- DropForeignKey
ALTER TABLE "Kriteria" DROP CONSTRAINT "Kriteria_beasiswaId_fkey";

-- DropForeignKey
ALTER TABLE "nilaiAlternatif" DROP CONSTRAINT "nilaiAlternatif_alternativeId_fkey";

-- DropForeignKey
ALTER TABLE "nilaiAlternatif" DROP CONSTRAINT "nilaiAlternatif_kriteriaId_fkey";

-- AlterTable
ALTER TABLE "Alternatif" DROP COLUMN "fullnamme",
ADD COLUMN     "fullname" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Kriteria" ADD CONSTRAINT "Kriteria_beasiswaId_fkey" FOREIGN KEY ("beasiswaId") REFERENCES "Beasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternatif" ADD CONSTRAINT "Alternatif_nim_fkey" FOREIGN KEY ("nim") REFERENCES "Pengguna"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternatif" ADD CONSTRAINT "Alternatif_beasiswaId_fkey" FOREIGN KEY ("beasiswaId") REFERENCES "Beasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilaiAlternatif" ADD CONSTRAINT "nilaiAlternatif_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "Alternatif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilaiAlternatif" ADD CONSTRAINT "nilaiAlternatif_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hasil" ADD CONSTRAINT "Hasil_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "Alternatif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hasil" ADD CONSTRAINT "Hasil_beasiswaId_fkey" FOREIGN KEY ("beasiswaId") REFERENCES "Beasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
