const getPerformancesByEquipmentId = (prisma) => async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const performances = await prisma.performanceRecord.findMany({
      where: { equipmentId },
      orderBy: { dateOfPerformanceCheck: 'desc' }
    });

    return res.status(200).json({
      success: true,
      message: 'Performance records fetched successfully',
      data: performances
    });

  } catch (error) {
    next(error);
  }
};

const getPerformanceById = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;

    const performance = await prisma.performanceRecord.findUnique({
      where: { id },
      include: {
        equipment: {
          select: {
            id: true,
            equipmentId: true,
            equipmentName: true
          }
        }
      }
    });

    if (!performance) {
      return res.status(404).json({
        success: false,
        message: 'Performance record not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Performance record fetched successfully',
      data: performance
    });

  } catch (error) {
    next(error);
  }
};

const createPerformance = (prisma) => async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const {
      dateOfPerformanceCheck,
      nextPerformanceCheck,
      performanceCheckReportNo,
      result,
      createdBy
    } = req.body;

    if (!dateOfPerformanceCheck || !nextPerformanceCheck || !performanceCheckReportNo || !result) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['dateOfPerformanceCheck', 'nextPerformanceCheck', 'performanceCheckReportNo', 'result']
      });
    }

    const validResults = ['PASS', 'FAIL', 'OBSERVATION'];
    if (!validResults.includes(result)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result',
        validResults
      });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const performance = await prisma.performanceRecord.create({
      data: {
        equipmentId,
        dateOfPerformanceCheck: new Date(dateOfPerformanceCheck),
        nextPerformanceCheck: new Date(nextPerformanceCheck),
        performanceCheckReportNo,
        result,
        createdBy: createdBy || null
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Performance record created successfully',
      data: performance
    });

  } catch (error) {
    next(error);
  }
};

const updatePerformance = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      dateOfPerformanceCheck,
      nextPerformanceCheck,
      performanceCheckReportNo,
      result
    } = req.body;

    const existingPerformance = await prisma.performanceRecord.findUnique({
      where: { id }
    });

    if (!existingPerformance) {
      return res.status(404).json({
        success: false,
        message: 'Performance record not found'
      });
    }

    if (result) {
      const validResults = ['PASS', 'FAIL', 'OBSERVATION'];
      if (!validResults.includes(result)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid result',
          validResults
        });
      }
    }

    const updateData = {};
    if (dateOfPerformanceCheck) updateData.dateOfPerformanceCheck = new Date(dateOfPerformanceCheck);
    if (nextPerformanceCheck) updateData.nextPerformanceCheck = new Date(nextPerformanceCheck);
    if (performanceCheckReportNo) updateData.performanceCheckReportNo = performanceCheckReportNo;
    if (result) updateData.result = result;

    const performance = await prisma.performanceRecord.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Performance record updated successfully',
      data: performance
    });

  } catch (error) {
    next(error);
  }
};

const deletePerformance = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const performance = await prisma.performanceRecord.findUnique({
      where: { id }
    });

    if (!performance) {
      return res.status(404).json({
        success: false,
        message: 'Performance record not found'
      });
    }
    await prisma.performanceRecord.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Performance record deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPerformancesByEquipmentId,
  getPerformanceById,
  createPerformance,
  updatePerformance,
  deletePerformance
};