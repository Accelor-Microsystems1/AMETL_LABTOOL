-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "projectName" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL,
    "testName" VARCHAR(100) NOT NULL,
    "testCode" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTest" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "specification" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestRequest" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "uutName" TEXT NOT NULL,
    "noOfUUT" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "uutSerialNo" TEXT NOT NULL,
    "calculatedQuantity" INTEGER,
    "repeatTest" TEXT NOT NULL DEFAULT 'no',
    "previousRefNo" TEXT,
    "testLevel" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "testSpecification" TEXT NOT NULL,
    "testStandard" TEXT NOT NULL,
    "specialRequirement" TEXT,
    "customerRepName" TEXT NOT NULL,
    "customerRepDate" TIMESTAMP(3) NOT NULL,
    "qaRepName" TEXT,
    "qaRepDate" TIMESTAMP(3),
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectName_key" ON "Project"("projectName");

-- CreateIndex
CREATE UNIQUE INDEX "Test_testName_key" ON "Test"("testName");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTest_projectId_testId_key" ON "ProjectTest"("projectId", "testId");

-- CreateIndex
CREATE UNIQUE INDEX "TestRequest_referenceNumber_key" ON "TestRequest"("referenceNumber");

-- CreateIndex
CREATE INDEX "TestRequest_companyName_idx" ON "TestRequest"("companyName");

-- CreateIndex
CREATE INDEX "TestRequest_customerEmail_idx" ON "TestRequest"("customerEmail");

-- CreateIndex
CREATE INDEX "TestRequest_status_idx" ON "TestRequest"("status");

-- CreateIndex
CREATE INDEX "TestRequest_createdAt_idx" ON "TestRequest"("createdAt");

-- CreateIndex
CREATE INDEX "TestRequest_testLevel_idx" ON "TestRequest"("testLevel");

-- AddForeignKey
ALTER TABLE "ProjectTest" ADD CONSTRAINT "ProjectTest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTest" ADD CONSTRAINT "ProjectTest_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
