const express = require('express');
const {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  updateEquipmentStatus,
  getDashboardStats
} = require('../../controllers/Equipment_Records/equipmentDetails.controller');
const { equipmentUpload } = require('../../middleware/upload');

function createEquipmentRouter(prisma) {
  const router = express.Router();
  
  router.get('/stats', getDashboardStats(prisma));
  router.get('/', getAllEquipment(prisma));
  router.get('/:id', getEquipmentById(prisma));
  router.post('/', equipmentUpload, createEquipment(prisma));
  router.put('/:id', equipmentUpload, updateEquipment(prisma));
  router.delete('/:id', deleteEquipment(prisma));
  router.patch('/:id/status', updateEquipmentStatus(prisma));
  
  return router;
}

module.exports = { createEquipmentRouter };