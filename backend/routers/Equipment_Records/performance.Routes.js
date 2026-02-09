const express = require('express');
const {
  getPerformancesByEquipmentId,
  getPerformanceById,
  createPerformance,
  updatePerformance,
  deletePerformance
} = require('../../controllers/Equipment_Records/performance.controller');

function createPerformanceRouter(prisma) {
  const router = express.Router();
  
  router.get('/equipment/:equipmentId', getPerformancesByEquipmentId(prisma));
  router.get('/:id', getPerformanceById(prisma));
  router.post('/:equipmentId', createPerformance(prisma));
  router.put('/:id', updatePerformance(prisma));
  router.delete('/:id', deletePerformance(prisma));
  
  return router;
}

module.exports = { createPerformanceRouter };