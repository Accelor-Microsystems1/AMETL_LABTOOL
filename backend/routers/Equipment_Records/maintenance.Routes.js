const express = require('express');
const {
  getMaintenancesByEquipmentId,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
} = require('../../controllers/Equipment_Records/maintenance.controller');

function createMaintenanceRouter(prisma) {
  const router = express.Router();
  
  router.get('/equipment/:equipmentId', getMaintenancesByEquipmentId(prisma));
  router.get('/:id', getMaintenanceById(prisma));
  router.post('/:equipmentId', createMaintenance(prisma));
  router.put('/:id', updateMaintenance(prisma));
  router.delete('/:id', deleteMaintenance(prisma));
  
  return router;
}

module.exports = { createMaintenanceRouter };