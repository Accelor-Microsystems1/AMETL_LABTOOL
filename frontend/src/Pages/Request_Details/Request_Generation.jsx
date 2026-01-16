import React, { useState, useEffect } from "react";
import { FaTimes, FaVial, FaProjectDiagram, FaCalendarAlt, FaSearch } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Request_Generation = ({ onClose, onSuccess }) => {
  const [inLabUnits, setInLabUnits] = useState([]);
  const [selectedUuts, setSelectedUuts] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [testName, setTestName] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [previewControlNo, setPreviewControlNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInLabUnits();
  }, []);

  const fetchInLabUnits = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/uut-records/in-lab`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setInLabUnits(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (uut) => {
    setSelectedUuts(prev =>
      prev.find(u => u.id === uut.id)
        ? prev.filter(u => u.id !== uut.id)
        : [...prev, uut]
    );
  };

  const generatePreview = async () => {
    if (!projectName || !testName || selectedUuts.length === 0) {
      alert("Please fill all fields and select units");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/test-reports/next-control-no`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testDate,
          projectName: projectName.trim(),
          testName: testName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewControlNo(data.controlNo);
      }
    } catch (err) {
      alert("Failed to generate control no.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!previewControlNo) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/test-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          controlNo: previewControlNo,
          testStartDate: testDate,
          projectName: projectName.trim(),
          testName: testName.trim(),
          uutIds: selectedUuts.map(u => u.id),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        alert(data.error || "Failed to create");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = inLabUnits.filter(uut =>
    uut.uutCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uut.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-screen overflow-hidden flex flex-col">
        <div className="bg-linear-to-r from-amber-500 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <FaVial size={36} /> Create New Test Report
            </h2>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-3 rounded-xl transition">
              <FaTimes size={28} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Select Units ({selectedUuts.length} selected)</h3>
              <div className="relative mb-4">
                <FaSearch className="absolute left-4 top-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search UUT Code / Project"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border-2 border-gray-300 rounded-xl"
                />
              </div>
              <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left"><input type="checkbox" /></th>
                      <th className="p-3 text-left">UUT Code</th>
                      <th className="p-3 text-left">Project</th>
                      <th className="p-3 text-left">Qty Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map(uut => (
                      <tr
                        key={uut.id}
                        onClick={() => toggleSelect(uut)}
                        className={`cursor-pointer hover:bg-amber-50 ${selectedUuts.find(u => u.id === uut.id) ? "bg-amber-100" : ""}`}
                      >
                        <td className="p-3"><input type="checkbox" checked={!!selectedUuts.find(u => u.id === uut.id)} readOnly /></td>
                        <td className="p-3 font-mono font-bold">{uut.uutCode}</td>
                        <td className="p-3">{uut.projectName}</td>
                        <td className="p-3 text-center font-semibold text-amber-700">
                          {uut.uutQty - (uut.outs?.reduce((a,b) => a + b.outQty, 0) || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">Test Details</h3>
              <div className="space-y-6">
                <div>
                  <label className="block font-bold text-lg mb-2"><FaProjectDiagram className="inline mr-2" /> Project Name</label>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-5 py-4 border-2 rounded-xl text-lg" placeholder="e.g., Project Phoenix" />
                </div>
                <div>
                  <label className="block font-bold text-lg mb-2"><FaVial className="inline mr-2" /> Test Name</label>
                  <input value={testName} onChange={e => setTestName(e.target.value)} className="w-full px-5 py-4 border-2 rounded-xl text-lg" placeholder="e.g., EMI/EMC Testing" />
                </div>
                <div>
                  <label className="block font-bold text-lg mb-2"><FaCalendarAlt className="inline mr-2" /> Test Start Date</label>
                  <input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} className="w-full px-5 py-4 border-2 rounded-xl text-lg" />
                </div>

                <button
                  onClick={generatePreview}
                  disabled={loading || !projectName || !testName || selectedUuts.length === 0}
                  className="w-full py-5 bg-amber-600 text-white font-bold text-xl rounded-xl hover:bg-amber-700 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Control No."}
                </button>

                {previewControlNo && (
                  <div className="p-8 bg-linear-to-br from-amber-100 to-orange-100 border-4 border-amber-400 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-amber-900 mb-3">CONTROL NUMBER</div>
                    <div className="text-6xl font-mono font-black text-amber-700 tracking-wider">
                      {previewControlNo}
                    </div>
                    <div className="text-lg text-amber-800 mt-4 font-semibold">
                      For {selectedUuts.length} units
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCreate}
                  disabled={!previewControlNo || loading}
                  className="w-full py-6 bg-green-600 text-white font-bold text-2xl rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  CREATE REPORT & ASSIGN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Request_Generation;