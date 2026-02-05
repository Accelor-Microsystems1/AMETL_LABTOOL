const express = require('express');
const {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../../controllers/User_Management/AllEmployees.controller');

function createAllEmployeesRouter(prisma) {
  const router = express.Router();
  router.get('/', getAllEmployees(prisma));
  router.get('/:id', getEmployeeById(prisma));
  router.put('/:id', updateEmployee(prisma));
  router.delete('/:id', deleteEmployee(prisma));
  return router;
}

module.exports = { createAllEmployeesRouter };