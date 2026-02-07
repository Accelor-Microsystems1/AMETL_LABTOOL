// controllers/Test_Request/testRequest.controller.js

// ============================================
// GET ALL REQUESTS (For HOD)
// ============================================
const getAllRequests = (prisma) => async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const requests = await prisma.testRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        referenceNumber: true,
        companyName: true,
        contactPerson: true,
        contactNumber: true,
        customerEmail: true,
        uutName: true,
        noOfUUT: true,
        uutSerialNo: true,
        calculatedQuantity: true,
        testName: true,
        testSpecification: true,
        testStandard: true,
        status: true,
        createdAt: true,
      }
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests'
    });
  }
};

// ============================================
// GET REQUESTS BY CUSTOMER EMAIL
// ============================================
const getRequestsByCustomer = (prisma) => async (req, res) => {
  try {
    const { email } = req.params;

    const requests = await prisma.testRequest.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        referenceNumber: true,
        uutName: true,
        testName: true,
        uutSerialNo: true,
        calculatedQuantity: true,
        status: true,
        createdAt: true,
        rejectionReason: true,
      }
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching customer requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests'
    });
  }
};

// ============================================
// GET SINGLE REQUEST BY ID
// ============================================
const getRequestById = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.testRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch request'
    });
  }
};

// ============================================
// UPDATE REQUEST STATUS (Approve/Reject)
// ============================================
const updateRequestStatus = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, approvedBy } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    // If rejecting, require reason
    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'APPROVED') {
      updateData.approvedBy = approvedBy || null;
      updateData.approvedAt = new Date();
    }

    if (status === 'REJECTED') {
      updateData.rejectionReason = rejectionReason;
    }

    const request = await prisma.testRequest.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: request
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update request status'
    });
  }
};

// ============================================
// CREATE TEST REQUEST (Updated with status)
// ============================================
const createTestRequest = (prisma) => async (req, res) => {
  try {
    const data = {
      ...req.body,
      customerRepDate: new Date(req.body.customerRepDate),
      qaRepDate: req.body.qaRepDate ? new Date(req.body.qaRepDate) : null,
      status: 'PENDING'  // ✅ Default status
    };

    const testRequest = await prisma.testRequest.create({
      data
    });

    res.status(201).json({
      success: true,
      message: 'Test request created successfully',
      data: testRequest
    });
  } catch (error) {
    console.error('Error creating test request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test request'
    });
  }
};

module.exports = {
  getAllRequests,
  getRequestsByCustomer,
  getRequestById,
  updateRequestStatus,
  createTestRequest
};