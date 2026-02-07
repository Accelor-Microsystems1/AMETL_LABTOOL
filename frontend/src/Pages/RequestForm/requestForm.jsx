import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestSchema } from "../../Schema/requestFormSchema";
import TestRequestPreview from "../../components/customizedComponents/TestRequestPreview";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const calculateQuantityFromSerial = (serialNo) => {
  if (!serialNo || typeof serialNo !== "string") return null;

  const trimmed = serialNo.trim();
  if (!trimmed) return null;

  const separators = [/\s+to\s+/i, /\s+-\s+/];

  let parts = null;

  for (const separator of separators) {
    if (separator.test(trimmed)) {
      parts = trimmed.split(separator);
      break;
    }
  }

  if (!parts) {
    const prefixRangeMatch = trimmed.match(
      /^([a-zA-Z]+[-_]?)(\d+)\s*[-–]\s*(\d+)$/i
    );
    if (prefixRangeMatch) {
      const start = parseInt(prefixRangeMatch[2], 10);
      const end = parseInt(prefixRangeMatch[3], 10);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        return end - start + 1;
      }
    }

    const simpleRangeMatch = trimmed.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (simpleRangeMatch) {
      const start = parseInt(simpleRangeMatch[1], 10);
      const end = parseInt(simpleRangeMatch[2], 10);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        return end - start + 1;
      }
    }

    return 1;
  }

  if (parts.length !== 2) return null;

  const startNumbers = parts[0].match(/\d+/g);
  const endNumbers = parts[1].match(/\d+/g);

  if (!startNumbers || !endNumbers) return null;

  const start = parseInt(startNumbers[startNumbers.length - 1], 10);
  const end = parseInt(endNumbers[endNumbers.length - 1], 10);

  if (isNaN(start) || isNaN(end)) return null;
  if (end < start) return null;

  return end - start + 1;
};

const stepFields = {
  1: [
    "companyName",
    "companyAddress",
    "contactPerson",
    "contactNumber",
    "customerEmail",
    "uutName",
    "noOfUUT",
    "dimension",
    "weight",
    "uutSerialNo",
    "repeatTest",
    "previousRefNo",
    "testLevel",
    "otherTestLevel",
  ],
  2: [
    "testName",
    "testSpecification",
    "testStandard",
    "specialRequirement",
    "customerRepName",
    "customerRepDate",
    "qaRepName",
    "qaRepDate",
  ],
};

