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
    "prodi" TEXT,
    "batch" INTEGER,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengguna_pkey" PRIMARY KEY ("nim")
);

-- CreateTable
CREATE TABLE "Beasiswa" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kriteria" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "creteriaType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "beasiswaCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alternatif" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "beasiswaCode" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alternatif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NilaiAlternatif" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "alternativeCode" TEXT NOT NULL,
    "kriteriaCode" TEXT NOT NULL,

    CONSTRAINT "NilaiAlternatif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hasil" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "alternativeCode" TEXT NOT NULL,
    "beasiswaCode" TEXT NOT NULL,

    CONSTRAINT "Hasil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_nim_key" ON "Pengguna"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_email_key" ON "Pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Beasiswa_code_key" ON "Beasiswa"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Kriteria_code_key" ON "Kriteria"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Alternatif_code_key" ON "Alternatif"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Alternatif_nim_beasiswaCode_key" ON "Alternatif"("nim", "beasiswaCode");

-- CreateIndex
CREATE UNIQUE INDEX "NilaiAlternatif_alternativeCode_kriteriaCode_key" ON "NilaiAlternatif"("alternativeCode", "kriteriaCode");

-- CreateIndex
CREATE UNIQUE INDEX "Hasil_alternativeCode_beasiswaCode_key" ON "Hasil"("alternativeCode", "beasiswaCode");

-- AddForeignKey
ALTER TABLE "Kriteria" ADD CONSTRAINT "Kriteria_beasiswaCode_fkey" FOREIGN KEY ("beasiswaCode") REFERENCES "Beasiswa"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternatif" ADD CONSTRAINT "Alternatif_nim_fkey" FOREIGN KEY ("nim") REFERENCES "Pengguna"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternatif" ADD CONSTRAINT "Alternatif_beasiswaCode_fkey" FOREIGN KEY ("beasiswaCode") REFERENCES "Beasiswa"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiAlternatif" ADD CONSTRAINT "NilaiAlternatif_alternativeCode_fkey" FOREIGN KEY ("alternativeCode") REFERENCES "Alternatif"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiAlternatif" ADD CONSTRAINT "NilaiAlternatif_kriteriaCode_fkey" FOREIGN KEY ("kriteriaCode") REFERENCES "Kriteria"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hasil" ADD CONSTRAINT "Hasil_alternativeCode_fkey" FOREIGN KEY ("alternativeCode") REFERENCES "Alternatif"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hasil" ADD CONSTRAINT "Hasil_beasiswaCode_fkey" FOREIGN KEY ("beasiswaCode") REFERENCES "Beasiswa"("code") ON DELETE CASCADE ON UPDATE CASCADE;
