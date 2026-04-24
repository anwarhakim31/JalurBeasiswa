-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACCEPT', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "creteriaType" AS ENUM ('BENEFIT', 'COST');

-- CreateTable
CREATE TABLE "Pengguna" (
    "nim" VARCHAR(32) NOT NULL,
    "email" TEXT NOT NULL,
    "fullname" TEXT,
    "password" TEXT NOT NULL,
    "photo" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengguna_pkey" PRIMARY KEY ("nim")
);

-- CreateTable
CREATE TABLE "Beasiswa" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desription" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kriteria" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "creteriaType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "beasiswaId" TEXT NOT NULL,

    CONSTRAINT "Kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alternatif" (
    "id" TEXT NOT NULL,
    "beasiswaId" TEXT NOT NULL,
    "fullnamme" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "angkatan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alternatif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilaiAlternatif" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "alternativeId" TEXT NOT NULL,
    "kriteriaId" TEXT NOT NULL,

    CONSTRAINT "nilaiAlternatif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hasil" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "alternativeId" TEXT NOT NULL,
    "beasiswaId" TEXT NOT NULL,

    CONSTRAINT "Hasil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_nim_key" ON "Pengguna"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "Alternatif_nim_beasiswaId_key" ON "Alternatif"("nim", "beasiswaId");

-- CreateIndex
CREATE UNIQUE INDEX "nilaiAlternatif_alternativeId_kriteriaId_key" ON "nilaiAlternatif"("alternativeId", "kriteriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Hasil_alternativeId_beasiswaId_key" ON "Hasil"("alternativeId", "beasiswaId");

-- AddForeignKey
ALTER TABLE "Kriteria" ADD CONSTRAINT "Kriteria_beasiswaId_fkey" FOREIGN KEY ("beasiswaId") REFERENCES "Beasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternatif" ADD CONSTRAINT "Alternatif_nim_fkey" FOREIGN KEY ("nim") REFERENCES "Pengguna"("nim") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternatif" ADD CONSTRAINT "Alternatif_beasiswaId_fkey" FOREIGN KEY ("beasiswaId") REFERENCES "Beasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilaiAlternatif" ADD CONSTRAINT "nilaiAlternatif_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "Alternatif"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilaiAlternatif" ADD CONSTRAINT "nilaiAlternatif_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hasil" ADD CONSTRAINT "Hasil_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "Alternatif"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hasil" ADD CONSTRAINT "Hasil_beasiswaId_fkey" FOREIGN KEY ("beasiswaId") REFERENCES "Beasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