const RequestForm = () => {
  // ============================================
  // FORM STATES
  // ============================================
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [calculatedQuantity, setCalculatedQuantity] = useState(null);
  const savedDataRef = useRef({});

  // ============================================
  // PROJECT & TEST DROPDOWN STATES
  // ============================================
  const [projects, setProjects] = useState([]);
  const [projectTests, setProjectTests] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProjectTestId, setSelectedProjectTestId] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [isLoadingSpec, setIsLoadingSpec] = useState(false);

  // ============================================
  // REACT HOOK FORM
  // ============================================
  const {
    register,
    trigger,
    watch,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requestSchema),
    mode: "onTouched",
    shouldUnregister: false,
  });

  const testLevel = watch("testLevel");
  const uutSerialNo = watch("uutSerialNo");

  // ============================================
  // CALCULATE QUANTITY FROM SERIAL
  // ============================================
  useEffect(() => {
    const quantity = calculateQuantityFromSerial(uutSerialNo);
    setCalculatedQuantity(quantity);
  }, [uutSerialNo]);

  // ============================================
  // FETCH PROJECTS ON COMPONENT MOUNT
  // ============================================
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/projects`);
      const result = await response.json();

      if (result.success) {
        setProjects(result.data);
        console.log("Projects loaded:", result.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // ============================================
  // FETCH TESTS FOR SELECTED PROJECT
  // ============================================
  const fetchProjectTests = async (projectId) => {
    if (!projectId) return;

    setIsLoadingTests(true);
    setProjectTests([]);
    setSelectedProjectTestId("");
    setValue("testName", "");
    setValue("testSpecification", "");

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/projects/${projectId}/tests`
      );
      const result = await response.json();

      if (result.success) {
        setProjectTests(result.data);
        console.log("Tests loaded:", result.data);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setIsLoadingTests(false);
    }
  };

  // ============================================
  // FETCH SPECIFICATION FOR SELECTED TEST
  // ============================================
  const fetchSpecification = async (projectTestId) => {
    if (!projectTestId) return;

    setIsLoadingSpec(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/projects/specification/${projectTestId}`
      );
      const result = await response.json();

      if (result.success) {
        setValue("testSpecification", result.data.specification || "");
        console.log("Specification loaded:", result.data.specification);
      }
    } catch (error) {
      console.error("Error fetching specification:", error);
    } finally {
      setIsLoadingSpec(false);
    }
  };

  // ============================================
  // HANDLE PROJECT SELECTION (Step 1)
  // ============================================
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    console.log("Project selected:", projectId);

    setSelectedProjectId(projectId);

    // Find project and set uutName
    const project = projects.find((p) => p.id === parseInt(projectId));
    if (project) {
      setValue("uutName", project.projectName);
      console.log("UUT Name set to:", project.projectName);
    } else {
      setValue("uutName", "");
    }

    // Reset test selections when project changes
    setSelectedProjectTestId("");
    setProjectTests([]);
    setValue("testName", "");
    setValue("testSpecification", "");
  };

  // ============================================
  // HANDLE TEST SELECTION (Step 2)
  // ============================================
  const handleTestChange = (e) => {
    const projectTestId = e.target.value;
    console.log("Test selected:", projectTestId);

    setSelectedProjectTestId(projectTestId);

    // Find test and set testName
    const projectTest = projectTests.find(
      (pt) => pt.id === parseInt(projectTestId)
    );
    if (projectTest) {
      setValue("testName", projectTest.test.testName);
      console.log("Test Name set to:", projectTest.test.testName);

      // Fetch specification for this test
      fetchSpecification(projectTestId);
    } else {
      setValue("testName", "");
      setValue("testSpecification", "");
    }
  };

  // ============================================
  // NEXT STEP
  // ============================================
  const nextStep = async () => {
    const valid = await trigger(stepFields[step], { shouldFocus: true });
    if (!valid) return;

    // When going from Step 1 to Step 2, fetch tests
    if (step === 1 && selectedProjectId) {
      console.log("Fetching tests for project:", selectedProjectId);
      await fetchProjectTests(selectedProjectId);
    }

    // Save current form data
    savedDataRef.current = {
      ...savedDataRef.current,
      ...getValues(),
      calculatedQuantity: calculatedQuantity,
      selectedProjectId: selectedProjectId,
      selectedProjectTestId: selectedProjectTestId,
    };

    console.log("Saved data:", savedDataRef.current);

    setStep((prev) => prev + 1);
  };

  // ============================================
  // PREVIOUS STEP
  // ============================================
  const prevStep = () => {
    // Restore saved data
    reset(savedDataRef.current);

    // Restore calculated quantity
    if (savedDataRef.current.uutSerialNo) {
      const quantity = calculateQuantityFromSerial(
        savedDataRef.current.uutSerialNo
      );
      setCalculatedQuantity(quantity);
    }

    // Restore selected IDs
    if (savedDataRef.current.selectedProjectId) {
      setSelectedProjectId(savedDataRef.current.selectedProjectId);
    }
    if (savedDataRef.current.selectedProjectTestId) {
      setSelectedProjectTestId(savedDataRef.current.selectedProjectTestId);
    }

    setStep((prev) => prev - 1);
  };

  // ============================================
  // SUBMIT FORM
  // ============================================
  const onSubmit = async () => {
    const formData = {
      ...savedDataRef.current,
      ...getValues(),
      calculatedQuantity: calculatedQuantity,
    };

    console.log("Final submit:", formData);

    // ✅ REMOVED projectId and projectTestId - Backend doesn't support them
    const backendData = {
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      contactPerson: formData.contactPerson,
      contactNumber: formData.contactNumber,
      customerEmail: formData.customerEmail,
      uutName: formData.uutName,
      noOfUUT: formData.noOfUUT,
      dimension: formData.dimension,
      weight: formData.weight,
      uutSerialNo: formData.uutSerialNo,
      calculatedQuantity: formData.calculatedQuantity,
      repeatTest: formData.repeatTest,
      previousRefNo: formData.previousRefNo || null,
      testLevel:
        formData.testLevel === "Other"
          ? formData.otherTestLevel
          : formData.testLevel,
      testName: formData.testName,
      testSpecification: formData.testSpecification,
      testStandard: formData.testStandard || null,
      specialRequirement: formData.specialRequirement || null,
      customerRepName: formData.customerRepName,
      customerRepDate: formData.customerRepDate,
      qaRepName: formData.qaRepName || null,
      qaRepDate: formData.qaRepDate || null,
    };

    console.log("Backend data:", backendData);

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/test-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Success:", result);
        setSubmitStatus("success");

        // Reset everything
        savedDataRef.current = {};
        setCalculatedQuantity(null);
        setSelectedProjectId("");
        setSelectedProjectTestId("");
        setProjectTests([]);

        reset({
          companyName: "",
          companyAddress: "",
          contactPerson: "",
          contactNumber: "",
          customerEmail: "",
          uutName: "",
          noOfUUT: "",
          dimension: "",
          weight: "",
          uutSerialNo: "",
          repeatTest: "no",
          previousRefNo: "",
          testLevel: "Developmental",
          otherTestLevel: "",
          testName: "",
          testSpecification: "",
          testStandard: "",
          specialRequirement: "",
          customerRepName: "",
          customerRepDate: "",
          qaRepName: "",
          qaRepDate: "",
        });

        setTimeout(() => {
          setStep(1);
          setSubmitStatus(null);
        }, 2000);
      } else {
        console.error("Error response:", result);
        setSubmitStatus("error");
        alert(result.error || "Failed to submit form");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitStatus("error");
      alert("Network error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // ERROR MESSAGE COMPONENT
  // ============================================
  const ErrorMessage = ({ name }) => {
    return errors[name] ? (
      <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
    ) : null;
  };

  // ============================================
  // STEP INDICATOR COMPONENT
  // ============================================
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === s
                ? "bg-blue-500 text-white"
                : step > s
                  ? "bg-green-500 text-white"
                  : "bg-gray-600 text-gray-300"
            }`}
          >
            {step > s ? "✓" : s}
          </div>
          {s < 3 && (
            <div
              className={`w-16 h-1 ${step > s ? "bg-green-500" : "bg-gray-600"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-8 px-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-gray-800 p-8 rounded-lg w-full max-w-6xl space-y-6"
      >
        <h2 className="text-3xl text-center font-bold text-gray-200">
          Test Request Form
        </h2>

        <StepIndicator />

        {/* ============================================ */}
        {/* STEP 1: Customer & UUT Details */}
        {/* ============================================ */}
        {step === 1 && (
          <>
            <h3 className="text-gray-200 font-semibold text-xl border-b border-gray-600 pb-2">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label text-gray-200">Company Name</label>
                <input
                  className={`input ${errors.companyName ? "border-red-500" : ""}`}
                  placeholder="Enter company name"
                  {...register("companyName")}
                />
                <ErrorMessage name="companyName" />
              </div>

              <div>
                <label className="label text-gray-200">Company Address</label>
                <input
                  className={`input ${errors.companyAddress ? "border-red-500" : ""}`}
                  placeholder="Enter company address"
                  {...register("companyAddress")}
                />
                <ErrorMessage name="companyAddress" />
              </div>

              <div>
                <label className="label text-gray-200">Contact Person</label>
                <input
                  className={`input ${errors.contactPerson ? "border-red-500" : ""}`}
                  placeholder="Contact person name"
                  {...register("contactPerson")}
                />
                <ErrorMessage name="contactPerson" />
              </div>

              <div>
                <label className="label text-gray-200">Contact Number</label>
                <input
                  className={`input ${errors.contactNumber ? "border-red-500" : ""}`}
                  placeholder="10 digit mobile number"
                  {...register("contactNumber")}
                />
                <ErrorMessage name="contactNumber" />
              </div>

              <div>
                <label className="label text-gray-200">Email</label>
                <input
                  className={`input ${errors.customerEmail ? "border-red-500" : ""}`}
                  placeholder="example@email.com"
                  {...register("customerEmail")}
                />
                <ErrorMessage name="customerEmail" />
              </div>
            </div>

            <h3 className="text-gray-200 font-semibold text-xl border-b border-gray-600 pb-2 mt-6">
              Details of Unit Under Test (UUT)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* UUT Name - Project Dropdown */}
              <div>
                <label className="label text-gray-200">
                  UUT Name (Project)
                </label>
                <select
                  className={`input ${errors.uutName ? "border-red-500" : ""}`}
                  value={selectedProjectId}
                  onChange={handleProjectChange}
                  disabled={isLoadingProjects}
                >
                  <option value="">
                    {isLoadingProjects
                      ? "Loading projects..."
                      : "Select Project"}
                  </option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
                {/* Hidden input for form validation */}
                <input type="hidden" {...register("uutName")} />
                <ErrorMessage name="uutName" />
              </div>

              <div>
                <label className="label text-gray-200">No of UUT</label>
                <input
                  className={`input ${errors.noOfUUT ? "border-red-500" : ""}`}
                  placeholder="Number of units"
                  {...register("noOfUUT")}
                />
                <ErrorMessage name="noOfUUT" />
              </div>

              <div>
                <label className="label text-gray-200">Dimension</label>
                <input
                  className={`input ${errors.dimension ? "border-red-500" : ""}`}
                  placeholder="L x W x H (in mm)"
                  {...register("dimension")}
                />
                <ErrorMessage name="dimension" />
              </div>

              <div>
                <label className="label text-gray-200">Weight</label>
                <input
                  className={`input ${errors.weight ? "border-red-500" : ""}`}
                  placeholder="Weight in kg"
                  {...register("weight")}
                />
                <ErrorMessage name="weight" />
              </div>

              <div>
                <label className="label text-gray-200">UUT Serial No.</label>
                <input
                  className={`input ${errors.uutSerialNo ? "border-red-500" : ""}`}
                  placeholder="e.g., MB-667 to 705"
                  {...register("uutSerialNo")}
                />
                <ErrorMessage name="uutSerialNo" />
                <p className="text-gray-400 text-xs mt-1">
                  Formats: MB-667 to 705, 602-605, m-6 - m-14
                </p>
              </div>

              {/* Calculated Quantity Field */}
              <div>
                <label className="label text-gray-200">Total Quantity</label>
                <div className="relative">
                  <input
                    className={`input ${
                      calculatedQuantity
                        ? "bg-green-900/30 border-green-600"
                        : "bg-gray-700"
                    } cursor-not-allowed`}
                    value={
                      calculatedQuantity !== null
                        ? `${calculatedQuantity} unit${calculatedQuantity > 1 ? "s" : ""}`
                        : "Auto-calculated"
                    }
                    readOnly
                    disabled
                  />
                  {calculatedQuantity !== null && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {calculatedQuantity === null && uutSerialNo
                    ? "⚠️ Could not parse range"
                    : "Calculated from serial range"}
                </p>
              </div>

              <div>
                <label className="label text-gray-200">Repeat Test?</label>
                <select
                  className={`input ${errors.repeatTest ? "border-red-500" : ""}`}
                  {...register("repeatTest")}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
                <ErrorMessage name="repeatTest" />
              </div>

              <div>
                <label className="label text-gray-200">Previous Ref No</label>
                <input
                  className={`input ${errors.previousRefNo ? "border-red-500" : ""}`}
                  placeholder="If any"
                  {...register("previousRefNo")}
                />
                <ErrorMessage name="previousRefNo" />
              </div>

              <div>
                <label className="label text-gray-200">Test Level</label>
                <select
                  className={`input ${errors.testLevel ? "border-red-500" : ""}`}
                  {...register("testLevel")}
                >
                  <option value="Developmental">Developmental</option>
                  <option value="ESS">ESS</option>
                  <option value="Acceptance">Acceptance</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Cemilac">Cemilac</option>
                  <option value="Other">Other</option>
                </select>
                <ErrorMessage name="testLevel" />
              </div>

              {testLevel === "Other" && (
                <div>
                  <label className="label text-gray-200">
                    Other Test Level
                  </label>
                  <input
                    className={`input ${errors.otherTestLevel ? "border-red-500" : ""}`}
                    placeholder="Specify test level"
                    {...register("otherTestLevel")}
                  />
                  <ErrorMessage name="otherTestLevel" />
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================================ */}
        {/* STEP 2: Test Details */}
        {/* ============================================ */}
        {step === 2 && (
          <>
            <h3 className="text-gray-200 font-semibold text-xl border-b border-gray-600 pb-2">
              Test Name and Specification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Test Name Dropdown */}
              <div>
                <label className="label text-gray-200">Test Name</label>
                <select
                  className={`input ${errors.testName ? "border-red-500" : ""}`}
                  value={selectedProjectTestId}
                  onChange={handleTestChange}
                  disabled={isLoadingTests}
                >
                  <option value="">
                    {isLoadingTests
                      ? "Loading tests..."
                      : projectTests.length === 0
                        ? "No tests available"
                        : "Select Test"}
                  </option>
                  {projectTests.map((projectTest) => (
                    <option key={projectTest.id} value={projectTest.id}>
                      {projectTest.test?.testName || "Unknown Test"}
                    </option>
                  ))}
                </select>
                {/* Hidden input for form validation */}
                <input type="hidden" {...register("testName")} />
                <ErrorMessage name="testName" />
              </div>

              {/* Test Standard */}
              <div>
                <label className="label text-gray-200">Test Standard</label>
                <input
                  className={`input ${errors.testStandard ? "border-red-500" : ""}`}
                  placeholder="e.g., MIL-STD-810G"
                  {...register("testStandard")}
                />
                <ErrorMessage name="testStandard" />
              </div>

              {/* Special Requirement */}
              <div>
                <label className="label text-gray-200">
                  Special Requirement
                </label>
                <input
                  className={`input ${errors.specialRequirement ? "border-red-500" : ""}`}
                  placeholder="Any special requirement"
                  {...register("specialRequirement")}
                />
                <ErrorMessage name="specialRequirement" />
              </div>

              {/* Test Specification - Auto-filled */}
              <div className="md:col-span-3">
                <label className="label text-gray-200">
                  Test Specification
                  {isLoadingSpec && (
                    <span className="ml-2 text-blue-400 text-sm">
                      (Loading...)
                    </span>
                  )}
                </label>
                <textarea
                  className={`input ${errors.testSpecification ? "border-red-500" : ""} min-h-[120px] resize-y bg-gray-600`}
                  placeholder="Auto-filled when test is selected"
                  
                  {...register("testSpecification")}
                />
                <ErrorMessage name="testSpecification" />
                <p className="text-gray-400 text-xs mt-1">
                  ℹ️ Specification is auto-filled based on selected test
                </p>
              </div>
            </div>

            {/* Representatives Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Customer Representative */}
              <div className="flex flex-col md:col-start-1 bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-200 font-semibold text-lg mb-4 border-b border-gray-500 pb-2">
                  Customer Representative
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="label text-gray-200">Name</label>
                    <input
                      className={`input ${errors.customerRepName ? "border-red-500" : ""}`}
                      placeholder="Representative name"
                      {...register("customerRepName")}
                    />
                    <ErrorMessage name="customerRepName" />
                  </div>

                  <div>
                    <label className="label text-gray-200">Date</label>
                    <input
                      className={`input ${errors.customerRepDate ? "border-red-500" : ""}`}
                      type="date"
                      {...register("customerRepDate")}
                    />
                    <ErrorMessage name="customerRepDate" />
                  </div>
                </div>
              </div>

              {/* QA Representative */}
              <div className="flex flex-col md:col-start-3 bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-200 font-semibold text-lg mb-4 border-b border-gray-500 pb-2">
                  R&QA / QA Agency / Project QC
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="label text-gray-200">Name</label>
                    <input
                      className={`input ${errors.qaRepName ? "border-red-500" : ""}`}
                      placeholder="Representative name"
                      {...register("qaRepName")}
                    />
                    <ErrorMessage name="qaRepName" />
                  </div>

                  <div>
                    <label className="label text-gray-200">Date</label>
                    <input
                      className={`input ${errors.qaRepDate ? "border-red-500" : ""}`}
                      type="date"
                      {...register("qaRepDate")}
                    />
                    <ErrorMessage name="qaRepDate" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================ */}
        {/* STEP 3: Preview */}
        {/* ============================================ */}
        {step === 3 && (
          <>
            <h3 className="text-gray-200 font-semibold text-xl border-b border-gray-600 pb-2">
              Preview Your Request
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Please review all the details before submitting.
            </p>

            {/* Preview Component */}
            <TestRequestPreview formData={savedDataRef.current} />

            {/* Submit Status Messages */}
            {submitStatus === "success" && (
              <div className="bg-green-600 text-white p-4 rounded-lg text-center">
                ✓ Form submitted successfully! Redirecting...
              </div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-600 text-white p-4 rounded-lg text-center">
                ✗ Submission failed. Please try again.
              </div>
            )}
          </>
        )}

        <p className="text-gray-400 text-sm italic">
          <span className="text-red-500">*</span> All fields are required
        </p>

        {/* ============================================ */}
        {/* Navigation Buttons */}
        {/* ============================================ */}
        <div className="flex justify-between pt-6 border-t border-gray-600">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary flex items-center gap-2"
            >
              ← Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center gap-2"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`btn-primary flex items-center gap-2 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span> Submitting...
                </>
              ) : (
                <>✓ Confirm & Submit</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RequestForm;