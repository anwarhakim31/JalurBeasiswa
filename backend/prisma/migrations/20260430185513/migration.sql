/*
  Warnings:

  - You are about to drop the column `name` on the `Beasiswa` table. All the data in the column will be lost.
  - Added the required column `nama` to the `Beasiswa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Beasiswa" DROP COLUMN "name",
ADD COLUMN     "nama" TEXT NOT NULL;
