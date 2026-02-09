const getCalibrationsByEquipmentId = (prisma) => async (req, res, next) => {
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

    const calibrations = await prisma.calibrationRecord.findMany({
      where: { equipmentId },
      orderBy: { dateOfCalibration: 'desc' }
    });

    return res.status(200).json({
      success: true,
      message: 'Calibration records fetched successfully',
      data: calibrations
    });

  } catch (error) {
    next(error);
  }
};

const getCalibrationById = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;

    const calibration = await prisma.calibrationRecord.findUnique({
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

    if (!calibration) {
      return res.status(404).json({
        success: false,
        message: 'Calibration record not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Calibration record fetched successfully',
      data: calibration
    });

  } catch (error) {
    next(error);
  }
};

const createCalibration = (prisma) => async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const {
      dateOfCalibration,
      dueDate,
      calibrationResult,
      certificateNo,
      createdBy
    } = req.body;

    if (!dateOfCalibration || !dueDate || !calibrationResult || !certificateNo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['dateOfCalibration', 'dueDate', 'calibrationResult', 'certificateNo']
      });
    }

    const validResults = ['PASS', 'FAIL', 'CONDITIONAL_PASS'];
    if (!validResults.includes(calibrationResult)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid calibration result',
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

    let certificateFile = null;
    if (req.file) {
      certificateFile = req.file.path;
    }

    const calibration = await prisma.calibrationRecord.create({
      data: {
        equipmentId,
        dateOfCalibration: new Date(dateOfCalibration),
        dueDate: new Date(dueDate),
        calibrationResult,
        certificateNo,
        certificateFile,
        createdBy: createdBy || null
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Calibration record created successfully',
      data: calibration
    });

  } catch (error) {
    next(error);
  }
};

const updateCalibration = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      dateOfCalibration,
      dueDate,
      calibrationResult,
      certificateNo
    } = req.body;

    const existingCalibration = await prisma.calibrationRecord.findUnique({
      where: { id }
    });

    if (!existingCalibration) {
      return res.status(404).json({
        success: false,
        message: 'Calibration record not found'
      });
    }
    if (calibrationResult) {
      const validResults = ['PASS', 'FAIL', 'CONDITIONAL_PASS'];
      if (!validResults.includes(calibrationResult)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid calibration result',
          validResults
        });
      }
    }

    const updateData = {};

    if (dateOfCalibration) updateData.dateOfCalibration = new Date(dateOfCalibration);
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (calibrationResult) updateData.calibrationResult = calibrationResult;
    if (certificateNo) updateData.certificateNo = certificateNo;

    if (req.file) {
      updateData.certificateFile = req.file.path;
    }
    const calibration = await prisma.calibrationRecord.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Calibration record updated successfully',
      data: calibration
    });

  } catch (error) {
    next(error);
  }
};

const deleteCalibration = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const calibration = await prisma.calibrationRecord.findUnique({
      where: { id }
    });

    if (!calibration) {
      return res.status(404).json({
        success: false,
        message: 'Calibration record not found'
      });
    }

    await prisma.calibrationRecord.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Calibration record deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

const getUpcomingCalibrations = (prisma) => async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const calibrations = await prisma.calibrationRecord.findMany({
      where: {
        dueDate: {
          gte: today,
          lte: futureDate
        }
      },
      include: {
        equipment: {
          select: {
            id: true,
            equipmentId: true,
            equipmentName: true,
            status: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const calibrationsWithDays = calibrations.map(cal => {
      const dueDate = new Date(cal.dueDate);
      const diffTime = dueDate - today;
      const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...cal,
        daysUntilDue
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Upcoming calibrations fetched successfully',
      data: calibrationsWithDays
    });

  } catch (error) {
    next(error);
  }
};

const getOverdueCalibrations = (prisma) => async (req, res, next) => {
  try {
    const today = new Date();

    const calibrations = await prisma.calibrationRecord.findMany({
      where: {
        dueDate: { lt: today }
      },
      include: {
        equipment: {
          select: {
            id: true,
            equipmentId: true,
            equipmentName: true,
            status: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const calibrationsWithDays = calibrations.map(cal => {
      const dueDate = new Date(cal.dueDate);
      const diffTime = today - dueDate;
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...cal,
        daysOverdue
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Overdue calibrations fetched successfully',
      data: calibrationsWithDays
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCalibrationsByEquipmentId,
  getCalibrationById,
  createCalibration,
  updateCalibration,
  deleteCalibration,
  getUpcomingCalibrations,
  getOverdueCalibrations
};