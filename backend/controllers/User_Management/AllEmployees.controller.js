const bcrypt = require('bcryptjs');
const getAllEmployees = (prisma) => async (req, res) => {
  try {
    const users = await prisma.User.findMany({}, "-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEmployeeById = (prisma) => async (req, res) => {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEmployee = (prisma) => async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // password: false - Don't include password in response
      },
    });

    res.status(200).json({
      message: 'Employee updated successfully',
      employee: updatedUser,
    });

  } catch (error) {
    console.error(error);

    // Handle Prisma specific errors
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email already exists' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteEmployee = (prisma) => async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
};