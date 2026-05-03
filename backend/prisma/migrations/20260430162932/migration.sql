-- CreateEnum
CREATE TYPE "StatusPengguna" AS ENUM ('Diterima', 'Tertunda', 'Ditolak');

-- CreateEnum
CREATE TYPE "TipeKriteria" AS ENUM ('Keuntungan', 'Biaya');

-- CreateTable
CREATE TABLE "Pengguna" (
    "nim" VARCHAR(32) NOT NULL,
    "email" TEXT NOT NULL,
    "namaLengkap" TEXT,
    "kataSandi" TEXT NOT NULL,
    "foto" TEXT,
    "status" "StatusPengguna" NOT NULL DEFAULT 'Tertunda',
    "prodi" TEXT,
    "angkatan" INTEGER,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengguna_pkey" PRIMARY KEY ("nim")
);

-- CreateTable
CREATE TABLE "Beasiswa" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kriteria" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "TipeKriteria" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "kodeBeasiswa" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alternatif" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "kodeBeasiswa" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alternatif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NilaiAlternatif" (
    "id" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "kodeAlternatif" TEXT NOT NULL,
    "kodeKriteria" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NilaiAlternatif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hasil" (
    "id" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "ranking" INTEGER NOT NULL,
    "kodeAlternatif" TEXT NOT NULL,
    "kodeBeasiswa" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hasil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_nim_key" ON "Pengguna"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_email_key" ON "Pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Beasiswa_kode_key" ON "Beasiswa"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Kriteria_kode_key" ON "Kriteria"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Alternatif_kode_key" ON "Alternatif"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Alternatif_nim_kodeBeasiswa_key" ON "Alternatif"("nim", "kodeBeasiswa");

-- CreateIndex
CREATE UNIQUE INDEX "NilaiAlternatif_kodeAlternatif_kodeKriteria_key" ON "NilaiAlternatif"("kodeAlternatif", "kodeKriteria");

-- CreateIndex
CREATE UNIQUE INDEX "Hasil_kodeAlternatif_kodeBeasiswa_key" ON "Hasil"("kodeAlternatif", "kodeBeasiswa");

-- AddForeignKey
ALTER TABLE "Kriteria" ADD CONSTRAINT "Kriteria_kodeBeasiswa_fkey" FOREIGN KEY ("kodeBeasiswa") REFERENCES "Beasiswa"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternatif" ADD CONSTRAINT "Alternatif_nim_fkey" FOREIGN KEY ("nim") REFERENCES "Pengguna"("nim") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternatif" ADD CONSTRAINT "Alternatif_kodeBeasiswa_fkey" FOREIGN KEY ("kodeBeasiswa") REFERENCES "Beasiswa"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiAlternatif" ADD CONSTRAINT "NilaiAlternatif_kodeAlternatif_fkey" FOREIGN KEY ("kodeAlternatif") REFERENCES "Alternatif"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilaiAlternatif" ADD CONSTRAINT "NilaiAlternatif_kodeKriteria_fkey" FOREIGN KEY ("kodeKriteria") REFERENCES "Kriteria"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hasil" ADD CONSTRAINT "Hasil_kodeAlternatif_fkey" FOREIGN KEY ("kodeAlternatif") REFERENCES "Alternatif"("kode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hasil" ADD CONSTRAINT "Hasil_kodeBeasiswa_fkey" FOREIGN KEY ("kodeBeasiswa") REFERENCES "Beasiswa"("kode") ON DELETE CASCADE ON UPDATE CASCADE;
