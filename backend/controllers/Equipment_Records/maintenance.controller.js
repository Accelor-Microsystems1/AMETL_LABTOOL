const getMaintenancesByEquipmentId = (prisma) => async (req, res, next) => {
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

    const maintenances = await prisma.maintenanceRecord.findMany({
      where: { equipmentId },
      orderBy: { plannedDateOfMaintenance: 'desc' }
    });

    return res.status(200).json({
      success: true,
      message: 'Maintenance records fetched successfully',
      data: maintenances
    });

  } catch (error) {
    next(error);
  }
};

const getMaintenanceById = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;

    const maintenance = await prisma.maintenanceRecord.findUnique({
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

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Maintenance record fetched successfully',
      data: maintenance
    });

  } catch (error) {
    next(error);
  }
};

const createMaintenance = (prisma) => async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const {
      plannedDateOfMaintenance,
      conditionBasedNextMaintenance,
      status,
      remark,
      createdBy
    } = req.body;

    if (!plannedDateOfMaintenance || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['plannedDateOfMaintenance', 'status']
      });
    }

    const validStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validStatuses
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

    const maintenance = await prisma.maintenanceRecord.create({
      data: {
        equipmentId,
        plannedDateOfMaintenance: new Date(plannedDateOfMaintenance),
        conditionBasedNextMaintenance: conditionBasedNextMaintenance 
          ? new Date(conditionBasedNextMaintenance) 
          : null,
        status,
        remark: remark || null,
        createdBy: createdBy || null
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: maintenance
    });

  } catch (error) {
    next(error);
  }
};

const updateMaintenance = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      plannedDateOfMaintenance,
      conditionBasedNextMaintenance,
      status,
      remark
    } = req.body;

    const existingMaintenance = await prisma.maintenanceRecord.findUnique({
      where: { id }
    });

    if (!existingMaintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    if (status) {
      const validStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
          validStatuses
        });
      }
    }

    const updateData = {};

    if (plannedDateOfMaintenance) updateData.plannedDateOfMaintenance = new Date(plannedDateOfMaintenance);
    if (conditionBasedNextMaintenance !== undefined) {
      updateData.conditionBasedNextMaintenance = conditionBasedNextMaintenance 
        ? new Date(conditionBasedNextMaintenance) 
        : null;
    }
    if (status) updateData.status = status;
    if (remark !== undefined) updateData.remark = remark;

    const maintenance = await prisma.maintenanceRecord.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: maintenance
    });

  } catch (error) {
    next(error);
  }
};

const deleteMaintenance = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const maintenance = await prisma.maintenanceRecord.findUnique({
      where: { id }
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    await prisma.maintenanceRecord.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenancesByEquipmentId,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
};