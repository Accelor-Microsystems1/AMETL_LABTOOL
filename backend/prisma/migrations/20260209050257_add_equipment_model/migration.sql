-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'UNDER_CALIBRATION');

-- CreateEnum
CREATE TYPE "CalibrationResult" AS ENUM ('PASS', 'FAIL', 'CONDITIONAL_PASS');

-- CreateEnum
CREATE TYPE "PerformanceResult" AS ENUM ('PASS', 'FAIL', 'OBSERVATION');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "equipment_name" TEXT NOT NULL,
    "manufacturer_name" TEXT NOT NULL,
    "manufacturer_model" TEXT NOT NULL,
    "equipment_serial_number" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "installation_qualification" TIMESTAMP(3) NOT NULL,
    "operational_qualification" TIMESTAMP(3) NOT NULL,
    "performance_qualification" TIMESTAMP(3) NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calibration_records" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "date_of_calibration" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "calibration_result" "CalibrationResult" NOT NULL,
    "certificate_no" TEXT NOT NULL,
    "certificate_file" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calibration_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_records" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "date_of_performance_check" TIMESTAMP(3) NOT NULL,
    "next_performance_check" TIMESTAMP(3) NOT NULL,
    "performance_check_report_no" TEXT NOT NULL,
    "result" "PerformanceResult" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "planned_date_of_maintenance" TIMESTAMP(3) NOT NULL,
    "condition_based_next_maintenance" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_records" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "date_of_failure" TIMESTAMP(3) NOT NULL,
    "types_of_problems_observed" TEXT NOT NULL,
    "causes_of_failures" TEXT NOT NULL,
    "corrective_action_taken" TEXT NOT NULL,
    "present_status" "IncidentStatus" NOT NULL,
    "status_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipments_equipment_id_key" ON "equipments"("equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_equipment_serial_number_key" ON "equipments"("equipment_serial_number");

-- CreateIndex
CREATE INDEX "equipments_equipment_name_idx" ON "equipments"("equipment_name");

-- CreateIndex
CREATE INDEX "equipments_status_idx" ON "equipments"("status");

-- CreateIndex
CREATE INDEX "calibration_records_equipment_id_idx" ON "calibration_records"("equipment_id");

-- CreateIndex
CREATE INDEX "calibration_records_date_of_calibration_idx" ON "calibration_records"("date_of_calibration");

-- CreateIndex
CREATE INDEX "calibration_records_due_date_idx" ON "calibration_records"("due_date");

-- CreateIndex
CREATE INDEX "performance_records_equipment_id_idx" ON "performance_records"("equipment_id");

-- CreateIndex
CREATE INDEX "performance_records_date_of_performance_check_idx" ON "performance_records"("date_of_performance_check");

-- CreateIndex
CREATE INDEX "performance_records_next_performance_check_idx" ON "performance_records"("next_performance_check");

-- CreateIndex
CREATE INDEX "maintenance_records_equipment_id_idx" ON "maintenance_records"("equipment_id");

-- CreateIndex
CREATE INDEX "maintenance_records_planned_date_of_maintenance_idx" ON "maintenance_records"("planned_date_of_maintenance");

-- CreateIndex
CREATE INDEX "maintenance_records_status_idx" ON "maintenance_records"("status");

-- CreateIndex
CREATE INDEX "incident_records_equipment_id_idx" ON "incident_records"("equipment_id");

-- CreateIndex
CREATE INDEX "incident_records_date_of_failure_idx" ON "incident_records"("date_of_failure");

-- CreateIndex
CREATE INDEX "incident_records_present_status_idx" ON "incident_records"("present_status");

-- AddForeignKey
ALTER TABLE "calibration_records" ADD CONSTRAINT "calibration_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_records" ADD CONSTRAINT "performance_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_records" ADD CONSTRAINT "incident_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
