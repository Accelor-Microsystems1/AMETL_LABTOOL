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
} = require("../../controllers/UUTRecord/uutRecordsController.js");

function createUutRoutes(prisma) {
  const router = express.Router();

  router.get("/stats", getStats(prisma));

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
