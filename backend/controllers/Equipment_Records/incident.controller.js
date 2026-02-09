const getIncidentsByEquipmentId = (prisma) => async (req, res, next) => {
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

    const incidents = await prisma.incidentRecord.findMany({
      where: { equipmentId },
      orderBy: { dateOfFailure: 'desc' }
    });

    return res.status(200).json({
      success: true,
      message: 'Incident records fetched successfully',
      data: incidents
    });

  } catch (error) {
    next(error);
  }
};

const getIncidentById = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;

    const incident = await prisma.incidentRecord.findUnique({
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

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident record not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Incident record fetched successfully',
      data: incident
    });

  } catch (error) {
    next(error);
  }
};

const createIncident = (prisma) => async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const {
      dateOfFailure,
      typesOfProblemsObserved,
      causesOfFailures,
      correctiveActionTaken,
      presentStatus,
      statusDate,
    } = req.body;

    if (!dateOfFailure || !typesOfProblemsObserved || !causesOfFailures || !correctiveActionTaken || !presentStatus || !statusDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['dateOfFailure', 'typesOfProblemsObserved', 'causesOfFailures', 'correctiveActionTaken', 'presentStatus', 'statusDate']
      });
    }

    const validStatuses = ['OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(presentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validStatuses
      });
    }

    // Check if equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const incident = await prisma.incidentRecord.create({
      data: {
        equipmentId,
        dateOfFailure: new Date(dateOfFailure),
        typesOfProblemsObserved,
        causesOfFailures,
        correctiveActionTaken,
        presentStatus,
        statusDate: new Date(statusDate),
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Incident record created successfully',
      data: incident
    });

  } catch (error) {
    next(error);
  }
};

const updateIncident = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      dateOfFailure,
      typesOfProblemsObserved,
      causesOfFailures,
      correctiveActionTaken,
      presentStatus,
      statusDate
    } = req.body;

    const existingIncident = await prisma.incidentRecord.findUnique({
      where: { id }
    });

    if (!existingIncident) {
      return res.status(404).json({
        success: false,
        message: 'Incident record not found'
      });
    }

    if (presentStatus) {
      const validStatuses = ['OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED'];
      if (!validStatuses.includes(presentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
          validStatuses
        });
      }
    }

    const updateData = {};
    if (dateOfFailure) updateData.dateOfFailure = new Date(dateOfFailure);
    if (typesOfProblemsObserved) updateData.typesOfProblemsObserved = typesOfProblemsObserved;
    if (causesOfFailures) updateData.causesOfFailures = causesOfFailures;
    if (correctiveActionTaken) updateData.correctiveActionTaken = correctiveActionTaken;
    if (presentStatus) updateData.presentStatus = presentStatus;
    if (statusDate) updateData.statusDate = new Date(statusDate);

    const incident = await prisma.incidentRecord.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Incident record updated successfully',
      data: incident
    });

  } catch (error) {
    next(error);
  }
};

const deleteIncident = (prisma) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await prisma.incidentRecord.findUnique({
      where: { id }
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident record not found'
      });
    }

    await prisma.incidentRecord.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Incident record deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

const getOpenIncidents = (prisma) => async (req, res, next) => {
  try {
    const incidents = await prisma.incidentRecord.findMany({
      where: {
        presentStatus: {
          in: ['OPEN', 'UNDER_INVESTIGATION']
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
      orderBy: { dateOfFailure: 'desc' }
    });

    return res.status(200).json({
      success: true,
      message: 'Open incidents fetched successfully',
      data: incidents
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncidentsByEquipmentId,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  getOpenIncidents
};