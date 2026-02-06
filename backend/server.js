// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Import routes
const { createAllEmployeesRouter } = require('./routers/User_Management/AllEmployees.routes');
const { createAuthRouter } = require('./routers/User_Management/auth.routes');
const { createTestRequestRouter } = require('./routers/TestRequestAndProjectDetails/testRequest.Routes');
const { createUutRoutes } = require('./routers/UutRecords/uutRecord.Routes');
const createProjectRoutes = require('./routers/ProjectRoute/projectRoutes');
const createTestRoutes = require('./routers/TestRoute/testRoutes'); // ← Check this path

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Debug: Check prisma
console.log('Prisma test model:', prisma.test ? '✅ Available' : '❌ Not found');

// App setup
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', createAllEmployeesRouter(prisma));
app.use('/api/auth', createAuthRouter(prisma));
app.use('/api/uut-records', createUutRoutes(prisma));

app.use('/api/test-requests', createTestRequestRouter(prisma));

app.use('/api/admin/projects', createProjectRoutes(prisma));
app.use('/api/admin/tests', createTestRoutes(prisma)); // ← Check this line

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server running' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});