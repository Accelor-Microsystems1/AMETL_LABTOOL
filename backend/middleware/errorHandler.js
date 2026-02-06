// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      error: 'Duplicate entry. Record already exists'
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
};

module.exports = errorHandler;