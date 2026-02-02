import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/authentication/authContext";
import { useISTDate } from "../../hooks/timeZoneConvertor";
import {
  FaHistory,
  FaBoxOpen,
  FaSync,
  FaExclamationTriangle,
} from "react-icons/fa";
import { FiPackage, FiInbox, FiCheckCircle, FiClock } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UutRecords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("in-lab");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const { formatDateTime } = useISTDate();

  const [modalState, setModalState] = useState({
    checkout: false,
    history: false,
    edit: false,
    selectedRecord: null,
  });

  const getSumOfOuts = (record) => {
    if (!record || !record.outs || !Array.isArray(record.outs)) return 0;
    return record.outs.reduce(
      (total, item) => total + (Number(item.outQty) || 0),
      0
    );
  };

  const getRemainingQty = (record) => {
    const totalIn = Number(record.uutQty) || 0;
    const totalOut = getSumOfOuts(record);
    return totalIn - totalOut;
  };

  const isFullyCheckedOut = (record) => {
    return getRemainingQty(record) <= 0;
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API_BASE_URL}/uut-records?_t=${Date.now()}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setRecords(data.data.map((r) => ({ ...r, outs: r.outs || [] })));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchSingleRecord = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/uut-records/id/${id}?_t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      return null;
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/uut-records/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredRecords = useMemo(() => {
    let result = [...records];
    if (activeFilter === "in-lab") {
      result = result.filter((r) => !isFullyCheckedOut(r));
    } else if (activeFilter === "checked-out") {
      result = result.filter((r) => isFullyCheckedOut(r));
    }
    return result.sort((a, b) => new Date(b.uutInDate) - new Date(a.uutInDate));
  }, [records, activeFilter]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return filteredRecords.slice(start, start + recordsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  useEffect(() => {
    const syncVisibleRows = async () => {
      if (paginatedRecords.length === 0) return;

      const visibleIds = paginatedRecords.map((r) => r.id);
      const token = localStorage.getItem("token");

      const promises = visibleIds.map((id) =>
        fetch(`${API_BASE_URL}/uut-records/id/${id}?_t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json())
      );

      try {
        const results = await Promise.all(promises);
        setRecords((prevRecords) => {
          const nextRecords = [...prevRecords];
          results.forEach((res) => {
            if (res.success && res.data) {
              const index = nextRecords.findIndex((r) => r.id === res.data.id);
              if (index !== -1) {
                nextRecords[index] = res.data;
              }
            }
          });
          return nextRecords;
        });
      } catch (err) {
        console.error("Sync error", err);
      }
    };

    const timer = setTimeout(syncVisibleRows, 50);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, activeFilter, loading]);

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [searchTerm]);

  const handleRefresh = () => {
    fetchRecords();
    fetchStats();
  };
  const openModal = async (type, record) => {
    const freshRecord = await fetchSingleRecord(record.id);
    setModalState({
      ...modalState,
      [type]: true,
      selectedRecord: freshRecord || record,
    });
  };

  const closeModal = (type) => {
    setModalState({ ...modalState, [type]: false, selectedRecord: null });
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Unit Tracker</h1>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
            title="Refresh"
          >
            <FaSync size={14} />
          </button>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/units/in")}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
          >
            + Add New Unit
          </button>
        )}
      </div>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Total Units"
            value={stats.totalRecords}
            icon={FiPackage}
            color="text-gray-700"
            bg="bg-gray-200/60"
          />
          <StatCard
            label="In Lab"
            value={stats.inLab}
            icon={FiInbox}
            color="text-amber-600"
            bg="bg-amber-100"
          />
          <StatCard
            label="Checked Out"
            value={stats.checkedOut}
            icon={FiCheckCircle}
            color="text-green-600"
            bg="bg-green-100"
          />
          <StatCard
            label="Today"
            value={stats.todayRecords}
            icon={FiClock}
            color="text-blue-600"
            bg="bg-blue-100"
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            {["in-lab", "checked-out", "all"].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                  activeFilter === filter
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.replace("-", " ").toUpperCase()}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by code, challan, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Loading records...
          </div>
        ) : paginatedRecords.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-gray-50">
            No records found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <Th className="text-center w-16">Sr. No.</Th>
                    <Th>UUT Code</Th>
                    <Th>Challan No</Th>
                    <Th>Project / Serial</Th>
                    <Th>In Date</Th>
                    <Th>Total Qty</Th>
                    <Th>Customer</Th>
                    <Th className="text-center">Remaining</Th>
                    <Th className="text-center">Status</Th>
                    <Th className="text-center">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRecords.map((record, index) => {
                    const serialNumber = (currentPage - 1) * recordsPerPage + index + 1;
                    
                    const remaining = getRemainingQty(record);
                    const isComplete = remaining <= 0;

                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <Td className="text-center font-medium text-gray-600">
                          {serialNumber}
                        </Td>
                        
                        <Td className="font-mono font-semibold">
                          {record.uutCode}
                        </Td>
                        <Td>{record.challanNo || "—"}</Td>
                        <Td>
                          <div className="font-medium">
                            {record.projectName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.serialNo}
                          </div>
                        </Td>
                        <Td>{formatDateTime(record.uutInDate)}</Td>
                        <Td className="text-center font-semibold">
                          {record.uutQty}
                        </Td>
                        <Td className="font-medium">{record.customerName}</Td>
                        <Td className="text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              remaining > 0
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-green-100 text-green-800 border border-green-300"
                            }`}
                          >
                            {remaining} / {record.uutQty}
                          </span>
                        </Td>
                        <Td className="text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              isComplete
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-gray-100 text-gray-700 border border-gray-300"
                            }`}
                          >
                            {isComplete ? "CHECKED OUT" : "IN LAB"}
                          </span>
                        </Td>
                        <Td className="text-center">
                          <div className="flex items-center justify-center gap-3 text-xs">
                            {!isComplete && (
                              <button
                                onClick={() => openModal("checkout", record)}
                                className="text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                              >
                                <FaBoxOpen size={13} /> Checkout
                              </button>
                            )}
                            {getSumOfOuts(record) > 0 && (
                              <button
                                onClick={() => openModal("history", record)}
                                className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                              >
                                <FaHistory size={13} /> History
                              </button>
                            )}
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isAdmin && modalState.checkout && (
        <CheckoutModal
          record={modalState.selectedRecord}
          onClose={() => closeModal("checkout")}
          onSuccess={() => {
            closeModal("checkout");
            handleRefresh();
          }}
          getRemainingQty={getRemainingQty}
        />
      )}
      {modalState.history && (
        <HistoryModal
          record={modalState.selectedRecord}
          onClose={() => closeModal("history")}
        />
      )}
    </div>
  );
};

const Th = ({ children, className = "" }) => (
  <th
    className={`px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td
    className={`px-5 py-4 text-sm border-r border-gray-200 last:border-r-0 ${className}`}
  >
    {children}
  </td>
);

const StatCard = ({ label, value,  icon: Icon,  color = "text-amber-600", bg = "bg-amber-100",}) => (
  <div className="p-6 rounded-2xl border border-gray-200 bg-linear-to-br from-gray-50 to-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-between gap-6">
    <div className="text-left">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-3xl font-bold text-gray-900 mt-1">
        {value}
      </div>
    </div>

    <div className={`p-3 rounded-2xl ${bg} shadow-lg backdrop-blur-sm`}>
      <Icon size={24} className={color} />
    </div>
  </div>
);

const CheckoutModal = ({ record, onClose, onSuccess, getRemainingQty }) => {
  const [outQty, setOutQty] = useState(1);
  const [outDate, setOutDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const toDateInputValue = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 10);
  };
  const remaining = getRemainingQty(record);
  const today = new Date().toISOString().split("T")[0];
  const minCheckoutDate = toDateInputValue(record.uutInDate);

  const handleSubmit = async () => {
    if (outQty < 1 || outQty > remaining) {
      alert(`Only ${remaining} unit(s) remaining.`);
      return;
    }
    if (!outDate) {
      alert("Please select a checkout date.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE_URL}/uut-records/${record.id}/checkout`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ outDate, outQty: Number(outQty) }),
        }
      );

      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <IoClose size={24} />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-6">Checkout Unit</h3>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Code:</span>{" "}
            <strong>{record.uutCode}</strong>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">Remaining:</span>{" "}
            <strong className="text-amber-700">{remaining}</strong>
          </div>
        </div>

        {remaining > 0 ? (
          <>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity to Checkout{" "}
                <span className="text-amber-600">(max {remaining})</span>
              </label>
              <input
                type="number"
                min="1"
                max={remaining}
                value={outQty}
                onChange={(e) => setOutQty(Number(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                disabled={loading}
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Checkout Date
              </label>
              <input
                type="date"
                value={outDate}
                min={minCheckoutDate}
                max={today}
                onChange={(e) => setOutDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                required
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Confirm Checkout"}
            </button>
          </>
        ) : (
          <div className="text-center py-8 text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
            <FaExclamationTriangle className="inline mr-2" />
            No units remaining in stock
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryModal = ({ record, onClose }) => {
  const outs = record?.outs || [];
  const totalIn = Number(record?.uutQty) || 0;
  const totalOut = outs.reduce((sum, o) => sum + Number(o.outQty), 0);
  const remaining = Math.max(0, totalIn - totalOut);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <IoClose size={26} />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Checkout History
        </h3>
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-7">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                UUT Code
              </div>
              <div className="mt-1 font-bold text-gray-900 font-mono">
                {record?.uutCode || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Total In
              </div>
              <div className="mt-1 text-lg font-bold text-amber-700">
                {totalIn}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Remaining
              </div>
              <div
                className={`mt-1 text-lg font-bold ${
                  remaining > 0 ? "text-amber-700" : "text-green-600"
                }`}
              >
                {remaining}
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Out Date
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Qty Out
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {outs.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-400">
                    No checkout history yet
                  </td>
                </tr>
              ) : (
                outs.map((o, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      {new Date(o.outDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-800">
                      {o.outQty}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {outs.length > 0 && (
          <div className="mt-4 text-right text-xs text-gray-500">
            Total checked out:{" "}
            <span className="font-bold text-gray-700">{totalOut}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UutRecords;