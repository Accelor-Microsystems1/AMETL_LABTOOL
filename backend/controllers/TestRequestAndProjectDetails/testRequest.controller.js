const createTestRequest = (prisma) => async (req, res) => {
  try {
    const data = {
      ...req.body,
      customerRepDate: new Date(req.body.customerRepDate),
      qaRepDate: req.body.qaRepDate ? new Date(req.body.qaRepDate) : null,
    };

    const testRequest = await prisma.testRequest.create({
      data: data,
    });

    res.status(201).json({
      success: true,
      data: testRequest,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllTestRequests = (prisma) => async (req, res) => {
  try {
    const testRequests = await prisma.testRequest.findMany();
    res.status(200).json(testRequests);
  }
    catch (error) { 
    res.status(500).json({ error: error.message });
  }
};

const getTestRequestById = (prisma) => async (req, res) => {
  try {
    const id = req.params.id;
    const testRequest = await prisma.testRequest.findUnique({
      where: { id },
    });
    if (testRequest) {
      res.status(200).json(testRequest);
    } else {
      res.status(404).json({ error: "Test request not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTestRequest = (prisma) => async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.testRequest.delete({
      where: { id },
    });
    res.status(204).send();
  }
    catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTestRequest,
  getAllTestRequests,
  getTestRequestById,
  deleteTestRequest,
};