/*
  Warnings:

  - You are about to drop the column `desription` on the `Beasiswa` table. All the data in the column will be lost.
  - Added the required column `description` to the `Beasiswa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Beasiswa" DROP COLUMN "desription",
ADD COLUMN     "description" TEXT NOT NULL;
