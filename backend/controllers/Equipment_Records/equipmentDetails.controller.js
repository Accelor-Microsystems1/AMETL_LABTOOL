const getAllEquipment = (prisma) => async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { equipmentId: { contains: search, mode: 'insensitive' } },
        { equipmentName: { contains: search, mode: 'insensitive' } },
        { manufacturerName: { contains: search, mode: 'insensitive' } },
        { equipmentSerialNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [equipments, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              calibrationRecords: true,
              performanceRecords: true,
              maintenanceRecords: true,
              incidentRecords: true
            }
          }
        }
      }),
      prisma.equipment.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Equipments fetched successfully',
      data: {
        equipments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

const getEquipmentById = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        calibrationRecords: {
          orderBy: { dateOfCalibration: 'desc' }
        },
        performanceRecords: {
          orderBy: { dateOfPerformanceCheck: 'desc' }
        },
        maintenanceRecords: {
          orderBy: { plannedDateOfMaintenance: 'desc' }
        },
        incidentRecords: {
          orderBy: { dateOfFailure: 'desc' }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    let isCalibrationDue = false;
    let daysUntilCalibration = null;

    if (equipment.calibrationRecords.length > 0) {
      const lastCalibration = equipment.calibrationRecords[0];
      const dueDate = new Date(lastCalibration.dueDate);
      const today = new Date();
      const diffTime = dueDate - today;
      daysUntilCalibration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isCalibrationDue = daysUntilCalibration <= 0;
    }

    const openIncidents = equipment.incidentRecords.filter(
      incident => incident.presentStatus === 'OPEN' || incident.presentStatus === 'UNDER_INVESTIGATION'
    ).length;

    return res.status(200).json({
      success: true,
      message: 'Equipment fetched successfully',
      data: {
        ...equipment,
        isCalibrationDue,
        daysUntilCalibration,
        openIncidentsCount: openIncidents
      }
    });

  } catch (error) {
    next(error);
  }
};

const createEquipment = (prisma) => async (req, res, next) => {
  try {
    const {
      equipmentId,
      equipmentName,
      manufacturerName,
      manufacturerModel,
      equipmentSerialNumber,
      range,
      installationQualification,
      operationalQualification,
      performanceQualification,
      status = 'ACTIVE',
    } = req.body;

    // Required fields (based on model)
    if (
      !equipmentId ||
      !equipmentName ||
      !manufacturerName ||
      !manufacturerModel ||
      !equipmentSerialNumber ||
      !range ||
      !installationQualification ||
      !operationalQualification ||
      !performanceQualification
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Unique checks
    const existingEquipment = await prisma.equipment.findUnique({
      where: { equipmentId },
    });

    if (existingEquipment) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID already exists',
      });
    }

    const existingSerial = await prisma.equipment.findUnique({
      where: { equipmentSerialNumber },
    });

    if (existingSerial) {
      return res.status(400).json({
        success: false,
        message: 'Equipment Serial Number already exists',
      });
    }

    const equipment = await prisma.equipment.create({
      data: {
        equipmentId,
        equipmentName,
        manufacturerName,
        manufacturerModel,
        equipmentSerialNumber,
        range,

        installationQualification: new Date(installationQualification),
        operationalQualification: new Date(operationalQualification),
        performanceQualification: new Date(performanceQualification),

        status,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

const updateEquipment = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      equipmentName,
      manufacturerName,
      manufacturerModel,
      equipmentSerialNumber,
      range,
      installationQualification,
      operationalQualification,
      performanceQualification,
      status,
    } = req.body;

    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    // Serial number uniqueness check
    if (
      equipmentSerialNumber &&
      equipmentSerialNumber !== existingEquipment.equipmentSerialNumber
    ) {
      const existingSerial = await prisma.equipment.findUnique({
        where: { equipmentSerialNumber },
      });

      if (existingSerial) {
        return res.status(400).json({
          success: false,
          message: 'Equipment Serial Number already exists',
        });
      }
    }

    const updateData = {};

    if (equipmentName) updateData.equipmentName = equipmentName;
    if (manufacturerName) updateData.manufacturerName = manufacturerName;
    if (manufacturerModel) updateData.manufacturerModel = manufacturerModel;
    if (equipmentSerialNumber)
      updateData.equipmentSerialNumber = equipmentSerialNumber;
    if (range) updateData.range = range;
    if (status) updateData.status = status;

    if (installationQualification) {
      updateData.installationQualification = new Date(
        installationQualification
      );
    }

    if (operationalQualification) {
      updateData.operationalQualification = new Date(
        operationalQualification
      );
    }

    if (performanceQualification) {
      updateData.performanceQualification = new Date(
        performanceQualification
      );
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEquipment = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            calibrationRecords: true,
            performanceRecords: true,
            maintenanceRecords: true,
            incidentRecords: true
          }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const totalRecords = 
      equipment._count.calibrationRecords +
      equipment._count.performanceRecords +
      equipment._count.maintenanceRecords +
      equipment._count.incidentRecords;
    await prisma.equipment.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully',
      data: {
        deletedEquipmentId: equipment.equipmentId,
        deletedRelatedRecords: totalRecords
      }
    });

  } catch (error) {
    next(error);
  }
};

const updateEquipmentStatus = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'UNDER_CALIBRATION', 'OUT_OF_ORDER', 'RETIRED'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validStatuses
      });
    }

    const existingEquipment = await prisma.equipment.findUnique({
      where: { id }
    });

    if (!existingEquipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json({
      success: true,
      message: 'Equipment status updated successfully',
      data: equipment
    });

  } catch (error) {
    next(error);
  }
};

const getDashboardStats = (prisma) => async (req, res, next) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [
      totalEquipments,
      activeEquipments,
      underMaintenance,
      calibrationsDueSoon,
      overdueCalibrations,
      openIncidents
    ] = await Promise.all([
      prisma.equipment.count(),
      prisma.equipment.count({ where: { status: 'ACTIVE' } }),      
      prisma.equipment.count({ where: { status: 'UNDER_MAINTENANCE' } }),
      prisma.calibrationRecord.count({
        where: {
          dueDate: {
            gte: today,
            lte: thirtyDaysFromNow
          }
        }
      }),
      
      prisma.calibrationRecord.count({
        where: {
          dueDate: { lt: today }
        }
      }),
      
      prisma.incidentRecord.count({
        where: {
          presentStatus: { in: ['OPEN', 'UNDER_INVESTIGATION'] }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats fetched successfully',
      data: {
        totalEquipments,
        activeEquipments,
        underMaintenance,
        calibrationsDueSoon,
        overdueCalibrations,
        openIncidents
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  updateEquipmentStatus,
  getDashboardStats
};
