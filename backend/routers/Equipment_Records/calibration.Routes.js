const express = require('express');
const {
  getCalibrationsByEquipmentId,
  getCalibrationById,
  createCalibration,
  updateCalibration,
  deleteCalibration,
  getUpcomingCalibrations,
  getOverdueCalibrations
} = require('../../controllers/Equipment_Records/calibration.controller');
const { certificateUpload } = require('../../middleware/upload');

function createCalibrationRouter(prisma) {
  const router = express.Router();
  
  router.get('/upcoming', getUpcomingCalibrations(prisma));
  router.get('/overdue', getOverdueCalibrations(prisma));
  router.get('/equipment/:equipmentId', getCalibrationsByEquipmentId(prisma));
  router.get('/:id', getCalibrationById(prisma));
  router.post('/:equipmentId', certificateUpload, createCalibration(prisma));
  router.put('/:id', certificateUpload, updateCalibration(prisma));
  router.delete('/:id', deleteCalibration(prisma));
  
  return router;
}

module.exports = { createCalibrationRouter };