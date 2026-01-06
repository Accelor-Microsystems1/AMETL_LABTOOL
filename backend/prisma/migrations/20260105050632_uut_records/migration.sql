-- CreateEnum
CREATE TYPE "UutType" AS ENUM ('AS', 'UT', 'BB');

-- CreateTable
CREATE TABLE "UutRecord" (
    "id" TEXT NOT NULL,
    "serialNo" TEXT NOT NULL,
    "challanNo" TEXT,
    "uutInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "testTypeName" TEXT NOT NULL,
    "testTypeCode" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "uutDescription" TEXT,
    "uutSrNo" TEXT,
    "uutQty" INTEGER NOT NULL DEFAULT 1,
    "uutType" "UutType" NOT NULL DEFAULT 'UT',
    "inDateDay" TIMESTAMP(3) NOT NULL,
    "serialOfDay" INTEGER NOT NULL,
    "uutCode" TEXT NOT NULL,
    "uutOutDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UutRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UutRecord_serialNo_key" ON "UutRecord"("serialNo");

-- CreateIndex
CREATE UNIQUE INDEX "UutRecord_uutCode_key" ON "UutRecord"("uutCode");

-- CreateIndex
CREATE INDEX "UutRecord_uutInDate_idx" ON "UutRecord"("uutInDate");

-- CreateIndex
CREATE INDEX "UutRecord_customerCode_idx" ON "UutRecord"("customerCode");

-- CreateIndex
CREATE INDEX "UutRecord_projectName_idx" ON "UutRecord"("projectName");

-- CreateIndex
CREATE INDEX "UutRecord_uutCode_idx" ON "UutRecord"("uutCode");

-- CreateIndex
CREATE UNIQUE INDEX "UutRecord_inDateDay_serialOfDay_key" ON "UutRecord"("inDateDay", "serialOfDay");
