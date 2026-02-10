-- CreateTable
CREATE TABLE "UutRecordTest" (
    "id" TEXT NOT NULL,
    "uutRecordId" TEXT NOT NULL,
    "testId" INTEGER NOT NULL,
    "testName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UutRecordTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UutRecordTest_uutRecordId_idx" ON "UutRecordTest"("uutRecordId");

-- CreateIndex
CREATE INDEX "UutRecordTest_testId_idx" ON "UutRecordTest"("testId");

-- AddForeignKey
ALTER TABLE "UutRecordTest" ADD CONSTRAINT "UutRecordTest_uutRecordId_fkey" FOREIGN KEY ("uutRecordId") REFERENCES "UutRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UutRecordTest" ADD CONSTRAINT "UutRecordTest_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
