const {
  generateCustomerCode,
  getStartOfDay,
  buildUutCode,
} = require('../../utils/uutCodeGenerator');

const getAllRecords = (prisma) => async (req, res) => {
  try {
    const { search, customerName, projectName, status } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { serialNo: { contains: search, mode: 'insensitive' } },
        { uutCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (customerName) {
      where.customerName = { contains: customerName, mode: 'insensitive' };
    }
    if (projectName) {
      where.projectName = { contains: projectName, mode: 'insensitive' };
    }

    if (status === 'in') {
      where.outs = { none: {} };
    } else if (status === 'out') {
      where.outs = { some: {} };
    }

    const records = await prisma.uutRecord.findMany({
      where,
      include: {
        outs: {
          orderBy: { outDate: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const formattedRecords = records.map(record => ({
      ...record,
      uutOutDate: record.outs.length > 0 ? record.outs[0].outDate : null,
      outQty: record.outs.length > 0 ? record.outs[0].outQty : null,
      remarks: record.outs.length > 0 ? record.outs[0].remarks : null,
    }));

    res.json({
      success: true,
      count: formattedRecords.length,
      data: formattedRecords
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getRecordById = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;
    const record = await prisma.uutRecord.findUnique({
      where: { id },
      include: {
        outs: {
          orderBy: { outDate: 'desc' },
          take: 1
        }
      }
    });
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
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
      data: formattedRecord
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getRecordByIdentifier = (prisma) => async (req, res) => {
  try {
    const { identifier } = req.params;
    const record = await prisma.uutRecord.findFirst({
      where: {
        OR: [
          { serialNo: identifier },
          { uutCode: identifier }
        ]
      },
      include: {
        outs: {
          orderBy: { outDate: 'desc' },
          take: 1
        }
      }
    });
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
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
      data: formattedRecord
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const previewUutCode = (prisma) => async (req, res) => {
    try {
    const {
      serialNo,
      challanNo,
      uutInDate,
      customerName,
      testTypeName,
      testTypeCode,
      projectName,
      uutDescription,
      uutType,
      uutSrNo,
      uutQty
    } = req.body;
    if (!serialNo || !customerName || !testTypeName || !testTypeCode || !projectName || !uutType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: serialNo, customerName, testTypeName, testTypeCode, projectName, uutType'
      });
    }

    if (testTypeCode.length !== 1) {
      return res.status(400).json({
        success: false,
        error: 'testTypeCode must be a single letter'
      });
    }

    const existingSerial = await prisma.uutRecord.findUnique({
      where: { serialNo }
    });

    if (existingSerial) {
      return res.status(400).json({
        success: false,
        error: `Serial No. '${serialNo}' already exists`
      });
    }

    const inDate = uutInDate ? new Date(uutInDate) : new Date();
    const inDateDay = getStartOfDay(inDate);

    const customerCode = generateCustomerCode(customerName);

    const maxSerial = await prisma.uutRecord.aggregate({
      where: { inDateDay },
      _max: { serialOfDay: true }
    });

    const nextSerialOfDay = (maxSerial._max.serialOfDay || 0) + 1;

    if (nextSerialOfDay > 9999) {
      return res.status(400).json({
        success: false,
        error: 'Daily serial number exceeded 9999. Cannot create more records for this date.'
      });
    }

    const uutCode = buildUutCode({
      inDate,
      testCode: testTypeCode.toUpperCase(),
      customerCode,
      uutType,
      serialOfDay: nextSerialOfDay
    });

    res.json({
      success: true,
      data: {
        serialNo,
        challanNo: challanNo || null,
        uutInDate: inDate.toISOString(),
        customerName,
        customerCode,
        testTypeName,
        testTypeCode: testTypeCode.toUpperCase(),
        projectName,
        uutDescription: uutDescription || null,
        uutType,
        uutSrNo: uutSrNo || null,
        uutQty: Number(uutQty || 1),
        serialOfDay: nextSerialOfDay,
        uutCode
      },
      note: 'This is a preview. UUT code may change if another record is created before you confirm.'
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createRecord = (prisma) => async (req, res) => {
  try {
    const {
      serialNo,
      challanNo,
      uutInDate,
      customerName,
      testTypeName,
      testTypeCode,
      projectName,
      uutType,
      uutQty,
      expectedUutCode  
    } = req.body;

    if (!serialNo || !customerName || !testTypeName || !testTypeCode || !projectName || !uutType || !expectedUutCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (including expectedUutCode from preview)'
      });
    }

    const inDate = uutInDate ? new Date(uutInDate) : new Date();
    const inDateDay = getStartOfDay(inDate);
    const customerCode = generateCustomerCode(customerName);

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const created = await prisma.$transaction(async (tx) => {
          const maxSerial = await tx.uutRecord.aggregate({
            where: { inDateDay },
            _max: { serialOfDay: true }
          });

          const nextSerialOfDay = (maxSerial._max.serialOfDay || 0) + 1;

          if (nextSerialOfDay > 9999) {
            throw new Error('Daily serial exceeded 9999');
          }

          const uutCode = buildUutCode({
            inDate,
            testCode: testTypeCode.toUpperCase(),
            customerCode,
            uutType,
            serialOfDay: nextSerialOfDay
          });

          if (uutCode !== expectedUutCode) {
            const err = new Error('UUT code changed. Please preview again.');
            err.code = 'UUT_CODE_CHANGED';
            throw err;
          }

          return tx.uutRecord.create({
            data: {
              serialNo,
              challanNo: challanNo || null,
              uutInDate: inDate,
              inDateDay,
              customerName,
              customerCode,
              testTypeName,
              testTypeCode: testTypeCode.toUpperCase(),
              projectName,
              uutType,
              uutQty: Number(uutQty || 1),
              serialOfDay: nextSerialOfDay,
              uutCode,
              createdById: req.user?.userId
            }
          });
        });

        return res.status(201).json({
          success: true,
          data: created,
          message: `UUT record created successfully with code: ${created.uutCode}`
        });

      } catch (error) {
        if (error.code === 'P2002') {
          if (attempts < maxAttempts) continue;
          return res.status(409).json({
            success: false,
            error: 'Conflict creating record. Please try again.'
          });
        }

        if (error.code === 'UUT_CODE_CHANGED') {
          return res.status(409).json({
            success: false,
            error: error.message,
            code: 'UUT_CODE_CHANGED'
          });
        }

        throw error;
      }
    }

    return res.status(409).json({
      success: false,
      error: 'Too many concurrent requests. Please try again.'
    });

  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({
      success: false,
      error: error.message
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
      uutQty
    } = req.body;

    const updateData = {};
    
    if (challanNo !== undefined) updateData.challanNo = challanNo;
    if (customerName !== undefined) {
      updateData.customerName = customerName;
      updateData.customerCode = generateCustomerCode(customerName);
    }
    if (testTypeName !== undefined) updateData.testTypeName = testTypeName;
    if (testTypeCode !== undefined) updateData.testTypeCode = testTypeCode.toUpperCase();
    if (projectName !== undefined) updateData.projectName = projectName;
    if (uutDescription !== undefined) updateData.uutDescription = uutDescription;
    if (uutSrNo !== undefined) updateData.uutSrNo = uutSrNo;
    if (uutQty !== undefined) updateData.uutQty = Number(uutQty);

    const updated = await prisma.uutRecord.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updated,
      message: 'Record updated successfully'
    });
  } catch (error) {
    console.error('Error updating record:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
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
        error: 'Out Date is required'
      });
    }

    const record = await prisma.uutRecord.findUnique({
      where: { id },
      include: { outs: true }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    if (record.outs.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'This unit has already been checked out'
      });
    }

    const uutOut = await prisma.uutOut.create({
      data: {
        uutRecordId: record.id,
        outDate: new Date(outDate),
        outQty: outQty ? Number(outQty) : null,
        remarks: remarks || null
      }
    });

    res.json({
      success: true,
      data: {
        ...record,
        uutOutDate: uutOut.outDate,
        outQty: uutOut.outQty,
        remarks: uutOut.remarks
      },
      message: 'UUT checked out successfully'
    });
  } catch (error) {
    console.error('Error checking out record:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const deleteRecord = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.uutOut.deleteMany({
      where: { uutRecordId: id }
    });

    await prisma.uutRecord.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getStats = (prisma) => async (req, res) => {
  try {
    const [
      totalRecords,
      inLab,
      checkedOut,
      todayRecords
    ] = await Promise.all([
      prisma.uutRecord.count(),
      prisma.uutRecord.count({ where: { outs: { none: {} } } }),
      prisma.uutRecord.count({ where: { outs: { some: {} } } }),
      prisma.uutRecord.count({
        where: {
          uutInDate: {
            gte: getStartOfDay(new Date())
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalRecords,
        inLab,
        checkedOut,
        todayRecords
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
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
};