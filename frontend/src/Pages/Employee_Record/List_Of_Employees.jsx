import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Register from "./Register";
import { useAuth } from "../../components/authentication/authContext";
import Pagination from "../../components/customizedComponents/Paginations";
import {
  FiUsers,
  FiUserCheck,
  FiUserPlus,
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiLoader,
  FiInbox,
  FiBriefcase,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { toast } from "sonner";

const List_Of_Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  
  const user = useAuth();

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/employees`;

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    setFirst(0);
  }, [searchQuery]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = user.token;
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    }
    setLoading(false);
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const token = user.token;
        await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Employee deleted successfully");
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast.error("Failed to delete employee");
      }
    }
  };

  // Handle Edit
  const handleEdit = (employee) => {
    setSelectedEmployee({
      ...employee,
    });
    setChangePassword(false);
    setNewPassword("");
    setShowPassword(false);
    setShowEditModal(true);
  };

  // Update employee
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = user.token;

      const updateData = {
        name: selectedEmployee.name,
        email: selectedEmployee.email,
        role: selectedEmployee.role,
      };

      if (changePassword && newPassword.trim() !== "") {
        updateData.password = newPassword;
      }

      await axios.put(
        `${API_URL}/${selectedEmployee._id || selectedEmployee.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Employee updated successfully");
      setShowEditModal(false);
      setChangePassword(false);
      setNewPassword("");
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    }
  };

  // Handle successful registration
  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    fetchEmployees();
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
    setChangePassword(false);
    setNewPassword("");
    setShowPassword(false);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (employee) =>
        employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const paginatedEmployees = useMemo(() => {
    return filteredEmployees.slice(first, first + rows);
  }, [filteredEmployees, first, rows]);

  const handlePageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const getRoleBadgeColor = (role) => {
    const roleColors = {
      CEO: "bg-purple-100 text-purple-800",
      HOD: "bg-indigo-100 text-indigo-800",
      MANAGER: "bg-blue-100 text-blue-800",
      ADMIN: "bg-green-100 text-green-800",
      TESTENGINEER: "bg-yellow-100 text-yellow-800",
      JUNIORENGINEER: "bg-gray-100 text-gray-800",
      CUSTOMER: "bg-pink-100 text-pink-800",
    };
    return roleColors[role] || "bg-gray-100 text-gray-800";
  };

  const formatRole = (role) => {
    const roleNames = {
      CEO: "CEO",
      HOD: "HOD",
      MANAGER: "Technical Manager",
      ADMIN: "Admin Manager",
      TESTENGINEER: "Test Engineer",
      JUNIORENGINEER: "Junior Engineer",
      CUSTOMER: "Customer",
    };
    return roleNames[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <FiUsers className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Engineers</p>
                <p className="text-2xl font-bold">
                  {employees.filter((e) => e.role?.includes("ENGINEER")).length}
                </p>
              </div>
              <FiUserCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Managers</p>
                <p className="text-2xl font-bold">
                  {
                    employees.filter((e) =>
                      ["MANAGER", "ADMIN", "HOD"].includes(e.role)
                    ).length
                  }
                </p>
              </div>
              <HiOutlineOfficeBuilding className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Customers</p>
                <p className="text-2xl font-bold">
                  {
                    employees.filter((e) => ["CUSTOMER"].includes(e.role))
                      .length
                  }
                </p>
              </div>
              <FiBriefcase className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Add New Employee
            </button>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <FiLoader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="mt-2 text-gray-500">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center">
              <FiInbox className="w-16 h-16 text-gray-300 mx-auto" />
              <p className="mt-2 text-gray-500">No employees found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sr. No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Password
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedEmployees.map((employee, index) => (
                      <tr
                        key={employee._id || employee.id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {first + index + 1}.
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {employee.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="text-sm text-gray-900">••••••••</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(employee.role)}`}
                          >
                            {formatRole(employee.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center gap-1"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(employee._id || employee.id)
                            }
                            className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                totalRecords={filteredEmployees.length}
                rowsPerPage={rows}
                currentPage={first}
                onPageChange={handlePageChange}
                variant="default"
                color="blue"
              />
            </>
          )}
        </div>

        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FiUserPlus className="w-5 h-5" />
                  Add New Employee
                </h2>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <Register onRegisterSuccess={handleRegisterSuccess} />
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FiEdit2 className="w-5 h-5" />
                  Edit Employee
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <FiUser className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={selectedEmployee.name || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            name: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <FiMail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={selectedEmployee.email || ""}
                        onChange={(e) =>
                          setSelectedEmployee({
                            ...selectedEmployee,
                            email: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={selectedEmployee.role || "JUNIORENGINEER"}
                      onChange={(e) =>
                        setSelectedEmployee({
                          ...selectedEmployee,
                          role: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="JUNIORENGINEER">Junior Engineer</option>
                      <option value="TESTENGINEER">Test Engineer</option>
                      <option value="ADMIN">Admin Manager</option>
                      <option value="MANAGER">Technical Manager</option>
                      <option value="HOD">HOD</option>
                      <option value="CUSTOMER">Customer</option>
                      <option value="CEO">CEO</option>
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="changePassword"
                        checked={changePassword}
                        onChange={(e) => {
                          setChangePassword(e.target.checked);
                          if (!e.target.checked) {
                            setNewPassword("");
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="changePassword"
                        className="text-sm font-medium text-gray-700 flex items-center gap-1"
                      >
                        <FiLock className="w-4 h-4" />
                        Change Password
                      </label>
                    </div>

                    {changePassword && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <FiLock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            minLength={6}
                            required={changePassword}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <FiEyeOff className="w-5 h-5" />
                            ) : (
                              <FiEye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum 6 characters
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default List_Of_Employees;