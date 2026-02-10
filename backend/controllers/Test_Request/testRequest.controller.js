



// Get all requests (for admin or public view)
const getAllRequests = (prisma)=> async (req, res) => {
  try {
    const requests = await prisma.testRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get requests for logged-in user
const getMyRequests = (prisma)=> async (req, res) => {
  try {
    // Get user from auth middleware
    const userEmail = req.user.email;
    const userRole = req.user.role;

    let requests;

    if (userRole === 'ADMIN' || userRole === 'HOD') {
      // Admin/HOD sees all requests
      requests = await prisma.testRequest.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Customer sees only their requests
      requests = await prisma.testRequest.findMany({
        where: {
          customerEmail: userEmail
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single request by ID
const getRequestById = (prisma)=> async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.testRequest.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new request
const createRequest = (prisma)=> async (req, res) => {
  try {
    const userEmail = req.user.email;
    const requestData = {
      ...req.body,
      customerEmail: userEmail,
      status: 'PENDING'
    };

    const newRequest = await prisma.testRequest.create({
      data: requestData
    });

    res.status(201).json({
      success: true,
      data: newRequest
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update request status (Admin/HOD only)
const updateRequestStatus = (prisma)=> async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const userRole = req.user.role;
    const userName = req.user.name || req.user.email;

    // Check if user is admin or HOD
    if (userRole !== 'ADMIN' && userRole !== 'HOD') {
      return res.status(403).json({
        success: false,
        error: 'Only Admin/HOD can update request status'
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    // Add approval/rejection details based on status
    if (status === 'APPROVED') {
      updateData.approvedBy = userName;
      updateData.approvedAt = new Date();
    } else if (status === 'REJECTED') {
      updateData.rejectedBy = userName;
      updateData.rejectedAt = new Date();
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }

    const updatedRequest = await prisma.testRequest.update({
      where: {
        id: parseInt(id)
      },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete request
const deleteRequest = (prisma)=> async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    // First, get the request
    const request = await prisma.testRequest.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Check permissions
    if (userRole === 'CUSTOMER') {
      // Customers can only delete their own PENDING requests
      if (request.customerEmail !== userEmail) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own requests'
        });
      }
      if (request.status && request.status !== 'PENDING') {
        return res.status(403).json({
          success: false,
          error: 'You can only delete pending requests'
        });
      }
    }

    // Delete the request
    await prisma.testRequest.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllRequests,
  getMyRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  deleteRequest
};