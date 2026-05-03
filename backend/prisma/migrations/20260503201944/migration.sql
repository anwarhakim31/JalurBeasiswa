/*
  Warnings:

  - You are about to drop the column `ranking` on the `Hasil` table. All the data in the column will be lost.
  - Added the required column `peringkat` to the `Hasil` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hasil" DROP COLUMN "ranking",
ADD COLUMN     "peringkat" INTEGER NOT NULL;
