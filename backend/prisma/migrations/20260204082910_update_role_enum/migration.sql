/*
  Warnings:

  - The values [USER,VIEWER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `inDateDay` on the `UutRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serialNo]` on the table `UutRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uutInDate,serialOfDay]` on the table `UutRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('HOD', 'ADMIN', 'MANAGER', 'TESTENGINEER', 'JUNIORENGINEER', 'CUSTOMER', 'CEO');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'JUNIORENGINEER';
COMMIT;

-- DropIndex
DROP INDEX "UutRecord_inDateDay_serialOfDay_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'JUNIORENGINEER';

-- AlterTable
ALTER TABLE "UutRecord" DROP COLUMN "inDateDay";

-- CreateIndex
CREATE UNIQUE INDEX "UutRecord_serialNo_key" ON "UutRecord"("serialNo");

-- CreateIndex
CREATE UNIQUE INDEX "UutRecord_uutInDate_serialOfDay_key" ON "UutRecord"("uutInDate", "serialOfDay");
