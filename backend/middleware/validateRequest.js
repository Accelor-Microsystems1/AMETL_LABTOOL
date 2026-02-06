// middleware/validateRequest.js

const validateProject = (req, res, next) => {
  const { projectName, projectTests } = req.body;

  if (!projectName || projectName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Project name is required'
    });
  }

  if (!projectTests || !Array.isArray(projectTests) || projectTests.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one test is required'
    });
  }

  for (let i = 0; i < projectTests.length; i++) {
    const test = projectTests[i];

    if (!test.testId) {
      return res.status(400).json({
        success: false,
        error: `Test #${i + 1}: Test ID is required`
      });
    }

    if (!test.specification || test.specification.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: `Test #${i + 1}: Specification is required`
      });
    }
  }

  // Check for duplicate tests
  const testIds = projectTests.map((t) => t.testId);
  const uniqueTestIds = [...new Set(testIds)];

  if (testIds.length !== uniqueTestIds.length) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate tests not allowed'
    });
  }

  next();
};

const validateTest = (req, res, next) => {
  const { testName } = req.body;

  if (!testName || testName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Test name is required'
    });
  }

  next();
};

module.exports = {
  validateProject,
  validateTest
};