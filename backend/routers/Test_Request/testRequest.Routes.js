// routers/TestRequest/testRequestRoutes.js

const express = require('express');
const {
  getAllRequests,
  getRequestsByCustomer,
  getRequestById,
  updateRequestStatus,
  createTestRequest
} = require('../../controllers/Test_Request/testRequest.controller');

const createTestRequestRoutes = (prisma) => {
  const router = express.Router();

  // Get all requests (HOD dashboard)
  router.get('/', getAllRequests(prisma));

  // Get requests by customer email
  router.get('/customer/:email', getRequestsByCustomer(prisma));

  // Get single request by ID
  router.get('/:id', getRequestById(prisma));

  // Create new request
  router.post('/', createTestRequest(prisma));

  // Update request status (Approve/Reject)
  router.patch('/:id/status', updateRequestStatus(prisma));

  return router;
};

module.exports = createTestRequestRoutes;