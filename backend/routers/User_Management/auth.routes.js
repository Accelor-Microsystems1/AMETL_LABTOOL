const express = require("express");
const {
  registerUser,
  loginUser,
} = require("../../controllers/User_Management/auth.controller");

function createAuthRouter(prisma) {
    const router = express.Router();
    router.post("/register", registerUser(prisma));
    router.post("/login", loginUser(prisma));
    return router;
}
module.exports = { createAuthRouter };