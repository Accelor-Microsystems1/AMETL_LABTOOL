require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const { createAllEmployeesRouter } = require('./routers/User_Management/AllEmployees.routes');
const { createAuthRouter } = require('./routers/User_Management/auth.routes');
const {createUutRoutes} = require('./routers/UutRecords/uutRecord.Routes');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/employees', createAllEmployeesRouter(prisma));
app.use('/api/auth', createAuthRouter(prisma));
app.use('/api/uut-records', createUutRoutes(prisma))

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});