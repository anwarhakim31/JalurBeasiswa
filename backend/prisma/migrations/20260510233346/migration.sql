/*
  Warnings:

  - You are about to drop the `MasterDataSistem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MasterDataUI` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MasterDataSistem";

-- DropTable
DROP TABLE "MasterDataUI";

-- CreateTable
CREATE TABLE "MasterData" (
    "id" TEXT NOT NULL,
    "namaWebsite" TEXT,
    "tagline" TEXT,
    "deskripsi" TEXT,
    "logo" TEXT,
    "favicon" TEXT,
    "telpon" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "unggahBerkas" BOOLEAN NOT NULL DEFAULT true,
    "bukaPendaftaran" BOOLEAN NOT NULL DEFAULT true,
    "modePemeliharaan" BOOLEAN NOT NULL DEFAULT false,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterData_pkey" PRIMARY KEY ("id")
);
