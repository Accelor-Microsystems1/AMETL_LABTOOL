const express = require('express');
const {
  getIncidentsByEquipmentId,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  getOpenIncidents
} = require('../../controllers/Equipment_Records/incident.controller');

function createIncidentRouter(prisma) {
  const router = express.Router();
  
  router.get('/open', getOpenIncidents(prisma));
  router.get('/equipment/:equipmentId', getIncidentsByEquipmentId(prisma));
  router.get('/:id', getIncidentById(prisma));
  router.post('/:equipmentId', createIncident(prisma));
  router.put('/:id', updateIncident(prisma));
  router.delete('/:id', deleteIncident(prisma));
  
  return router;
}

module.exports = { createIncidentRouter };