// routers/TestRoute/testRoutes.js

const express = require('express');
const { validateTest } = require('../../middleware/validateRequest');
const {
  getAllTests,
  createTest,
  updateTest,
  deleteTest
} = require('../../controllers/Test_Controller/TestController');

const createTestRoutes = (prisma) => {
  const router = express.Router();

  router.get('/', getAllTests(prisma));
  router.post('/', validateTest, createTest(prisma));
  router.put('/:id', validateTest, updateTest(prisma));
  router.delete('/:id', deleteTest(prisma));

  return router;
};

module.exports = createTestRoutes;