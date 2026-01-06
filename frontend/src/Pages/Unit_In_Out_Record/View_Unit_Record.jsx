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
      console.log(data)
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
        alert("Unit checked out successfully!");
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Unit In/Out Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage all UUT records
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate("/units/in")}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors shadow-sm"
          >
            + Add New Record
          </button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Records</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">In Lab</p>
                <p className="text-2xl font-bold text-amber-600">{stats.inLab}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Checked Out</p>
                <p className="text-2xl font-bold text-green-600">{stats.checkedOut}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Today</p>
                <p className="text-2xl font-bold text-purple-600">{stats.todayRecords}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange("in-lab")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "in-lab"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              In Lab ({stats?.inLab || 0})
            </button>

            <button
              onClick={() => handleFilterChange("checked-out")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "checked-out"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Checked Out ({stats?.checkedOut || 0})
            </button>

            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Records ({stats?.totalRecords || 0})
            </button>
          </div>

          <div className="flex-1 lg:max-w-md">
            <input
              type="text"
              placeholder="Search by Serial No, UUT Code, Customer..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500">Loading records...</div>
            </div>
          ) : paginatedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <div className="text-lg font-medium text-slate-900 mb-1">No records found</div>
              <div className="text-sm text-slate-500">
                {searchTerm
                  ? "Try adjusting your search"
                  : "No records match the current filter"}
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    UUT Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Serial No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Test Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    In Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Out Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {record.uutCode}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {record.serialNo}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {record.customerName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {record.customerCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {record.projectName}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {record.testTypeName}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {formatDate(record.uutInDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {record.uutOutDate ? (
                        formatDate(record.uutOutDate)
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {record.uutOutDate ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Checked Out
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          In Lab
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-4">
                        {!record.uutOutDate && (
                          <button
                            onClick={() => openEditModal(record)}
                            className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
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
          )}
        </div>

        {!loading && paginatedRecords.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
                {Math.min(currentPage * recordsPerPage, records.length)} of{" "}
                {records.length} records
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        currentPage === i + 1
                          ? "bg-amber-600 text-white"
                          : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Add UUT Out Date
            </h2>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="text-xs font-semibold text-amber-800 uppercase mb-2">
                UUT Details
              </div>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-medium text-slate-700">UUT Code:</span>{" "}
                  <span className="font-mono text-slate-900">{editingRecord.uutCode}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-slate-700">Serial No:</span>{" "}
                  <span className="text-slate-900">{editingRecord.serialNo}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-slate-700">Customer:</span>{" "}
                  <span className="text-slate-900">{editingRecord.customerName}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                UUT Out Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={outDate}
                onChange={(e) => setOutDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRecord(null);
                  setOutDate("");
                }}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700"
              >
                Save Out Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UutRecords;