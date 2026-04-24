/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Pengguna` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_email_key" ON "Pengguna"("email");
