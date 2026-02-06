import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestSchema } from "../../Schema/requestFormSchema";
import TestRequestPreview from "../../components/customizedComponents/TestRequestPreview";

/**
 * Function to calculate quantity from serial number range
 * Supports formats:
 * - "MB-667 to 705"
 * - "MB-667 to MB-705"
 * - "602-605"
 * - "m-6 - m-14"
 * - "ABC-001 to ABC-100"
 */
const calculateQuantityFromSerial = (serialNo) => {
  if (!serialNo || typeof serialNo !== "string") return null;

  const trimmed = serialNo.trim();
  if (!trimmed) return null;

  // Separators to try (in order of priority)
  const separators = [
    /\s+to\s+/i, // " to " (case insensitive)
    /\s+-\s+/, // " - " (with spaces around dash)
  ];

  let parts = null;

  for (const separator of separators) {
    if (separator.test(trimmed)) {
      parts = trimmed.split(separator);
      break;
    }
  }

  // If no separator found, try to match patterns without clear separator
  if (!parts) {
    // Pattern: "prefix-startNum-endNum" like "MB-667-705"
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

    // Simple numeric range: "602-605" or "602 - 605"
    const simpleRangeMatch = trimmed.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (simpleRangeMatch) {
      const start = parseInt(simpleRangeMatch[1], 10);
      const end = parseInt(simpleRangeMatch[2], 10);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        return end - start + 1;
      }
    }

    // Single item (no range detected)
    return 1;
  }

  if (parts.length !== 2) return null;

  // Extract numbers from each part
  const startNumbers = parts[0].match(/\d+/g);
  const endNumbers = parts[1].match(/\d+/g);

  if (!startNumbers || !endNumbers) return null;

  // Get the last number from start and end parts
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
    "unitName",
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
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [calculatedQuantity, setCalculatedQuantity] = useState(null);
  const savedDataRef = useRef({});

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requestSchema),
    mode: "onTouched",
    shouldUnregister: true,
  });

  const testLevel = watch("testLevel");
  const uutSerialNo = watch("uutSerialNo");

  // Auto-calculate quantity when serial number changes
  useEffect(() => {
    const quantity = calculateQuantityFromSerial(uutSerialNo);
    setCalculatedQuantity(quantity);
  }, [uutSerialNo]);

  const nextStep = async () => {
    const valid = await trigger(stepFields[step], { shouldFocus: true });
    if (!valid) return;

    // Include calculated quantity in saved data
    savedDataRef.current = {
      ...savedDataRef.current,
      ...getValues(),
      calculatedQuantity: calculatedQuantity,
    };

    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    reset(savedDataRef.current);
    // Restore calculated quantity from saved data
    if (savedDataRef.current.uutSerialNo) {
      const quantity = calculateQuantityFromSerial(
        savedDataRef.current.uutSerialNo
      );
      setCalculatedQuantity(quantity);
    }
    setStep((prev) => prev - 1);
  };

  const onSubmit = async () => {
    const finalData = {
      ...savedDataRef.current,
      ...getValues(),
      calculatedQuantity: calculatedQuantity,
    };

    console.log("Final submit:", finalData);

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        savedDataRef.current = {};
        setCalculatedQuantity(null);
        reset();
        setTimeout(() => {
          setStep(1);
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable Error Message Component
  const ErrorMessage = ({ name }) => {
    return errors[name] ? (
      <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
    ) : null;
  };

  // Step Indicator Component
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

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-8 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-800 p-8 rounded-lg w-full max-w-6xl space-y-6"
      >
        <h2 className="text-3xl text-center font-bold text-gray-200">
          Test Request Form
        </h2>

        {/* Step Indicator */}
        <StepIndicator />

        {/* STEP 1 */}
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
              <div>
                <label className="label text-gray-200">Unit Name</label>
                <input
                  className={`input ${errors.unitName ? "border-red-500" : ""}`}
                  placeholder="Unit name"
                  {...register("unitName")}
                />
                <ErrorMessage name="unitName" />
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

              {/* NEW: Calculated Quantity Field */}
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

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h3 className="text-gray-200 font-semibold text-xl border-b border-gray-600 pb-2">
              Test Name and Specification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label text-gray-200">Test Name</label>
                <input
                  className={`input ${errors.testName ? "border-red-500" : ""}`}
                  placeholder="Test name"
                  {...register("testName")}
                />
                <ErrorMessage name="testName" />
              </div>

              <div>
                <label className="label text-gray-200">Test Standard</label>
                <input
                  className={`input ${errors.testStandard ? "border-red-500" : ""}`}
                  placeholder="Standard reference"
                  {...register("testStandard")}
                />
                <ErrorMessage name="testStandard" />
              </div>

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

              <div className="md:col-span-3">
                <label className="label text-gray-200">
                  Test Specification
                </label>
                <textarea
                  className={`input ${errors.testSpecification ? "border-red-500" : ""} min-h-[120px] resize-y`}
                  placeholder="Test specification details..."
                  {...register("testSpecification")}
                />
                <ErrorMessage name="testSpecification" />
              </div>
            </div>

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

        {/* STEP 3 - PREVIEW */}
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

        {/* NAVIGATION BUTTONS */}
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
              type="submit"
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

<<<<<<<<< Temporary merge branch 1
export default RequestForm;
