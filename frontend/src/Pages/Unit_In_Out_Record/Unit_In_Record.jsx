import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDependentDropdowns } from "../../hooks/useDependentDropdowns";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PREDEFINED_TEST_TYPES = [
  { name: "CEMILAC", code: "C" },
  { name: "ESS", code: "E" },
  { name: "AT", code: "A" },
  { name: "QT", code: "Q" }
];

const UutIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [serialVerified, setSerialVerified] = useState(false);
  const [serialVerificationMessage, setSerialVerificationMessage] = useState("");
  
  const {
    projectNames,
    loading: fetchLoading,
    searchSerialInProject,
  } = useDependentDropdowns();

  const [form, setForm] = useState({
    serialNo: "",
    challanNo: "",
    uutInDate: new Date().toISOString().split('T')[0], 
    customerName: "",
    testTypeName: "CEMILAC",
    testTypeCode: "C",
    projectName: "",
    uutType: "UT",
    contactPersonName: "",
  });
  
  const uutQty = getUnitCount(form.serialNo);
  const today = new Date().toISOString().split("T")[0];

  const [showCustomTest, setShowCustomTest] = useState(false);
  const [customTestName, setCustomTestName] = useState("");
  const [customTestCode, setCustomTestCode] = useState("");

  const customerCode = useMemo(() => {
    if (!form.customerName) return "XX";
    
    const cleaned = form.customerName.trim().replace(/\s+/g, " ");
    const parts = cleaned.split(" ").filter(Boolean);
    
    if (parts.length === 0) return "XX";
    
    const first = parts[0][0] || "X";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] || "X";
    
    return (first + last).toUpperCase().replace(/[^A-Z]/g, "X").slice(0, 2);
  }, [form.customerName]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Handle project name change
  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    setForm(prev => ({ ...prev, projectName }));
  };

  // Handle serial number change - only update state
  const handleSerialNumberChange = (e) => {
    const serialNo = e.target.value;
    setForm(prev => ({ ...prev, serialNo }));
  };

  // Handle serial number blur - search and auto-fill form when user leaves field
  const handleSerialNumberBlur = async () => {
    const { serialNo, projectName } = form;

    if (serialNo && projectName) {
      try {
        const details = await searchSerialInProject(projectName, serialNo);
        if (details) {
          // Auto-fill form with details from matched request
          setForm(prev => ({
            ...prev,
            serialNo,
            projectName: details.projectName,
            customerName: details.customerName,
            testTypeName: details.testTypeName,
            testTypeCode: details.testTypeCode,
            uutType: details.uutType,
            contactPersonName: details.contactPersonName,
          }));
          setSerialVerified(true);
          setSerialVerificationMessage("✓ Serial number verified");
          toast.success("Serial number matched! Form auto-filled");
        } else {
          setSerialVerified(false);
          setSerialVerificationMessage("✗ Serial number not found in selected project");
          toast.error("Serial number not found in selected project");
        }
      } catch (error) {
        setSerialVerified(false);
        setSerialVerificationMessage("✗ Error verifying serial number");
        console.error("Error searching serial:", error);
        toast.error("Failed to search serial number");
      }
    } else if (!serialNo) {
      setSerialVerified(false);
      setSerialVerificationMessage("");
    }
  };

  const handleTestTypeChange = (e) => {
    const value = e.target.value;    
    if (value === "custom") {
      setShowCustomTest(true);
      setForm(prev => ({ ...prev, testTypeName: "", testTypeCode: "" }));
    } else {
      setShowCustomTest(false);
      const selected = PREDEFINED_TEST_TYPES.find(t => t.name === value);
      if (selected) {
        setForm(prev => ({ 
          ...prev, 
          testTypeName: selected.name, 
          testTypeCode: selected.code 
        }));
      }
    }
  };

  const addCustomTestType = () => {
    if (!customTestName.trim() || !customTestCode.trim()) {
      toast.error("Please enter both test name and code");
      return;
    }
    
    if (customTestCode.length !== 1) {
      toast.error("Test code must be a single letter");
      return;
    }

    setForm(prev => ({
      ...prev,
      testTypeName: customTestName.trim(),
      testTypeCode: customTestCode.trim().toUpperCase()
    }));
    
    setShowCustomTest(false);
    setCustomTestName("");
    setCustomTestCode("");
  };
  
  function getUnitCount(input) {
  if (!input || !input.trim()) return 0;

  const unique = new Set();
  const parts = input.split(",");

  for (let raw of parts) {
    let part = raw.trim();
    if (!part) continue;

    part = part.replace(/\s+to\s+/gi, "-");

    if (part.includes("-")) {
      const [startRaw, endRaw] = part.split("-").map(p => p.trim());

      const match = startRaw.match(/^(.*?)(\d+)$/);
      if (!match) continue;

      const prefix = match[1] || "";
      const startStr = match[2];
      const startNum = Number(startStr);

      const endMatch = endRaw.match(/(\d+)$/);
      const endNum = endMatch ? Number(endMatch[1]) : NaN;

      if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) continue;

      const padLength = startStr.length;

      for (let i = startNum; i <= endNum; i++) {
        unique.add(prefix + i.toString().padStart(padLength, "0"));
      }
    }
    else {
      unique.add(part);
    }
  }

  return unique.size;
}

  const handlePreview = async () => {
    if (!form.serialNo || !form.customerName || !form.testTypeName || !form.testTypeCode || !form.projectName) {
      toast.error("Please fill all required fields");
      return;
    }
     if(uutQty<=0) {
      toast.error("Please fill  Serial No. correctly");
      return;
     }
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload={
        ...form,
        uutQty,
      }
      const response = await fetch(`${API_BASE_URL}/uut-records/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Preview failed");
      }
      setPreviewData(data.data);
      setShowConfirmModal(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!previewData) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");      
      const payload = {
        ...form,
        uutQty,
        expectedUutCode: previewData.uutCode,
        uutInDate: new Date().toISOString()
      };
      const response = await fetch(`${API_BASE_URL}/uut-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "UUT_CODE_CHANGED") {
          alert("UUT code changed due to concurrent activity. Please preview again.");
          setShowConfirmModal(false);
          setPreviewData(null);
          return;
        }
        throw new Error(data.error || "Save failed");
      }
      alert(`Success! UUT Code: ${data.data.uutCode}`);      
      setForm({
        serialNo: "",
        challanNo: "",
        uutInDate: new Date().toISOString().split('T')[0],
        customerName: "",
        testTypeName: "CEMILAC",
        testTypeCode: "C",
        projectName: "",
        uutType: "UT",
        uutSrNo: "",
      });      
      setShowConfirmModal(false);
      setPreviewData(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Unit In Record</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill details to register a new UUT in the lab
          </p>
        </div>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <select
                value={form.projectName}
                onChange={handleProjectChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="">-- Select Project Name --</option>
                {projectNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Serial No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.serialNo}
                onChange={handleSerialNumberChange}
                onBlur={handleSerialNumberBlur}
                placeholder="Enter serial number"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              {form.projectName && !serialVerificationMessage && (
                <p className="text-xs text-slate-500 mt-1">
                  Type serial number and press Tab or click elsewhere to search
                </p>
              )}
              {serialVerificationMessage && (
                <span className={`text-xs mt-1 block ${serialVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {serialVerificationMessage}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Challan No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.challanNo}
                onChange={handleChange("challanNo")}
                placeholder="xxxx"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"                
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={handleChange("customerName")}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="e.g., John Doe"
              />
              <p className="text-xs text-slate-500 mt-1">
                Customer Code (auto): <span className="font-semibold text-amber-600">{customerCode}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type of Test <span className="text-red-500">*</span>
              </label>
              <select
                value={showCustomTest ? "custom" : form.testTypeName}
                onChange={handleTestTypeChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                {PREDEFINED_TEST_TYPES.map(type => (
                  <option key={type.name} value={type.name}>
                    {type.name} ({type.code})
                  </option>
                ))}
                <option value="custom">+ Add New Test Type</option>
              </select>

              {showCustomTest && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-semibold text-amber-900 mb-2">Add Custom Test Type</p>
                  <input
                    type="text"
                    placeholder="Test Name"
                    value={customTestName}
                    onChange={(e) => setCustomTestName(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Code (1 letter)"
                    maxLength={1}
                    value={customTestCode}
                    onChange={(e) => setCustomTestCode(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addCustomTestType}
                      className="flex-1 px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomTest(false)}
                      className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                UUT Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.uutType}
                onChange={handleChange("uutType")}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="AS">Assembly (AS)</option>
                <option value="UT">Unit (UT)</option>
                <option value="BB">Bare Board (BB)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                UUT In Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.uutInDate}
                onChange={handleChange("uutInDate")}
                max={today}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={form.contactPersonName}
                onChange={handleChange("contactPersonName")}
                placeholder="eg. John Doe"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"                
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                UUT Qty.
              </label>
              <input
                type="number"
                min="1"
                readOnly
                value={uutQty}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/units')}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={!serialVerified || loading}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!serialVerified ? "Please verify serial number first" : ""}
            >
              {loading ? "Processing..." : "Create"}
            </button>
          </div>
        </form>
      </div>

      {showConfirmModal && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Confirm UUT Code
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Please verify the auto-generated UUT code before saving.
            </p>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                Generated UUT Code
              </div>
              <div className="text-2xl font-bold text-slate-900 break-all">
                {previewData.uutCode}
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200">
                <div className="text-sm text-slate-700">
                  <span className="font-medium">Serial of Day:</span>{" "}
                  {String(previewData.serialOfDay).padStart(4, "0")}
                </div>
                <div className="text-sm text-slate-700">
                  <span className="font-medium">Customer Code:</span>{" "}
                  {previewData.customerCode}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPreviewData(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
              >Cancel</button>
              <button
                onClick={handleConfirmSave}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Confirm & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UutIn;