// src/pages/UutRecords/UutRecords.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/authentication/authContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UutRecords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("in-lab");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const recordsPerPage = 10;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [outDate, setOutDate] = useState("");

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [activeFilter, searchTerm, currentPage]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      let url = `${API_BASE_URL}/uut-records?`;
      
      if (activeFilter === "in-lab") {
        url += "status=in";
      } else if (activeFilter === "checked-out") {
        url += "status=out";
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
        setTotalPages(Math.ceil(data.count / recordsPerPage));
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/uut-records/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setOutDate(new Date().toISOString().split('T')[0]);
    setShowEditModal(true);
  };

  const handleCheckout = async () => {
    if (!editingRecord || !outDate) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      const response = await fetch(
        `${API_BASE_URL}/uut-records/${editingRecord.id}/checkout`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ uutOutDate: outDate })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("✓ Unit checked out successfully!");
        setShowEditModal(false);
        setEditingRecord(null);
        setOutDate("");
        fetchRecords();
        fetchStats();
      } else {
        alert(data.error || "Failed to checkout unit");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const paginatedRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Unit In/Out Records</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage all UUT records</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate("/units/in")}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Add New Record
          </button>
        )}
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            label="Total Records" 
            value={stats.totalRecords} 
            icon="📊" 
            color="bg-blue-50 text-blue-600 border-blue-200"
          />
          <StatCard 
            label="In Lab" 
            value={stats.inLab} 
            icon="🏢" 
            color="bg-indigo-50 text-indigo-600 border-indigo-200"
          />
          <StatCard 
            label="Checked Out" 
            value={stats.checkedOut} 
            icon="✅" 
            color="bg-green-50 text-green-600 border-green-200"
          />
          <StatCard 
            label="Today" 
            value={stats.todayRecords} 
            icon="📅" 
            color="bg-amber-50 text-amber-600 border-amber-200"
          />
        </div>
      )}

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "in-lab", label: "In Lab", count: stats?.inLab || 0, activeColor: "bg-indigo-600 text-white" },
              { key: "checked-out", label: "Checked Out", count: stats?.checkedOut || 0, activeColor: "bg-green-600 text-white" },
              { key: "all", label: "All Records", count: stats?.totalRecords || 0, activeColor: "bg-gray-900 text-white" }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeFilter === filter.key
                    ? filter.activeColor
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></div>
          </div>
        ) : paginatedRecords.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <TableHeader>UUT Code</TableHeader>
                  <TableHeader>Serial No</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Project</TableHeader>
                  <TableHeader>Test Type</TableHeader>
                  <TableHeader>In Date</TableHeader>
                  <TableHeader>Out Date</TableHeader>
                  <TableHeader>Status</TableHeader>
                  {isAdmin && <TableHeader>Action</TableHeader>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                        {record.uutCode}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{record.serialNo}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{record.customerName}</div>
                      <div className="text-xs text-gray-500">{record.customerCode}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{record.projectName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                        {record.testTypeName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{formatDate(record.uutInDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {record.uutOutDate ? formatDate(record.uutOutDate) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {record.uutOutDate ? (
                        <StatusBadge status="checked-out" />
                      ) : (
                        <StatusBadge status="in-lab" />
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {!record.uutOutDate && (
                          <button
                            onClick={() => openEditModal(record)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                          >
                            Add Out Date
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && paginatedRecords.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
              {Math.min(currentPage * recordsPerPage, records.length)} of {records.length} records
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add UUT Out Date</h2>
            
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-2">UUT Details</div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium text-gray-700">UUT Code:</span> <span className="font-mono">{editingRecord.uutCode}</span></div>
                <div><span className="font-medium text-gray-700">Serial No:</span> {editingRecord.serialNo}</div>
                <div><span className="font-medium text-gray-700">Customer:</span> {editingRecord.customerName}</div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Out Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={outDate}
                onChange={(e) => setOutDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRecord(null);
                  setOutDate("");
                }}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <div className="text-sm text-gray-600 font-medium">{label}</div>
        <div className="text-xl font-semibold text-gray-900 mt-1">{value}</div>
      </div>
    </div>
  </div>
);

const TableHeader = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
    {children}
  </th>
);

const StatusBadge = ({ status }) => {
  const config = {
    'in-lab': { text: 'In Lab', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
    'checked-out': { text: 'Checked Out', bgColor: 'bg-green-100', textColor: 'text-green-700' }
  };
  
  const { text, bgColor, textColor } = config[status] || config['in-lab'];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};

export default UutRecords;