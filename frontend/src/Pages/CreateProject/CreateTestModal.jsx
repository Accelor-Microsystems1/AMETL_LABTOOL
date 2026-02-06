import React, { useState } from "react";

const CreateTestModal = ({ isOpen, onClose, onTestCreated }) => {
  const [testName, setTestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!testName.trim()) {
      setError("Test name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testName: testName.trim() })
      });

      const result = await response.json();

      if (result.success) {
        onTestCreated(result.data);
        setTestName("");
        onClose();
      } else {
        setError(result.error || "Failed to create test");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTestName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-200">➕ Create New Test</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-200 mb-1">
              Test Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={testName}
              onChange={(e) => {
                setTestName(e.target.value);
                setError("");
              }}
              placeholder="e.g., Thermal Cycling, Vibration Test"
              className="input w-full"
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary flex-1 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Creating..." : "Create Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestModal;