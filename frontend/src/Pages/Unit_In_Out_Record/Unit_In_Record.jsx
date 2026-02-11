import React, { useState, useMemo } from "react";
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

const UUT_TYPES = [
  { name: "Assembly", code: "AS" },
  { name: "Unit", code: "UT" },
  { name: "Bare Board", code: "BB" }
];

const UutIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  const [showCustomTestType, setShowCustomTestType] = useState(false);
  const [customTestTypeName, setCustomTestTypeName] = useState("");
  const [customTestTypeCode, setCustomTestTypeCode] = useState("");

  const {
    loading: fetchLoading,
    getProjectNames,
    getSerialsByProject,
    getTestsByProjectAndSerial,
    getDataByProjectAndSerial,
  } = useDependentDropdowns();

  const [form, setForm] = useState({
    projectName: "",
    serialNo: "",
    challanNo: "",
    uutInDate: new Date().toISOString().split('T')[0],
    customerName: "",
    testTypeName: "",      
    testTypeCode: "",   
    uutType: "",
    contactPersonName: "",
    tests: []
  });

  const [fetchedTests, setFetchedTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  
  const projectNames = getProjectNames();
  
  const serialNumbers = useMemo(() => {
    return getSerialsByProject(form.projectName);
  }, [form.projectName]);

  const uutQty = getUnitCount(form.serialNo);
  const today = new Date().toISOString().split("T")[0];

  const customerCode = useMemo(() => {
    if (!form.customerName) return "XX";
    
    const cleaned = form.customerName.trim().replace(/\s+/g, " ");
    const parts = cleaned.split(" ").filter(Boolean);
    
    if (parts.length === 0) return "XX";
    
    const first = parts[0][0] || "X";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] || "X";
    
    return (first + last).toUpperCase().replace(/[^A-Z]/g, "X").slice(0, 2);
  }, [form.customerName]);

  // Handle project change
  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    setForm(prev => ({
      ...prev,
      projectName,
      serialNo: "",
      customerName: "",
      contactPersonName: "",
      testTypeName: "",
      testTypeCode: "",
      uutType: "",
      tests: []
    }));
    setFetchedTests([]);
    setSelectedTests([]);
    setShowCustomTestType(false);
  };

  const handleSerialChange = (e) => {
    const serialNo = e.target.value;
    
    if (!serialNo) {
      setForm(prev => ({
        ...prev,
        serialNo: "",
        customerName: "",
        contactPersonName: "",
        tests: []
      }));

      setFetchedTests([]);
      setSelectedTests([]);
      return;
    }

    const data = getDataByProjectAndSerial(form.projectName, serialNo);
    const tests = getTestsByProjectAndSerial(form.projectName, serialNo);

    if (data) {
      setFetchedTests(tests);
      
      const allTestNames = tests.map(t => t.testName);
      setSelectedTests(allTestNames);
      
      const allTests = tests.map(t => ({
        testId: t.testId,
        testName: t.testName,
        testSpecification: t.testSpecification || ""
      }));

      setForm(prev => ({
        ...prev,
        serialNo,
        customerName: data.customerName || "",
        contactPersonName: data.contactPersonName || "",
        tests: allTests
      }));
      
      toast.success(`Found ${tests.length} test(s) for this serial`);
    } else {
      setForm(prev => ({ ...prev, serialNo }));
      setFetchedTests([]);
      setSelectedTests([]);
    }
  };

  const handleTestSelection = (testName) => {
    setSelectedTests(prev => {
      const isSelected = prev.includes(testName);
      let newSelection;
      
      if (isSelected) {
        newSelection = prev.filter(t => t !== testName);
      } else {
        newSelection = [...prev, testName];
      }
      
      const selectedTestObjects = fetchedTests
        .filter(t => newSelection.includes(t.testName))
        .map(t => ({
          testId: t.testId,
          testName: t.testName,
          testSpecification: t.testSpecification || ""
        }));
      
      setForm(prevForm => ({
        ...prevForm,
        tests: selectedTestObjects
      }));
      
      return newSelection;
    });
  };

  const handleSelectAllTests = () => {
    if (selectedTests.length === fetchedTests.length) {
      setSelectedTests([]);
      setForm(prev => ({ ...prev, tests: [] }));
    } else {
      const allTestNames = fetchedTests.map(t => t.testName);
      setSelectedTests(allTestNames);
      
      const allTests = fetchedTests.map(t => ({
        testId: t.testId,
        testName: t.testName,
        testSpecification: t.testSpecification || ""
      }));
      
      setForm(prev => ({ ...prev, tests: allTests }));
    }
  };

  const handleTestTypeChange = (e) => {
    const value = e.target.value;
    
    if (value === "custom") {
      setShowCustomTestType(true);
      setForm(prev => ({ ...prev, testTypeName: "", testTypeCode: "" }));
    } else {
      setShowCustomTestType(false);
      const selected = PREDEFINED_TEST_TYPES.find(t => t.name === value);
      if (selected) {
        setForm(prev => ({ 
          ...prev, 
          testTypeName: selected.name, 
          testTypeCode: selected.code 
        }));
      } else {
        setForm(prev => ({ 
          ...prev, 
          testTypeName: "", 
          testTypeCode: "" 
        }));
      }
    }
  };

  const addCustomTestType = () => {
    if (!customTestTypeName.trim() || !customTestTypeCode.trim()) {
      toast.error("Please enter both test type name and code");
      return;
    }
    
    if (customTestTypeCode.length !== 1) {
      toast.error("Test type code must be a single letter");
      return;
    }

    setForm(prev => ({
      ...prev,
      testTypeName: customTestTypeName.trim(),
      testTypeCode: customTestTypeCode.trim().toUpperCase()
    }));
    
    setShowCustomTestType(false);
    setCustomTestTypeName("");
    setCustomTestTypeCode("");
  };

  const handleUutTypeChange = (e) => {
    setForm(prev => ({ ...prev, uutType: e.target.value }));
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
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
      } else {
        unique.add(part);
      }
    }

    return unique.size;
  }

  const handlePreview = async () => {
    if (!form.projectName) {
      toast.error("Please select a project");
      return;
    }
    if (!form.serialNo) {
      toast.error("Please select a serial number");
      return;
    }
    if (!form.challanNo) {
      toast.error("Please enter challan number");
      return;
    }
    if (!form.customerName) {
      toast.error("Please enter customer name");
      return;
    }
    if (!form.testTypeName || !form.testTypeCode) {
      toast.error("Please select test type");
      return;
    }
    if (!form.uutType) {
      toast.error("Please select UUT type");
      return;
    }
    if (form.tests.length === 0) {
      toast.error("Please select at least one test");
      return;
    }
    if (uutQty <= 0) {
      toast.error("Invalid serial number format");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload = {
        ...form,
        uutQty,
        customerCode,
        tests: form.tests
      };
      
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
      toast.error(error.message);
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
        customerCode,
        expectedUutCode: previewData.uutCode,
        uutInDate: new Date(form.uutInDate).toISOString(),
        tests: form.tests 
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
          toast.error("UUT code changed. Please preview again.");
          setShowConfirmModal(false);
          setPreviewData(null);
          return;
        }
        throw new Error(data.error || "Save failed");
      }
      
      toast.success(
        `Success! UUT Code: ${data.data.uutCode}. ${data.updatedRequests || 0} request(s) marked as RECEIVED.`
      );
      
      setTimeout(() => {
        navigate('/units');  
      }, 100);

    } catch (error) {
      toast.error(error.message);
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

        {fetchLoading && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-lg">
            Loading approved requests...
          </div>
        )}

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
                <option value="">-- Select Project --</option>
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
              <select
                value={form.serialNo}
                onChange={handleSerialChange}
                disabled={!form.projectName}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!form.projectName 
                    ? "-- Select Project First --" 
                    : serialNumbers.length === 0 
                      ? "-- No Serials Found --"
                      : "-- Select Serial No --"
                  }
                </option>
                {serialNumbers.map((serial) => (
                  <option key={serial} value={serial}>
                    {serial}
                  </option>
                ))}
              </select>
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
                placeholder="Enter challan number"
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
                <span className="text-xs text-slate-400 ml-1">(for UUT Code)</span>
              </label>
              <select
                value={showCustomTestType ? "custom" : form.testTypeName}
                onChange={handleTestTypeChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="">-- Select Test Type --</option>
                {PREDEFINED_TEST_TYPES.map(type => (
                  <option key={type.name} value={type.name}>
                    {type.name} ({type.code})
                  </option>
                ))}
                <option value="custom">+ Add Custom Test Type</option>
              </select>

              {showCustomTestType && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-semibold text-amber-900 mb-2">Add Custom Test Type</p>
                  <input
                    type="text"
                    placeholder="Test Type Name"
                    value={customTestTypeName}
                    onChange={(e) => setCustomTestTypeName(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Code (1 letter)"
                    maxLength={1}
                    value={customTestTypeCode}
                    onChange={(e) => setCustomTestTypeCode(e.target.value)}
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
                      onClick={() => {
                        setShowCustomTestType(false);
                        setCustomTestTypeName("");
                        setCustomTestTypeCode("");
                      }}
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
                onChange={handleUutTypeChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="">-- Select UUT Type --</option>
                {UUT_TYPES.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {fetchedTests.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">
                  📋 Select Tests <span className="text-red-500">*</span>
                  <span className="text-xs text-slate-500 ml-2">
                    ({selectedTests.length}/{fetchedTests.length} selected)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllTests}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  {selectedTests.length === fetchedTests.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {fetchedTests.map((test, index) => (
                  <label 
                    key={index} 
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTests.includes(test.testName)
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.testName)}
                      onChange={() => handleTestSelection(test.testName)}
                      className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-slate-700 font-medium">
                      {test.testName}
                    </span>
                  </label>
                ))}
              </div>
              
              {selectedTests.length === 0 && (
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ Please select at least one test
                </p>
              )}
            </div>
          )}

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
                placeholder="e.g., John Doe"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-slate-50 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Buttons */}
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
              disabled={loading || !form.projectName || !form.serialNo || !form.testTypeName || !form.uutType || !form.challanNo || !form.customerName || selectedTests.length === 0}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Create"}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Confirm UUT Code
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Please verify the auto-generated UUT code before saving.
            </p>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                Generated UUT Code
              </div>
              <div className="text-2xl font-bold text-slate-900 break-all font-mono">
                {previewData.uutCode}
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200 grid grid-cols-2 gap-2 text-sm text-slate-700">
                <div>
                  <span className="font-medium">Serial of Day:</span>{" "}
                  {String(previewData.serialOfDay).padStart(4, "0")}
                </div>
                <div>
                  <span className="font-medium">Customer Code:</span>{" "}
                  {previewData.customerCode}
                </div>
                <div>
                  <span className="font-medium">Test Type:</span>{" "}
                  {form.testTypeName} ({form.testTypeCode})
                </div>
                <div>
                  <span className="font-medium">UUT Type:</span>{" "}
                  {form.uutType}
                </div>
              </div>
            </div>

            {/* Selected Tests */}
            {form.tests.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-green-700 mb-2">
                  ✓ Tests to be linked ({form.tests.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {form.tests.map((test, index) => (
                    <span key={index} className="px-2 py-1 bg-white border border-green-300 rounded text-xs text-green-700">
                      {test.testName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPreviewData(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
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