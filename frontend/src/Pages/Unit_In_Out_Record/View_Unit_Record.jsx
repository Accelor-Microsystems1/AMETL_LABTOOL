import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/authentication/authContext";
import { FaCheckCircle, FaEdit } from "react-icons/fa";
import { IoClose } from "react-icons/io5";             

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UutRecords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const isHod = user?.role === "HOD";

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("in-lab");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [outDate, setOutDate] = useState("");
  const [outQty, setOutQty] = useState(1);

  const today = new Date().toISOString().split("T")[0];

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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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

  const openCheckoutModal = (record) => {
    if (!isAdmin) return;
    setEditingRecord(record);
    setOutDate(today);
    setOutQty(1);
    setShowCheckoutModal(true);
  };

  const handleCheckout = async () => {
    if (!editingRecord || !outDate || !outQty) return;
    const totalOutSoFar = editingRecord.outs?.reduce((sum, out) => sum + (out.outQty || 0), 0) || 0;
    const remainingQty = editingRecord.uutQty - totalOutSoFar;

    if (outQty > remainingQty) {
      alert(`Cannot checkout ${outQty}. Only ${remainingQty} units remaining.`);
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/uut-records/${editingRecord.id}/checkout`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ outDate, outQty }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Unit partially checked out successfully!");
        setShowCheckoutModal(false);
        setEditingRecord(null);
        setOutDate("");
        setOutQty(1);
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
      year: "numeric",
    });
  };

  const paginatedRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const getTotalOutQty = (record) => {
    return record.outs?.reduce((sum, out) => sum + (out.outQty || 0), 0) || 0;
  };

  const isFullyCheckedOut = (record) => {
    return getTotalOutQty(record) >= record.uutQty;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900"> Unit In/Out Tracker</h1>
          <p className="text-gray-500 mt-1">Monitor movement and availability of all UUTs</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate("/units/in")}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            ➕ Add New Record
          </button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard label="Total Records" value={stats.totalRecords} icon="📊" color="blue" />
          <StatCard label="In Lab" value={stats.inLab} icon="🏢" color="indigo" />
          <StatCard label="Checked Out" value={stats.checkedOut} icon="✅" color="green" />
          <StatCard label="Today" value={stats.todayRecords} icon="📅" color="amber" />
        </div>
      )}

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "in-lab", label: "In Lab", count: stats?.inLab || 0 },
              { key: "checked-out", label: "Checked Out", count: stats?.checkedOut || 0 },
              { key: "all", label: "All", count: stats?.totalRecords || 0 },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeFilter === filter.key
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label} <span className="ml-1 opacity-80">({filter.count})</span>
              </button>
            ))}
          </div>

          <div className="sm:ml-auto w-full sm:w-64">
            <input
              type="text"
              placeholder="🔍 Search by code, serial, customer..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Loading records...</p>
          </div>
        ) : paginatedRecords.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-lg"> No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>UUT Code</TableHeader>
                  <TableHeader>Serial No</TableHeader>
                  <TableHeader>Challan No</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Project</TableHeader>
                  <TableHeader>Test Type</TableHeader>
                  <TableHeader>In Date</TableHeader>
                  <TableHeader>Qty In</TableHeader>
                  <TableHeader>Out History</TableHeader>
                  {(isAdmin || isManager || isHod) && <TableHeader>Status</TableHeader>}
                  {isAdmin && <TableHeader>Action</TableHeader>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedRecords.map((record) => {
                  const totalOut = getTotalOutQty(record);
                  const remaining = record.uutQty - totalOut;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-4">
                        <code className="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-800">
                          {record.uutCode}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-sm">{record.serialNo}</td>
                      <td className="px-5 py-4 text-sm">{record.challanNo || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{record.customerName}</div>
                        <div className="text-xs text-gray-500">{record.customerCode}</div>
                      </td>
                      <td className="px-5 py-4 text-sm">{record.projectName}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                          {record.testTypeName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">{formatDate(record.uutInDate)}</td>
                      <td className="px-5 py-4 text-sm font-medium">{record.uutQty}</td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {record.outs && record.outs.length > 0 ? (
                            record.outs.map((out, idx) => (
                              <div key={idx} className="text-xs bg-green-50 px-2 py-1 rounded-md border border-green-200">
                                <span className="font-medium">{out.outQty} units</span> on {formatDate(out.outDate)}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                          {remaining > 0 && (
                            <div className="text-xs bg-amber-50 px-2 py-1 rounded-md border border-amber-200 mt-1">
                              <span className="font-medium">{remaining} remaining</span>
                            </div>
                          )}
                        </div>
                      </td>
                      {(isAdmin || isManager || isHod) && (
                        <td className="px-5 py-4">
                          {isFullyCheckedOut(record) ? (
                            <StatusBadge status="checked-out" />
                          ) : (
                            <StatusBadge status="in-lab" />
                          )}
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-5 py-4 whitespace-nowrap">
                          {!isFullyCheckedOut(record) && (
                            <button
                              onClick={() => openCheckoutModal(record)}
                              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline flex items-center gap-1"
                            >
                              <FaEdit /> Checkout
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && paginatedRecords.length > 0 && (
          <div className="px-5 py-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 sm:mb-0">
              Showing {(currentPage - 1) * recordsPerPage + 1}–
              {Math.min(currentPage * recordsPerPage, records.length)} of {records.length}
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 text-sm rounded-lg transition ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white"
                        : "border hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {showCheckoutModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              title="Close"
            >
              <IoClose />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-5">📤 Checkout Units</h2>

            <div className="mb-5 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <h3 className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">UUT Details</h3>
              <div className="text-sm space-y-1">
                <div><strong>UUT Code:</strong> <code className="font-mono bg-white px-2 py-0.5 rounded">{editingRecord.uutCode}</code></div>
                <div><strong>Serial No:</strong> {editingRecord.serialNo}</div>
                <div><strong>Total In:</strong> {editingRecord.uutQty}</div>
                <div><strong>Already Out:</strong> {getTotalOutQty(editingRecord)}</div>
                <div><strong>Remaining:</strong> <span className="font-bold">{editingRecord.uutQty - getTotalOutQty(editingRecord)}</span></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to Checkout <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={editingRecord.uutQty - getTotalOutQty(editingRecord)}
                  value={outQty}
                  onChange={(e) => setOutQty(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Checkout Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={outDate}
                  max={today}
                  onChange={(e) => setOutDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-2.5 px-4 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-2.5 px-4 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <FaCheckCircle /> Confirm Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    green: "bg-green-50 text-green-600 border-green-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
};

const TableHeader = ({ children }) => (
  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
    {children}
  </th>
);

const StatusBadge = ({ status }) => {
  const config = {
    "in-lab": { text: "In Lab", bgColor: "bg-indigo-100", textColor: "text-indigo-700" },
    "checked-out": { text: "Checked Out", bgColor: "bg-green-100", textColor: "text-green-700" },
  };

  const { text, bgColor, textColor } = config[status] || config["in-lab"];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};

export default UutRecords;