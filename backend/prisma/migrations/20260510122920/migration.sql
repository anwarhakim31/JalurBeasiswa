-- CreateTable
CREATE TABLE "MasterDataSistem" (
    "id" TEXT NOT NULL,
    "uploadEnabled" BOOLEAN NOT NULL DEFAULT true,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterDataSistem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterDataUI" (
    "id" TEXT NOT NULL,
    "namaWebsite" TEXT NOT NULL,
    "tagline" TEXT,
    "deskripsi" TEXT,
    "logo" TEXT,
    "favicon" TEXT,
    "telpon" TEXT NOT NULL,
    "email" TEXT,
    "instagram" TEXT,
    "footerText" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterDataUI_pkey" PRIMARY KEY ("id")
);
