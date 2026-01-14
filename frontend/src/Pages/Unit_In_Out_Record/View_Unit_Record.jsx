import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/authentication/authContext";
import { FaEdit, FaHistory, FaTrash, FaBoxOpen, FaSync, FaExclamationTriangle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UutRecords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // --- State ---
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("in-lab");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Modals
  const [modalState, setModalState] = useState({
    checkout: false,
    history: false,
    edit: false,
    selectedRecord: null,
  });

  // --- 🧮 CALCULATION LOGIC ---
  // This calculates the SUM of all 'outQty' inside the 'outs' array.
  const getSumOfOuts = (record) => {
    // If there is no history array, the sum is 0
    if (!record || !record.outs || !Array.isArray(record.outs)) return 0;
    
    // Sum up the quantities
    return record.outs.reduce((total, item) => total + (Number(item.outQty) || 0), 0);
  };

  // This calculates Remaining = Total In - Sum(Outs)
  const getRemainingQty = (record) => {
    const totalIn = Number(record.uutQty) || 0;
    const totalOut = getSumOfOuts(record);
    return totalIn - totalOut;
  };

  const isFullyCheckedOut = (record) => {
    return getRemainingQty(record) <= 0;
  };

  // --- API Actions ---

  // 1. Fetch Basic List
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API_BASE_URL}/uut-records?_t=${Date.now()}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      
      if (data.success) {
        // Load the list, ensuring 'outs' is at least an empty array to start
        setRecords(data.data.map(r => ({ ...r, outs: r.outs || [] })));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Single Full Record
  const fetchSingleRecord = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/uut-records/id/${id}?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      return null;
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/uut-records/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) { console.error(error); }
  };

  // --- Filters & Pagination ---
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


  // --- 🔄 AUTOMATIC SYNC (The Fix) ---
  // Whenever the visible page changes, we fetch the FULL history for these 10 items
  // This ensures the subtraction logic works correctly in the table.
  useEffect(() => {
    const syncVisibleRows = async () => {
        if (paginatedRecords.length === 0) return;

        const visibleIds = paginatedRecords.map(r => r.id);
        const token = localStorage.getItem("token");
        
        // Fetch full details for all visible IDs in parallel
        const promises = visibleIds.map(id => 
            fetch(`${API_BASE_URL}/uut-records/id/${id}?_t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json())
        );

        try {
            const results = await Promise.all(promises);
            
            // Update state with the new "Full" records containing history
            setRecords(prevRecords => {
                const nextRecords = [...prevRecords];
                results.forEach(res => {
                    if (res.success && res.data) {
                        const index = nextRecords.findIndex(r => r.id === res.data.id);
                        if (index !== -1) {
                            nextRecords[index] = res.data; // Replace shallow with deep
                        }
                    }
                });
                return nextRecords;
            });
        } catch (err) {
            console.error("Sync error", err);
        }
    };

    // Small delay to let the initial render happen, then sync
    const timer = setTimeout(syncVisibleRows, 50);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, activeFilter, loading]); 


  // --- Initial Load ---
  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [searchTerm]);

  const handleRefresh = () => {
    fetchRecords();
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record permanently?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE_URL}/uut-records/${id}`, { method: "DELETE", headers: {Authorization: `Bearer ${token}`} });
    handleRefresh();
  };

  const openModal = async (type, record) => {
    // Ensure modal has fresh data
    const freshRecord = await fetchSingleRecord(record.id);
    setModalState({ ...modalState, [type]: true, selectedRecord: freshRecord || record });
  };

  const closeModal = (type) => {
    setModalState({ ...modalState, [type]: false, selectedRecord: null });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Unit Tracker</h1>
            <button onClick={handleRefresh} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition" title="Force Refresh">
                <FaSync size={12}/>
            </button>
        </div>
        {isAdmin && (
          <button onClick={() => navigate("/units/in")} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded shadow flex items-center gap-1">
            ➕ Add New
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total" value={stats.totalRecords} color="slate" />
          <StatCard label="In Lab" value={stats.inLab} color="violet" />
          <StatCard label="Checked Out" value={stats.checkedOut} color="green" />
          <StatCard label="Today" value={stats.todayRecords} color="amber" />
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2">
          {["in-lab", "checked-out", "all"].map((key) => (
            <button key={key} onClick={() => { setActiveFilter(key); setCurrentPage(1); }} className={`px-3 py-1.5 text-xs font-medium rounded uppercase ${activeFilter === key ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-700"}`}>
              {key.replace("-", " ")}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-violet-300 outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading records...</div>
        ) : paginatedRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50">No records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeader>Code / Serial</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Qty (Rem / Tot)</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedRecords.map((record) => {
                  // --- THE CALCULATION ---
                  const remaining = getRemainingQty(record);
                  const totalOut = getSumOfOuts(record);
                  const isComplete = remaining <= 0;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-mono font-bold text-violet-700">{record.uutCode}</div>
                        <div className="text-xs text-slate-500">{record.serialNo}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.customerName}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${isComplete ? "bg-green-100 text-green-800 border-green-200" : "bg-violet-100 text-violet-800 border-violet-200"}`}>
                          {isComplete ? "CHECKED OUT" : "IN LAB"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1 font-mono text-xs">
                           <span className={`font-bold text-sm ${remaining > 0 ? "text-amber-600" : "text-green-600"}`}>
                                {remaining < 0 ? 0 : remaining}
                           </span>
                           <span className="text-gray-400">/</span>
                           <span className="text-gray-600">{record.uutQty}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                            {/* Checkout Button: Only if remaining > 0 */}
                            {!isComplete && (
                                <button onClick={() => openModal("checkout", record)} className="text-violet-600 hover:text-violet-800 flex items-center gap-1 text-xs font-bold" title="Checkout">
                                <FaBoxOpen size={14}/> Checkout
                                </button>
                            )}

                            {/* History Button: If anything has been checked out */}
                            {(totalOut > 0) && (
                                <button onClick={() => openModal("history", record)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs font-medium" title="History">
                                <FaHistory size={13}/> History
                                </button>
                            )}

                            {/* Admin Actions: Edit & Delete (Inside Table as requested) */}
                            {isAdmin && (
                                <div className="flex items-center gap-2 border-l pl-3 border-gray-200 ml-1">
                                    <button onClick={() => openModal("edit", record)} className="text-gray-400 hover:text-gray-600" title="Edit"><FaEdit size={14} /></button>
                                    <button onClick={() => handleDelete(record.id)} className="text-red-300 hover:text-red-500" title="Delete"><FaTrash size={13} /></button>
                                </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && paginatedRecords.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-t flex items-center justify-between text-xs">
            <span className="text-slate-500">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-2 py-1 border rounded bg-white disabled:opacity-50">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-2 py-1 border rounded bg-white disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {modalState.checkout && (
        <CheckoutModal 
          record={modalState.selectedRecord} 
          onClose={() => closeModal("checkout")} 
          onSuccess={() => { closeModal("checkout"); handleRefresh(); }}
          getRemainingQty={getRemainingQty}
        />
      )}
      {modalState.history && <HistoryModal record={modalState.selectedRecord} onClose={() => closeModal("history")} />}
      {modalState.edit && <EditModal record={modalState.selectedRecord} onClose={() => closeModal("edit")} onSuccess={() => { closeModal("edit"); handleRefresh(); }} />}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const TableHeader = ({ children }) => (<th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{children}</th>);
const StatCard = ({ label, value, color }) => (
  <div className={`p-4 rounded-lg border shadow-sm bg-${color}-50 border-${color}-200`}>
    <div className="text-xs font-medium uppercase opacity-70 text-gray-600">{label}</div>
    <div className="text-2xl font-bold mt-1 text-gray-900">{value}</div>
  </div>
);

// --- MODALS ---

const CheckoutModal = ({ record, onClose, onSuccess, getRemainingQty }) => {
  const [outQty, setOutQty] = useState(1);
  const [outDate, setOutDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Calculate remaining using the passed function (Sum Logic)
  const remaining = getRemainingQty(record);

  const handleSubmit = async () => {
    if (outQty > remaining) return alert(`Cannot checkout ${outQty}. Only ${remaining} remaining.`);
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE_URL}/uut-records/${record.id}/checkout`, {
            method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ outDate, outQty })
        });
        const data = await res.json();
        if (data.success) { onSuccess(); } else { alert(data.error); }
    } catch(e) { alert("Error"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><IoClose size={20}/></button>
        <h3 className="text-lg font-bold mb-4">Checkout Unit</h3>
        <div className="bg-slate-50 p-3 rounded mb-4 text-sm border">
          <p className="flex justify-between"><span>Code:</span> <strong>{record.uutCode}</strong></p>
          <p className="flex justify-between mt-1"><span>Remaining:</span> <span className="text-green-600 font-bold">{remaining}</span></p>
        </div>
        {remaining > 0 ? (
            <div className="space-y-3">
                <input type="number" min="1" max={remaining} value={outQty} onChange={e => setOutQty(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
                <input type="date" value={outDate} onChange={e => setOutDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                <button onClick={handleSubmit} className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded text-sm font-medium">Checkout</button>
            </div>
        ) : <div className="text-center text-amber-600 py-2 text-sm"><FaExclamationTriangle className="inline"/> No stock remaining.</div>}
      </div>
    </div>
  );
};

const HistoryModal = ({ record, onClose }) => {
  const outs = record?.outs || [];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><IoClose size={20}/></button>
        <h3 className="text-lg font-bold mb-1">History</h3>
        <div className="border rounded overflow-hidden max-h-64 overflow-y-auto mt-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Qty</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {outs.length === 0 ? <tr><td colSpan="2" className="p-4 text-center text-gray-400">Empty</td></tr> : outs.map((o,i)=>(<tr key={i}><td className="px-3 py-2">{new Date(o.outDate).toLocaleDateString()}</td><td className="px-3 py-2 text-right font-bold">{o.outQty}</td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ record, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ uutCode: record.uutCode, serialNo: record.serialNo, customerName: record.customerName, uutQty: record.uutQty });
  const handleUpdate = async () => {
     const token = localStorage.getItem("token");
     await fetch(`${API_BASE_URL}/uut-records/${record.id}`, { method: "PUT", headers: {"Content-Type":"application/json", Authorization: `Bearer ${token}`}, body: JSON.stringify(formData)});
     onSuccess();
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><IoClose size={20}/></button>
        <h3 className="text-lg font-bold mb-4">Edit</h3>
        <div className="space-y-3">
          <input value={formData.uutCode} onChange={e=>setFormData({...formData, uutCode:e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="Code"/>
          <input value={formData.serialNo} onChange={e=>setFormData({...formData, serialNo:e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="Serial"/>
          <input value={formData.customerName} onChange={e=>setFormData({...formData, customerName:e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="Customer"/>
          <input type="number" value={formData.uutQty} onChange={e=>setFormData({...formData, uutQty:e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="Qty"/>
          <button onClick={handleUpdate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium">Save</button>
        </div>
      </div>
    </div>
  );
};

export default UutRecords;