const express = require("express");
const {
  createTestRequest,
    getAllTestRequests,
    getTestRequestById,
    deleteTestRequest,
} = require("../../controllers/Test_Request/testRequest.controller");

function createTestRequestRouter(prisma) {
  const router = express.Router();
  router.post("/", createTestRequest(prisma));
  router.get("/", getAllTestRequests(prisma));
  router.get("/:id", getTestRequestById(prisma));
  router.delete("/:id", deleteTestRequest(prisma));
  return router;
}
module.exports = { createTestRequestRouter };