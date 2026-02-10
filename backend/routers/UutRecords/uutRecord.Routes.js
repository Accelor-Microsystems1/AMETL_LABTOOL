const express = require("express");
const {
  getAllRecords,
  getRecordById,
  getRecordByIdentifier,
  previewUutCode,
  createRecord,
  updateRecord,
  checkoutRecord,
  deleteRecord,
  getStats,
  getProjectNames,
  getSerialNumbersByProject,
  getProjectBySerialNumber,
} = require("../../controllers/UUTRecord/uutRecordsController.js");

function createUutRoutes(prisma) {
  const router = express.Router();

  router.get("/stats", getStats(prisma));

  // Dropdown endpoints
  router.get("/dropdown/projects", getProjectNames(prisma));
  router.get("/dropdown/serials/:projectName", getSerialNumbersByProject(prisma));
  router.get("/dropdown/project-by-serial/:serialNo", getProjectBySerialNumber(prisma));

  router.get("/", getAllRecords(prisma));

  router.post("/preview", previewUutCode(prisma));

  router.post("/", createRecord(prisma));

  router.get("/id/:id", getRecordById(prisma));

  router.get("/search/:identifier", getRecordByIdentifier(prisma));

  router.put("/:id", updateRecord(prisma));

  router.put("/:id/checkout", checkoutRecord(prisma));

  router.delete("/:id", deleteRecord(prisma));

  return router;
}
module.exports = { createUutRoutes };
