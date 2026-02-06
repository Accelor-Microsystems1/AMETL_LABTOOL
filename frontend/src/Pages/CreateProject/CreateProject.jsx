import React, { useState, useEffect } from "react";
import CreateTestModal from "./CreateTestModal";

const CreateProject = () => {
  // Project State
  const [projectName, setProjectName] = useState("");

  // Tests State
  const [availableTests, setAvailableTests] = useState([]);
  const [projectTests, setProjectTests] = useState([
    { id: 1, testId: "", specification: "" }
  ]);

  // UI State
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch Available Tests on Mount
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setIsLoadingTests(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/tests`);
      const result = await response.json();
      
      if (result.success) {
        setAvailableTests(result.data);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setIsLoadingTests(false);
    }
  };

  // Handle New Test Created from Modal
  const handleTestCreated = (newTest) => {
    setAvailableTests((prev) =>
      [...prev, newTest].sort((a, b) => a.testName.localeCompare(b.testName))
    );
  };

  // Add New Test Row
  const addTestRow = () => {
    const newId = Math.max(...projectTests.map((t) => t.id), 0) + 1;
    setProjectTests((prev) => [
      ...prev,
      { id: newId, testId: "", specification: "" }
    ]);
  };

  // Remove Test Row
  const removeTestRow = (id) => {
    if (projectTests.length === 1) {
      alert("At least one test is required");
      return;
    }
    setProjectTests((prev) => prev.filter((test) => test.id !== id));
  };

  // Update Test Row
  const updateTestRow = (id, field, value) => {
    setProjectTests((prev) =>
      prev.map((test) => (test.id === id ? { ...test, [field]: value } : test))
    );

    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`test_${id}_${field}`];
      return newErrors;
    });
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};

    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    projectTests.forEach((test) => {
      if (!test.testId) {
        newErrors[`test_${test.id}_testId`] = "Please select a test";
      }
      if (!test.specification.trim()) {
        newErrors[`test_${test.id}_specification`] = "Specification is required";
      }
    });

    // Check for duplicate tests
    const testIds = projectTests.map((t) => t.testId).filter((id) => id);
    const duplicates = testIds.filter(
      (id, index) => testIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      newErrors.duplicateTests = "Each test can only be added once";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: projectName.trim(),
          projectTests: projectTests.map((test) => ({
            testId: parseInt(test.testId),
            specification: test.specification.trim()
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        resetForm();
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        setSubmitStatus("error");
        setErrors({ submit: result.error || "Failed to create project" });
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setSubmitStatus("error");
      setErrors({ submit: "Something went wrong" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setProjectName("");
    setProjectTests([{ id: 1, testId: "", specification: "" }]);
    setErrors({});
  };

  // Get Test Name by ID
  const getTestName = (testId) => {
    const test = availableTests.find((t) => t.id === parseInt(testId));
    return test ? test.testName : "";
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-200 text-center">
            🛠️ Create New Project
          </h1>
          <p className="text-gray-400 text-center mt-2">
            Add a new project with associated tests and specifications
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === "success" && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6 flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span>Project created successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            ✗ {errors.submit}
          </div>
        )}

        {/* Duplicate Test Warning */}
        {errors.duplicateTests && (
          <div className="bg-yellow-600 text-white p-4 rounded-lg mb-6">
            ⚠️ {errors.duplicateTests}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Project Details Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 border-b border-gray-600 pb-2">
              📁 Project Details
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-200 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setErrors((prev) => ({ ...prev, projectName: "" }));
                  }}
                  placeholder="e.g., V2, FZ, Alpha"
                  className={`input w-full ${errors.projectName ? "border-red-500" : ""}`}
                />
                {errors.projectName && (
                  <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tests Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
              <h2 className="text-xl font-semibold text-gray-200">
                🧪 Tests & Specifications
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                + New Test
              </button>
            </div>

            {/* Info Note */}
            <div className="bg-blue-900 border-l-4 border-blue-400 p-3 rounded mb-4">
              <p className="text-blue-200 text-sm">
                ℹ️ Select tests from dropdown or create new ones. Each test needs its own specification.
              </p>
            </div>

            {/* Test Rows */}
            <div className="space-y-4">
              {projectTests.map((test, index) => (
                <div
                  key={test.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  {/* Test Row Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-gray-200 font-medium">
                      Test #{index + 1}
                      {test.testId && (
                        <span className="text-blue-400 ml-2">
                          ({getTestName(test.testId)})
                        </span>
                      )}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeTestRow(test.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                      disabled={projectTests.length === 1}
                    >
                      🗑️ Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Test Dropdown */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">
                        Select Test <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={test.testId}
                        onChange={(e) => updateTestRow(test.id, "testId", e.target.value)}
                        className={`input w-full ${errors[`test_${test.id}_testId`] ? "border-red-500" : ""}`}
                        disabled={isLoadingTests}
                      >
                        <option value="">
                          {isLoadingTests ? "Loading..." : "Select a test"}
                        </option>
                        {availableTests.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.testName}
                          </option>
                        ))}
                      </select>
                      {errors[`test_${test.id}_testId`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`test_${test.id}_testId`]}
                        </p>
                      )}
                    </div>

                    {/* Specification */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">
                        Specification <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={test.specification}
                        onChange={(e) => updateTestRow(test.id, "specification", e.target.value)}
                        placeholder="Enter detailed test specification for this project..."
                        className={`input w-full h-24 resize-y ${errors[`test_${test.id}_specification`] ? "border-red-500" : ""}`}
                      />
                      {errors[`test_${test.id}_specification`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`test_${test.id}_specification`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Test Button */}
            <button
              type="button"
              onClick={addTestRow}
              className="mt-4 w-full border-2 border-dashed border-gray-500 hover:border-blue-400 
                         text-gray-400 hover:text-blue-400 py-3 rounded-lg transition-colors"
            >
              + Add Another Test
            </button>
          </div>

          {/* Preview Section */}
          {projectTests.some((t) => t.testId) && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-4 border-b border-gray-600 pb-2">
                👁️ Preview
              </h2>

              <div className="bg-gray-700 rounded p-4">
                <p className="text-gray-200">
                  <span className="font-bold">Project:</span> {projectName || "(Not set)"}
                </p>

                <div className="mt-4">
                  <p className="text-gray-200 font-bold mb-2">Tests:</p>
                  <ul className="space-y-2">
                    {projectTests
                      .filter((t) => t.testId)
                      .map((test, index) => (
                        <li key={test.id} className="bg-gray-600 p-3 rounded text-sm">
                          <p className="text-blue-400 font-medium">
                            {index + 1}. {getTestName(test.testId)}
                          </p>
                          <p className="text-gray-300 mt-1">
                            <span className="text-gray-400">Specification:</span>{" "}
                            {test.specification || "(Not set)"}
                          </p>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary flex-1"
            >
              🔄 Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-primary flex-1 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "⏳ Creating..." : "✓ Create Project"}
            </button>
          </div>
        </form>
      </div>

      {/* Create Test Modal */}
      <CreateTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTestCreated={handleTestCreated}
      />
    </div>
  );
};

export default CreateProject;