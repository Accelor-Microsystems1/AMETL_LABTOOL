/*
  Warnings:

  - You are about to drop the column `uutDescription` on the `UutRecord` table. All the data in the column will be lost.
  - You are about to drop the column `uutOutDate` on the `UutRecord` table. All the data in the column will be lost.
  - You are about to drop the column `uutSrNo` on the `UutRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[traceId]` on the table `UutRecord` will be added. If there are existing duplicate values, this will fail.
  - Made the column `challanNo` on table `UutRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'HOD';
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- DropIndex
DROP INDEX "UutRecord_serialNo_key";

-- AlterTable
ALTER TABLE "UutRecord" DROP COLUMN "uutDescription",
DROP COLUMN "uutOutDate",
DROP COLUMN "uutSrNo",
ADD COLUMN     "srNo" INTEGER,
ADD COLUMN     "traceId" TEXT,
ALTER COLUMN "challanNo" SET NOT NULL,
ALTER COLUMN "uutInDate" DROP DEFAULT,
ALTER COLUMN "uutQty" DROP DEFAULT,
ALTER COLUMN "uutType" DROP DEFAULT;

-- CreateTable
CREATE TABLE "UutOut" (
    "id" TEXT NOT NULL,
    "uutRecordId" TEXT NOT NULL,
    "outQty" INTEGER NOT NULL,
    "outDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UutOut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UutRecord_traceId_key" ON "UutRecord"("traceId");

-- AddForeignKey
ALTER TABLE "UutOut" ADD CONSTRAINT "UutOut_uutRecordId_fkey" FOREIGN KEY ("uutRecordId") REFERENCES "UutRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
