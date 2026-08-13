/*
  Warnings:

  - You are about to drop the column `logo` on the `MasterData` table. All the data in the column will be lost.
  - Made the column `namaWebsite` on table `MasterData` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tagline` on table `MasterData` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deskripsi` on table `MasterData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MasterData" DROP COLUMN "logo",
ADD COLUMN     "logoKedua" TEXT,
ADD COLUMN     "logoUtama" TEXT,
ADD COLUMN     "websiteUtama" TEXT,
ALTER COLUMN "namaWebsite" SET NOT NULL,
ALTER COLUMN "tagline" SET NOT NULL,
ALTER COLUMN "deskripsi" SET NOT NULL;
