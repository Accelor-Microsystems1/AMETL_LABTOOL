import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/authentication/authContext";
import { FaCheckCircle, FaEdit, FaChevronDown, FaChevronUp } from "react-icons/fa";
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
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded history

  const today = new Date().toISOString().split("T")[0];

  // Helper Functions
  const getTotalOutQty = (record) => {
    return record.outs?.reduce((sum, out) => sum + (out.outQty || 0), 0) || 0;
  };

  const isFullyCheckedOut = (record) => {
    return getTotalOutQty(record) >= record.uutQty;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const toggleHistoryExpand = (recordId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  // Fetch all records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      let url = `${API_BASE_URL}/uut-records`;
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
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

  // ✅ Fetch single record by ID
  const fetchRecordById = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/uut-records/id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error(`HTTP ${response.status}: Failed to fetch record ${id}`);
        return null;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        return null;
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Fetched record ${id} with ${data.data.outs?.length || 0} checkout entries`);
        return data.data;
      } else {
        console.error("Failed to fetch record:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error fetching record by ID:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [searchTerm]);

  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.uutCode?.toLowerCase().includes(term) ||
          r.serialNo?.toLowerCase().includes(term) ||
          r.customerName?.toLowerCase().includes(term) ||
          r.customerCode?.toLowerCase().includes(term)
      );
    }

    if (activeFilter === "in-lab") {
      result = result.filter((r) => !isFullyCheckedOut(r));
    } else if (activeFilter === "checked-out") {
      result = result.filter((r) => isFullyCheckedOut(r));
    }

    result.sort((a, b) => new Date(b.uutInDate) - new Date(a.uutInDate));

    return result;
  }, [records, activeFilter, searchTerm]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedRecords.length / recordsPerPage));
  }, [filteredAndSortedRecords]);

  const paginatedRecords = useMemo(() => {
    return filteredAndSortedRecords.slice(
      (currentPage - 1) * recordsPerPage,
      currentPage * recordsPerPage
    );
  }, [filteredAndSortedRecords, currentPage]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openCheckoutModal = async (record) => {
    if (!isAdmin) return;

    try {
      const freshRecord = await fetchRecordById(record.id);
      if (freshRecord) {
        setEditingRecord(freshRecord);
        setOutDate(today);
        setOutQty(1);
        setShowCheckoutModal(true);
      } else {
        alert("Failed to load record. Please refresh and try again.");
      }
    } catch (error) {
      console.error("Error loading record:", error);
      alert("Error loading record details.");
    }
  };

  const handleCheckout = async () => {
    if (!editingRecord || !editingRecord.id || !outDate || !outQty) {
      alert("Missing required data.");
      return;
    }

    try {
      const freshRecord = await fetchRecordById(editingRecord.id);
      if (!freshRecord) {
        alert("Record not found or deleted.");
        setShowCheckoutModal(false);
        return;
      }

      const outs = Array.isArray(freshRecord.outs) ? freshRecord.outs : [];
      const totalOutSoFar = outs.reduce((sum, out) => sum + (out.outQty || 0), 0);
      const remainingQty = freshRecord.uutQty - totalOutSoFar;

      if (outQty > remainingQty) {
        alert(`Cannot checkout ${outQty}. Only ${remainingQty} units remaining.`);
        return;
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/uut-records/${freshRecord.id}/checkout`,
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
        const updatedRecord = await fetchRecordById(freshRecord.id);

        if (updatedRecord) {
          const newOuts = Array.isArray(updatedRecord.outs) ? updatedRecord.outs : [];
          const newTotalOut = newOuts.reduce((sum, out) => sum + (out.outQty || 0), 0);
          const newRemaining = updatedRecord.uutQty - newTotalOut;

          setEditingRecord(updatedRecord);

          if (newRemaining <= 0) {
            alert("✅ All units checked out successfully!");
            setShowCheckoutModal(false);
            setEditingRecord(null);
            setOutDate("");
            setOutQty(1);
          } else {
            setOutQty(1);
            alert(`✅ ${outQty} units checked out. ${newRemaining} remaining.`);
          }
        }

        setCurrentPage(1);
        fetchRecords();
        fetchStats();
      } else {
        alert(data.error || "Failed to checkout unit");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unit In/Out Tracker</h1>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard label="Total Records" value={stats.totalRecords} icon="📊" color="blue" />
          <StatCard label="In Lab" value={stats.inLab} icon="🏢" color="indigo" />
          <StatCard label="Checked Out" value={stats.checkedOut} icon="✅" color="green" />
          <StatCard label="Today" value={stats.todayRecords} icon="📅" color="amber" />
        </div>
      )}

      {/* Filters & Search */}
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

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Loading records...</p>
          </div>
        ) : paginatedRecords.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-lg">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 border-collapse">
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
                  <TableHeader>Out Summary</TableHeader>
                  {(isAdmin || isManager || isHod) && <TableHeader>Status</TableHeader>}
                  {isAdmin && <TableHeader>Action</TableHeader>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-white">
                {paginatedRecords.map((record) => {
                  const totalOut = getTotalOutQty(record);
                  const remaining = record.uutQty - totalOut;
                  const isExpanded = expandedRows.has(record.id);

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors group border-b-2 border-gray-800 last:border-b-0"
                    >
                      <td className="px-5 py-4 border-r-2 border-gray-800 last:border-r-0">
                        <code className="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-800">
                          {record.uutCode}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-sm border-r-2 border-gray-800 last:border-r-0">
                        {record.serialNo}
                      </td>
                      <td className="px-5 py-4 text-sm border-r-2 border-gray-800 last:border-r-0">
                        {record.challanNo || "—"}
                      </td>
                      <td className="px-5 py-4 border-r-2 border-gray-800 last:border-r-0">
                        <div className="font-medium text-gray-900">{record.customerName}</div>
                        <div className="text-xs text-gray-500">{record.customerCode}</div>
                      </td>
                      <td className="px-5 py-4 text-sm border-r-2 border-gray-800 last:border-r-0">
                        {record.projectName}
                      </td>
                      <td className="px-5 py-4 border-r-2 border-gray-800 last:border-r-0">
                        <span className="px-2.5 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                          {record.testTypeName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm border-r-2 border-gray-800 last:border-r-0">
                        {formatDate(record.uutInDate)}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium border-r-2 border-gray-800 last:border-r-0">
                        {record.uutQty}
                      </td>
                      <td className="px-5 py-4 border-r-2 border-gray-800 last:border-r-0">
                        <div className="space-y-2">
                          {record.outs && record.outs.length > 0 ? (
                            <>
                              <div className="flex items-center justify-between gap-3 bg-linear-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-300">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-green-800">
                                    ✅ Checked Out:
                                  </span>
                                  <span className="text-sm font-bold text-green-900 bg-white px-2 py-0.5 rounded border border-green-400">
                                    {totalOut} units
                                  </span>
                                </div>
                                {record.outs.length > 1 && (
                                  <button
                                    onClick={() => toggleHistoryExpand(record.id)}
                                    className="text-xs text-green-700 hover:text-green-900 flex items-center gap-1 font-medium"
                                    title="View detailed history"
                                  >
                                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    {record.outs.length} splits
                                  </button>
                                )}
                              </div>

                              {isExpanded && (
                                <div className="space-y-1 pl-4 border-l-2 border-green-300">
                                  {[...record.outs]
                                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                    .map((out, idx) => (
                                      <div
                                        key={out.id}
                                        className="text-xs bg-white px-2.5 py-1.5 rounded border border-gray-300 flex justify-between items-center"
                                      >
                                        <span className="font-medium text-gray-700">
                                          #{idx + 1}: {out.outQty} units
                                        </span>
                                        <span className="text-gray-500 text-[10px] font-mono">
                                          {formatDate(out.outDate)}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-400 text-sm italic py-2">
                              — No checkouts yet —
                            </div>
                          )}

                          {remaining > 0 && !isFullyCheckedOut(record) && (
                            <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-300">
                              <span className="text-xs font-bold">📦 Remaining:</span>
                              <span className="text-sm font-extrabold bg-white px-2 py-0.5 rounded border border-amber-400">
                                {remaining} units
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      {(isAdmin || isManager || isHod) && (
                        <td className="px-5 py-4 border-r-2 border-gray-800 last:border-r-0">
                          {isFullyCheckedOut(record) ? (
                            <StatusBadge status="checked-out" />
                          ) : (
                            <StatusBadge status="in-lab" />
                          )}
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-5 py-4 whitespace-nowrap border-r-2 border-gray-800 last:border-r-0">
                          {!isFullyCheckedOut(record) &&
                          new Date(record.uutInDate) <= new Date(today) ? (
                            <button
                              onClick={() => openCheckoutModal(record)}
                              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline flex items-center gap-1.5 transition-colors"
                            >
                              <FaEdit className="text-indigo-500" />
                              <span>Checkout</span>
                            </button>
                          ) : !isFullyCheckedOut(record) ? (
                            <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">
                              📆 Future In
                            </span>
                          ) : null}
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
          <div className="px-5 py-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between border-t-2 border-gray-800">
            <p className="text-sm text-gray-600 mb-3 sm:mb-0">
              Showing {(currentPage - 1) * recordsPerPage + 1}–
              {Math.min(currentPage * recordsPerPage, filteredAndSortedRecords.length)} of{" "}
              {filteredAndSortedRecords.length}
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {showCheckoutModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl transition-transform hover:scale-110"
              title="Close"
            >
              <IoClose />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center border-b pb-4">
              📤 Partial Unit Checkout
            </h2>

            {/* Record Details */}
            <div className="mb-6 p-4 bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
              <h3 className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3 text-center">
                UNIT DETAILS
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="font-medium text-gray-700">UUT Code:</div>
                <div>
                  <code className="font-mono bg-white px-2 py-1 rounded border text-indigo-600">
                    {editingRecord.uutCode}
                  </code>
                </div>
                <div className="font-medium text-gray-700">Serial No:</div>
                <div className="font-medium">{editingRecord.serialNo}</div>
                <div className="font-medium text-gray-700">Total In:</div>
                <div className="font-bold text-lg text-indigo-600">{editingRecord.uutQty}</div>
                <div className="font-medium text-gray-700">Already Out:</div>
                <div className="font-bold text-green-600">{getTotalOutQty(editingRecord)}</div>
                <div className="font-medium text-gray-700">Remaining:</div>
                <div className="font-bold text-amber-600">
                  {editingRecord.uutQty - getTotalOutQty(editingRecord)}
                </div>
              </div>
            </div>

            {/* Full Checkout History */}
            {editingRecord.outs && editingRecord.outs.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📜</span> Checkout History ({editingRecord.outs.length} entries)
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {[...editingRecord.outs]
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                    .map((out, idx) => (
                      <div
                        key={out.id}
                        className="text-xs bg-white px-3 py-2 rounded-lg border border-gray-300 flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-800">
                          #{idx + 1}: {out.outQty} units
                        </span>
                        <span className="text-gray-500 text-[11px] font-mono">
                          {formatDate(out.outDate)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Checkout <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={editingRecord.uutQty - getTotalOutQty(editingRecord)}
                  value={outQty}
                  onChange={(e) => setOutQty(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-lg font-medium text-center"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Checkout Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={outDate}
                  max={today}
                  onChange={(e) => setOutDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-center"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-4 border-t">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-3 px-4 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-3 px-4 text-sm font-medium bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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

// Reusable Components (Same as before)
const StatCard = ({ label, value, icon, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    green: "bg-green-50 text-green-600 border-green-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };

  return (
    <div className="bg-white p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorMap[color]} shadow-inner border-2`}
        >
          <span className="text-xl font-extrabold">{icon}</span>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-1">
            {value.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

const TableHeader = ({ children }) => (
  <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50 border-b-2 border-r-2 border-gray-800 last:border-r-0">
    {children}
  </th>
);

const StatusBadge = ({ status }) => {
  const config = {
    "in-lab": {
      text: "IN LAB",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-800",
      border: "border-indigo-300",
    },
    "checked-out": {
      text: "CHECKED OUT",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      border: "border-green-300",
    },
  };

  const { text, bgColor, textColor, border } = config[status] || config["in-lab"];

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase ${bgColor} ${textColor} border ${border}`}
    >
      {text}
    </span>
  );
};

export default UutRecords;