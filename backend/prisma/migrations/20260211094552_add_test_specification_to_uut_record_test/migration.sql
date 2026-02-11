/*
  Warnings:

  - Added the required column `testSpecification` to the `UutRecordTest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UutRecordTest" ADD COLUMN     "testSpecification" TEXT NOT NULL;
