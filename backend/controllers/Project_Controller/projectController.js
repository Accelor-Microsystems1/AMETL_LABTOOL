// controllers/projectController.js

// GET ALL PROJECTS
const getAllProjects = (prisma) => async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        projectTests: {
          include: {
            test: {
              select: {
                id: true,
                testName: true
              }
            }
          }
        },
        _count: {
          select: { projectTests: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
};

// GET SINGLE PROJECT
const getProjectById = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        projectTests: {
          include: {
            test: true
          }
        },
        _count: {
          select: { projectTests: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
};

// CREATE PROJECT WITH TESTS
const createProject = (prisma) => async (req, res) => {
  try {
    const { projectName, projectTests } = req.body;

    // Check if project already exists
    const existingProject = await prisma.project.findUnique({
      where: { projectName: projectName.trim() }
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        error: 'Project with this name already exists'
      });
    }

    // Create project with tests in transaction
    const project = await prisma.$transaction(async (tx) => {
      // Create project
      const newProject = await tx.project.create({
        data: {
          projectName: projectName.trim()
        }
      });

      // Create project-test relationships
      const projectTestsData = projectTests.map((test) => ({
        projectId: newProject.id,
        testId: parseInt(test.testId),
        specification: test.specification.trim()
      }));

      await tx.projectTest.createMany({
        data: projectTestsData
      });

      return newProject;
    });

    // Fetch complete project with relations
    const completeProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        projectTests: {
          include: {
            test: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: completeProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
};

// UPDATE PROJECT
const updateProject = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName, projectTests } = req.body;

    await prisma.$transaction(async (tx) => {
      // Update project name if provided
      if (projectName) {
        await tx.project.update({
          where: { id: parseInt(id) },
          data: { projectName: projectName.trim() }
        });
      }

      // If tests provided, replace all existing tests
      if (projectTests && projectTests.length > 0) {
        await tx.projectTest.deleteMany({
          where: { projectId: parseInt(id) }
        });

        const projectTestsData = projectTests.map((test) => ({
          projectId: parseInt(id),
          testId: parseInt(test.testId),
          specification: test.specification.trim()
        }));

        await tx.projectTest.createMany({
          data: projectTestsData
        });
      }
    });

    // Fetch updated project
    const updatedProject = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        projectTests: {
          include: {
            test: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    });
  }
};

// DELETE PROJECT
const deleteProject = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project has test requests
    const requestCount = await prisma.testRequest.count({
      where: { projectId: parseInt(id) }
    });

    if (requestCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete. Project has ${requestCount} test request(s)`
      });
    }

    await prisma.project.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
};

// GET TESTS BY PROJECT ID (For Dropdown)
const getProjectTests = (prisma) => async (req, res) => {
  try {
    const { projectId } = req.params;

    const tests = await prisma.projectTest.findMany({
      where: { projectId: parseInt(projectId) },
      include: {
        test: {
          select: {
            id: true,
            testName: true
          }
        }
      },
      orderBy: {
        test: {
          testName: 'asc'
        }
      }
    });

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    console.error('Error fetching project tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project tests'
    });
  }
};

// GET SPECIFICATION BY PROJECT_TEST_ID
const getTestSpecification = (prisma) => async (req, res) => {
  try {
    const { projectTestId } = req.params;

    const specification = await prisma.projectTest.findUnique({
      where: { id: parseInt(projectTestId) },
      select: {
        id: true,
        specification: true
      }
    });

    if (!specification) {
      return res.status(404).json({
        success: false,
        error: 'Specification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: specification
    });
  } catch (error) {
    console.error('Error fetching specification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch specification'
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTests,
  getTestSpecification
};