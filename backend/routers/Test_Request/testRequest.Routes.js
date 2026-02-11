// backend/routers/Test_Request/testRequest.Routes.js

const express = require("express");
const { authMiddleware, requireRole } = require("../../middleware/auth");
const {
  getAllRequests,
  getMyRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  deleteRequest,
  getApprovedRequests,
} = require("../../controllers/Test_Request/testRequest.controller");

function createTestRequestRouter(prisma) {
  const router = express.Router();

  // Get all requests
  router.get("/", getAllRequests(prisma));

  // Get approved requests
  router.get('/approved-requests', getApprovedRequests(prisma));

  // Get logged-in user's requests
  router.get("/my-requests", authMiddleware, getMyRequests(prisma));

  // Get single request by ID
  router.get("/:id", getRequestById(prisma));

  // Create new request
  router.post("/", authMiddleware, createRequest(prisma));

  // Update request status (Admin/HOD only)
  router.put(
    "/:id/status",
    authMiddleware,
    requireRole("ADMIN", "HOD"),
    updateRequestStatus(prisma)
  );

  // Delete request
  router.delete("/:id", authMiddleware, deleteRequest(prisma));

  return router;
}

// ✅ Direct export (not destructured)
module.exports = createTestRequestRouter;