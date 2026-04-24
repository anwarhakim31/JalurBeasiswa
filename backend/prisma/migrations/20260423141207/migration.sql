/*
  Warnings:

  - You are about to drop the `nilaiAlternatif` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "nilaiAlternatif" DROP CONSTRAINT "nilaiAlternatif_alternativeId_fkey";

-- DropForeignKey
ALTER TABLE "nilaiAlternatif" DROP CONSTRAINT "nilaiAlternatif_kriteriaId_fkey";

-- DropTable
DROP TABLE "nilaiAlternatif";

-- CreateTable
CREATE TABLE "NilaiAlternatif" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "alternativeId" TEXT NOT NULL,
    "kriteriaId" TEXT NOT NULL,

    CONSTRAINT "NilaiAlternatif_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NilaiAlternatif_alternativeId_kriteriaId_key" ON "NilaiAlternatif"("alternativeId", "kriteriaId");

-- AddForeignKey
ALTER TABLE "NilaiAlternatif" ADD CONSTRAINT "NilaiAlternatif_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "Alternatif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiAlternatif" ADD CONSTRAINT "NilaiAlternatif_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
