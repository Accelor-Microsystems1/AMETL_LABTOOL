// controllers/testController.js

// GET ALL TESTS
const getAllTests = (prisma) => async (req, res) => {
  try {
    const tests = await prisma.Test.findMany({
      orderBy: { testName: 'asc' },
      select: {
        id: true,
        testName: true,
        createdAt: true,
        _count: {
          select: { projectTests: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tests'
    });
  }
};

// CREATE NEW TEST
const createTest = (prisma) => async (req, res) => {
  try {
    const { testName } = req.body;

    // Check if test already exists
    const existingTest = await prisma.Test.findUnique({
      where: { testName: testName.trim() }
    });

    if (existingTest) {
      return res.status(400).json({
        success: false,
        error: 'Test with this name already exists'
      });
    }

    const test = await prisma.Test.create({
      data: {
        testName: testName.trim()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test
    });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test'
    });
  }
};

// UPDATE TEST
const updateTest = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;
    const { testName } = req.body;

    const test = await prisma.Test.update({
      where: { id: parseInt(id) },
      data: { testName: testName.trim() }
    });

    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      data: test
    });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update test'
    });
  }
};

// DELETE TEST
const deleteTest = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;

    // Check if test is being used
    const usageCount = await prisma.projectTest.count({
      where: { testId: parseInt(id) }
    });

    if (usageCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete. Test is used in ${usageCount} project(s)`
      });
    }

    await prisma.Test.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete test'
    });
  }
};

module.exports = {
  getAllTests,
  createTest,
  updateTest,
  deleteTest
};