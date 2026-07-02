const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const connectedUsers = new Map();

const initializeSocket = (io) => {
    
}