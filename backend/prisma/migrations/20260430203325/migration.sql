/*
  Warnings:

  - The values [Tertunda] on the enum `StatusPengguna` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusPengguna_new" AS ENUM ('Diterima', 'Menunggu', 'Ditolak');
ALTER TABLE "public"."Pengguna" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Pengguna" ALTER COLUMN "status" TYPE "StatusPengguna_new" USING ("status"::text::"StatusPengguna_new");
ALTER TYPE "StatusPengguna" RENAME TO "StatusPengguna_old";
ALTER TYPE "StatusPengguna_new" RENAME TO "StatusPengguna";
DROP TYPE "public"."StatusPengguna_old";
ALTER TABLE "Pengguna" ALTER COLUMN "status" SET DEFAULT 'Menunggu';
COMMIT;

-- AlterTable
ALTER TABLE "Pengguna" ALTER COLUMN "status" SET DEFAULT 'Menunggu';
