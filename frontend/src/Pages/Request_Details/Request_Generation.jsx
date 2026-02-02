import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Request_Generation = ({ onClose, onSuccess }) => {
  const [previewControlNo, setPreviewControlNo] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    projectName: "",
    testName: "",
    equipmentId: "",
    testStartDate: new Date().toISOString().split("T")[0],
    testStartTime: "",
    testEndTime: "",
    uutIdsInput: "" 
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const generatePreview = async () => {
    if (!form.projectName || !form.testName || !form.uutIdsInput) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const uutIds = form.uutIdsInput.split(",").map(id => id.trim()).filter(id => id);

      const res = await fetch(`${API_BASE_URL}/test-reports/next-control-no`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          testDate: form.testStartDate,
          projectName: form.projectName.trim(),
          testName: form.testName.trim(),
          uutIds: uutIds
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
      const startDateTime = `${form.testStartDate}T${form.testStartTime}`;
      const endDateTime = `${form.testStartDate}T${form.testEndTime}`;

      const uutIds = form.uutIdsInput.split(",").map(id => id.trim()).filter(id => id);

      const res = await fetch(`${API_BASE_URL}/test-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          controlNo: previewControlNo,
          testStartDate: startDateTime,
          testEndDate: endDateTime,
          equipmentId: form.equipmentId.trim(),
          projectName: form.projectName.trim(),
          testName: form.testName.trim(),
          uutIds: uutIds
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

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Test Report</h1>
            <p className="text-sm text-slate-500 mt-1">Enter details and generate control number</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={handleChange("projectName")}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="e.g., Project V2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Test Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.testName}
                  onChange={handleChange("testName")}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="e.g., EMI Testing"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 items-center gap-2"> Equipment ID
                </label>
                <input
                  type="text"
                  value={form.equipmentId}
                  onChange={handleChange("equipmentId")}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="e.g., EQ-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 items-center gap-2">
                 UUT IDs (Comma Separated) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.uutIdsInput}
                  onChange={handleChange("uutIdsInput")}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none font-mono text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 items-center gap-2">
                 Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.testStartDate}
                  onChange={handleChange("testStartDate")}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 items-center gap-2">
                 Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.testStartTime}
                  onChange={handleChange("testStartTime")}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 items-center gap-2">
              End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.testEndTime}
                  onChange={handleChange("testEndTime")}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={generatePreview}
            disabled={loading}
            className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Control No."}
          </button>
        </div>
      </div>
      {previewControlNo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Confirm Control Number
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Please verify the details before creating the report.
            </p>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                Generated Control Number
              </div>
              <div className="text-4xl font-black text-slate-900 font-mono tracking-tighter mb-4">
                {previewControlNo}
              </div>
              <div className="text-sm text-amber-800 font-medium mb-2">
                Assigned to {form.uutIdsInput.split(",").length} Units
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPreviewControlNo("")}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
              >
                Edit Details
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Create Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Request_Generation;