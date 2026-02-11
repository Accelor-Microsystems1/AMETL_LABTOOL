const {
  generateCustomerCode,
  getStartOfDay,
  buildUutCode,
} = require("../../utils/uutCodeGenerator");

const getAllRecords = (prisma) => async (req, res) => {
  try {
    const { search, customerName, projectName, status } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { serialNo: { contains: search, mode: "insensitive" } },
        { uutCode: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (customerName) {
      where.customerName = { contains: customerName, mode: "insensitive" };
    }
    if (projectName) {
      where.projectName = { contains: projectName, mode: "insensitive" };
    }

    if (status === "in") {
      where.outs = { none: {} };
    } else if (status === "out") {
      where.outs = { some: {} };
    }

    const records = await prisma.uutRecord.findMany({
      where,
      include: {
        outs: {
          orderBy: { outDate: "desc" },
          take: 1,
        },
        uutTests: {  
          select: {
            id: true,
            testId: true,
            testName: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const formattedRecords = records.map((record) => ({
      ...record,
      uutOutDate: record.outs.length > 0 ? record.outs[0].outDate : null,
      outQty: record.outs.length > 0 ? record.outs[0].outQty : null,
      remarks: record.outs.length > 0 ? record.outs[0].remarks : null,
    }));

    res.json({
      success: true,
      count: formattedRecords.length,
      data: formattedRecords,
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getRecordById = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.uutRecord.findUnique({
      where: { id },
      include: { 
        outs: true,
        uutTests: true 
      },
    });

    if (!record) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error("Error fetching record:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const getRecordByIdentifier = (prisma) => async (req, res) => {
  try {
    const { identifier } = req.params;
    const record = await prisma.uutRecord.findFirst({
      where: {
        OR: [{ serialNo: identifier }, { uutCode: identifier }],
      },
      include: {
        outs: {
          orderBy: { outDate: "desc" },
          take: 1,
        },
        uutTests: true  
      },
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    const formattedRecord = {
      ...record,
      uutOutDate: record.outs.length > 0 ? record.outs[0].outDate : null,
      outQty: record.outs.length > 0 ? record.outs[0].outQty : null,
      remarks: record.outs.length > 0 ? record.outs[0].remarks : null,
    };

    res.json({
      success: true,
      data: formattedRecord,
    });
  } catch (error) {
    console.error("Error fetching record:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const previewUutCode = (prisma) => async (req, res) => {
  try {
    console.log("📍 Preview request received");
    console.log("📍 Body:", req.body);
    
    const { 
      serialNo, 
      projectName,
      uutInDate, 
      customerCode, 
      testTypeCode, 
      uutType 
    } = req.body;
    if (!serialNo || !projectName || !uutInDate || !customerCode || !testTypeCode || !uutType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const existingRecord = await prisma.uutRecord.findFirst({
      where: {
        projectName: projectName,
        serialNo: serialNo
      },
      include: {
        outs: true  
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("🔍 Existing record check:", existingRecord ? "Found" : "Not found");
    if (existingRecord && existingRecord.outs.length === 0) {
      return res.status(400).json({
        success: false,
        error: `Serial "${serialNo}" for project "${projectName}" is already in lab (UUT Code: ${existingRecord.uutCode}). Please create UUT Out record before re-entry.`,
        existingUutCode: existingRecord.uutCode,
        code: "DUPLICATE_ENTRY"
      });
    }
    if (existingRecord && existingRecord.outs.length > 0) {
      console.log("✅ Re-entry allowed - UUT was dispatched");
    }

    const date = new Date(uutInDate);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const lastRecord = await prisma.uutRecord.findFirst({
      where: {
        uutInDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { serialOfDay: 'desc' }
    });

    const serialOfDay = (lastRecord?.serialOfDay || 0) + 1;
    const serialStr = String(serialOfDay).padStart(4, '0');
    const uutCode = `${year}/${testTypeCode}${customerCode}/${uutType}/${day}-${month}/${serialStr}`;

    console.log("✅ UUT Code generated:", uutCode);

    res.json({
      success: true,
      data: {
        uutCode,
        serialOfDay,
        customerCode,
        isReEntry: existingRecord ? true : false 
      }
    });

  } catch (error) {
    console.error("❌ Preview error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate preview",
      message: error.message
    });
  }
};

const createRecord = (prisma) => async (req, res) => {
  try {
    const {
      serialNo,
      projectName,
      challanNo,
      uutInDate,
      customerName,
      customerCode,
      testTypeName,
      testTypeCode,
      uutQty,
      uutType,
      contactPersonName,
      expectedUutCode,
      tests = []
    } = req.body;

    console.log("📍 Creating UUT Record...");

    const result = await prisma.$transaction(async (tx) => {
      
      const existingRecord = await tx.uutRecord.findFirst({
        where: {
          projectName: projectName,
          serialNo: serialNo
        },
        include: {
          outs: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      if (existingRecord && existingRecord.outs.length === 0) {
        throw {
          code: "DUPLICATE_ENTRY",
          message: `Serial "${serialNo}" for project "${projectName}" is already in lab.`
        };
      }
      const validTests = [];
      
      for (const test of tests) {
        if (!test.testId && !test.testName) continue;
        
        let testRecord = null;

        if (test.testId) {
          testRecord = await tx.test.findUnique({
            where: { id: parseInt(test.testId) }
          });
        }

        if (!testRecord && test.testName) {
          testRecord = await tx.test.findFirst({
            where: {
              testName: {
                equals: test.testName,
                mode: 'insensitive'
              }
            }
          });
        }

        if (!testRecord && test.testName) {
          testRecord = await tx.test.create({
            data: {
              testName: test.testName,
              testCode: test.testName.charAt(0).toUpperCase()
            }
          });
        }

        if (testRecord) {
          validTests.push({
            testId: testRecord.id,
            testName: testRecord.testName,
            testSpecification: test.testSpecification || ""
          });
        }
      }
      const date = new Date(uutInDate);
      const year = String(date.getFullYear()).slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const lastRecord = await tx.uutRecord.findFirst({
        where: {
          uutInDate: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        orderBy: { serialOfDay: 'desc' }
      });

      const serialOfDay = (lastRecord?.serialOfDay || 0) + 1;
      const serialStr = String(serialOfDay).padStart(4, '0');

      const uutCode = `${year}/${testTypeCode}${customerCode}/${uutType}/${day}-${month}/${serialStr}`;

      if (expectedUutCode && expectedUutCode !== uutCode) {
        throw {
          code: "UUT_CODE_CHANGED",
          message: "UUT code changed due to concurrent activity"
        };
      }

      const uutRecord = await tx.uutRecord.create({
        data: {
          serialNo,
          challanNo,
          uutInDate: date,
          customerName,
          customerCode,
          testTypeName,
          testTypeCode,
          projectName,
          uutQty: parseInt(uutQty),
          uutType,
          serialOfDay,
          uutCode
        }
      });

      console.log("✅ UUT Record created:", uutRecord.uutCode);
      for (const test of validTests) {
        await tx.uutRecordTest.create({
          data: {
            uutRecordId: uutRecord.id,
            testId: test.testId,
            testName: test.testName,
            testSpecification: test.testSpecification
          }
        });
      }
      const testIds = validTests.map(t => t.testId);
      
      const updatedRequests = await tx.testRequest.updateMany({
        where: {
          uutName: projectName,
          uutSerialNo: serialNo,
          testId: { in: testIds },
          status: "APPROVED"
        },
        data: {
          status: "RECEIVED",
          updatedAt: new Date()
        }
      });

      console.log(`✅ Updated ${updatedRequests.count} TestRequest(s) to RECEIVED`);
      const completeRecord = await tx.uutRecord.findUnique({
        where: { id: uutRecord.id },
        include: {
          uutTests: {
            include: { test: true }
          }
        }
      });

      return {
        uutRecord: completeRecord,
        updatedRequestsCount: updatedRequests.count,
        isReEntry: existingRecord ? true : false
      };
    });

    res.json({
      success: true,
      data: result.uutRecord,
      updatedRequests: result.updatedRequestsCount,
      isReEntry: result.isReEntry,
      message: result.isReEntry 
        ? `UUT re-entered successfully. ${result.updatedRequestsCount} request(s) marked as RECEIVED.`
        : `UUT Record created. ${result.updatedRequestsCount} request(s) marked as RECEIVED.`
    });

  } catch (error) {
    console.error("❌ Error:", error);
    
    if (error.code === "UUT_CODE_CHANGED") {
      return res.status(409).json({
        success: false,
        code: "UUT_CODE_CHANGED",
        error: error.message
      });
    }
    
    if (error.code === "DUPLICATE_ENTRY") {
      return res.status(400).json({
        success: false,
        code: "DUPLICATE_ENTRY",
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to create UUT Record",
      message: error.message
    });
  }
};

const updateRecord = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;
    const {
      challanNo,
      customerName,
      testTypeName,
      testTypeCode,
      projectName,
      uutDescription,
      uutSrNo,
      uutQty,
    } = req.body;

    const updateData = {};

    if (challanNo !== undefined) updateData.challanNo = challanNo;
    if (customerName !== undefined) {
      updateData.customerName = customerName;
      updateData.customerCode = generateCustomerCode(customerName);
    }
    if (testTypeName !== undefined) updateData.testTypeName = testTypeName;
    if (testTypeCode !== undefined)
      updateData.testTypeCode = testTypeCode.toUpperCase();
    if (projectName !== undefined) updateData.projectName = projectName;
    if (uutDescription !== undefined)
      updateData.uutDescription = uutDescription;
    if (uutSrNo !== undefined) updateData.uutSrNo = uutSrNo;
    if (uutQty !== undefined) updateData.uutQty = Number(uutQty);

    const updated = await prisma.uutRecord.update({
      where: { id },
      data: updateData,
      include: {
        uutTests: true
      }
    });

    res.json({
      success: true,
      data: updated,
      message: "Record updated successfully",
    });
  } catch (error) {
    console.error("Error updating record:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const checkoutRecord = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;
    const { outDate, outQty, remarks } = req.body;

    if (!outDate) {
      return res.status(400).json({
        success: false,
        error: "Out Date is required",
      });
    }

    if (!outQty || outQty <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid Out Quantity is required",
      });
    }

    const record = await prisma.uutRecord.findUnique({
      where: { id },
      include: { outs: true },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }
    
    const totalOutSoFar = record.outs.reduce(
      (sum, out) => sum + (out.outQty || 0),
      0
    );
    
    if (totalOutSoFar + outQty > record.uutQty) {
      return res.status(400).json({
        success: false,
        error: `Cannot checkout ${outQty} units. Only ${
          record.uutQty - totalOutSoFar
        } units remaining.`,
      });
    }
    
    const uutOut = await prisma.uutOut.create({
      data: {
        uutRecordId: record.id,
        outDate: new Date(outDate),
        outQty: Number(outQty),
        remarks: remarks || null,
      },
    });
    
    const updatedRecord = await prisma.uutRecord.findUnique({
      where: { id },
      include: { 
        outs: true,
        uutTests: true 
      },
    });
    
    res.json({
      success: true,
      data: updatedRecord,
      message: "UUT checked out successfully",
    });
  } catch (error) {
    console.error("Error checking out record:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

const deleteRecord = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.uutOut.deleteMany({
      where: { uutRecordId: id },
    });

    await prisma.uutRecord.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting record:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getStats = (prisma) => async (req, res) => {
  try {
    const [totalRecords, inLab, checkedOut, todayRecords] = await Promise.all([
      prisma.uutRecord.count(),
      prisma.uutRecord.count({ where: { outs: { none: {} } } }),
      prisma.uutRecord.count({ where: { outs: { some: {} } } }),
      prisma.uutRecord.count({
        where: {
          uutInDate: {
            gte: getStartOfDay(new Date()),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalRecords,
        inLab,
        checkedOut,
        todayRecords,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getProjectNames = (prisma) => async (req, res) => {
  try {
    const projects = await prisma.uutRecord.findMany({
      distinct: ["projectName"],
      select: {
        projectName: true,
      },
      orderBy: {
        projectName: "asc",
      },
    });

    const projectNames = projects
      .filter(p => p.projectName && p.projectName.trim())
      .map(p => p.projectName);

    res.json({
      success: true,
      data: projectNames,
    });
  } catch (error) {
    console.error("Error fetching project names:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getSerialNumbersByProject = (prisma) => async (req, res) => {
  try {
    const { projectName } = req.params;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        error: "Project name is required",
      });
    }

    const records = await prisma.uutRecord.findMany({
      where: {
        projectName: {
          equals: projectName,
          mode: "insensitive",
        },
      },
      select: {
        serialNo: true,
        customerName: true,
        testTypeName: true,
        uutType: true,
        uutTests: {  
          select: {
            testName: true
          }
        }
      },
      orderBy: {
        serialNo: "asc",
      },
    });

    const serialNumbers = records.map(r => ({
      serialNo: r.serialNo,
      customerName: r.customerName,
      testTypeName: r.testTypeName,
      uutType: r.uutType,
      tests: r.uutTests.map(t => t.testName),
    }));

    res.json({
      success: true,
      data: serialNumbers,
    });
  } catch (error) {
    console.error("Error fetching serial numbers by project:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getProjectBySerialNumber = (prisma) => async (req, res) => {
  try {
    const { serialNo } = req.params;

    if (!serialNo) {
      return res.status(400).json({
        success: false,
        error: "Serial number is required",
      });
    }

    const record = await prisma.uutRecord.findFirst({
      where: {
        serialNo: {
          equals: serialNo,
          mode: "insensitive",
        },
      },
      select: {
        projectName: true,
        serialNo: true,
        customerName: true,
        customerCode: true,
        testTypeName: true,
        testTypeCode: true,
        uutType: true,
        uutQty: true,
        contactPersonName: true,
        uutTests: { 
          select: {
            id: true,
            testId: true,
            testName: true
          }
        }
      },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Serial number not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Error fetching project by serial number:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllRecords,
  getRecordById,
  getRecordByIdentifier,
  previewUutCode,
  createRecord,
  updateRecord,
  checkoutRecord,
  deleteRecord,
  getStats,
  getProjectNames,
  getSerialNumbersByProject,
  getProjectBySerialNumber,
};