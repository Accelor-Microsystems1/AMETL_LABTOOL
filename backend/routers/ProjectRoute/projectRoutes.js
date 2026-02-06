// routers/ProjectRoute/projectRoutes.js

const express = require('express');
const { validateProject } = require('../../middleware/validateRequest');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTests,
  getTestSpecification
} = require('../../controllers/Project_Controller/projectController');

const createProjectRoutes = (prisma) => {
  const router = express.Router();

  router.get('/', getAllProjects(prisma));
  router.get('/:id', getProjectById(prisma));
  router.post('/', validateProject, createProject(prisma));
  router.put('/:id', updateProject(prisma));
  router.delete('/:id', deleteProject(prisma));
  
  // For dropdown in request form
  router.get('/:projectId/tests', getProjectTests(prisma));
  router.get('/specification/:projectTestId', getTestSpecification(prisma));

  return router;
};

module.exports = createProjectRoutes;