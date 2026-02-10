// pages/Test_Request_Form/TestRequestPreview.jsx

import React from "react";
import logo from "../../assets/image.png";

// Date formatter helper function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return error;
  }
};

const TestRequestPreview = ({ formData }) => {
  const testLevelKeys = [
    "Developmental",
    "ESS",
    "Acceptance",
    "Qualification",
    "Cemilac",
  ];

  return (
    <div className="bg-white print:max-h-full">
      <div className="px-2 pb-2 pt-0 space-y-0 border border-gray-400" style={{ width: "100%" }}>
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-2 border-t border-blue-400">
          <img src={logo} alt="AMETL Logo" className="w-16 h-14 ml-2" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} />
          <div className="ml-8">
            <h1 className="text-lg font-bold text-center w-full text-gray-800">
              Accelor Microsystems
            </h1>
            <h1 className="text-lg font-bold w-full text-gray-800">
              Environment Test Laboratory
            </h1>
          </div>

          <div className="text-xs">
            <div className="flex flex-row border-b">
              <span className="font-semibold text-60 p-1 w-20">
                Document No.
              </span>
              <span className="p-1 text-blue-400 w-24">F/MK/01</span>
            </div>
            <div className="flex flex-row border-t border-blue-400 bg-blue-50">
              <span className="font-semibold p-1 w-20">Revision No.</span>
              <span className="p-1 w-24">02</span>
            </div>
            <div className="flex flex-row">
              <span className="font-semibold p-1 w-20">Date:</span>
              <span className="p-1 w-24">24-04-2025</span>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-2 text-center border-b border-blue-400 bg-blue-50 p-1">
          Test Request Form
        </h2>

        <div className="border border-gray-400 text-xs">
          {/* Date Section */}
          <div className="flex flex-row">
            <div className="flex flex-col border-gray-400 border-r w-[50%] justify-center items-center p-1">
              <h1 className="font-semibold text-sm">Test Request Form</h1>
              <h1>
                <i className="text-xs">(To Be filled by customer)</i>
              </h1>
            </div>
            <div className="flex flex-row items-center">
              <h1 className="font-semibold p-1 text-xs">Date:</h1>
              <p className="p-1 text-xs">
                {formatDate(formData.createdAt || new Date())}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <h2 className="border-t border-gray-400 bg-gray-300 p-1 font-semibold text-xs">
            Customer Information
          </h2>

          <div className="flex flex-col">
            <div className="flex flex-row border-t border-gray-400">
              <p className="border-r border-gray-400 font-semibold p-1 w-[30%] bg-gray-50 text-xs">
                Company Name
              </p>
              <p className="p-1 w-[70%] text-xs">{formData.companyName || "N/A"}</p>
            </div>

            <div className="flex flex-row border-t border-gray-400">
              <p className="border-r border-gray-400 font-semibold p-1 w-[30%] bg-gray-50 text-xs">
                Company Address
              </p>
              <p className="p-1 w-[70%] text-xs">{formData.companyAddress || "N/A"}</p>
            </div>

            <div className="flex flex-row border-t border-gray-400 text-xs">
              <p className="border-r border-gray-400 font-semibold p-1 w-[20%] bg-gray-50">
                Contact Person
              </p>
              <p className="p-1 w-[13%] border-r border-gray-400">
                {formData.contactPerson || "N/A"}
              </p>
              <p className="border-r border-gray-400 font-semibold p-1 w-[17%] bg-gray-50">
                Contact Number
              </p>
              <p className="p-1 w-[15%] border-r border-gray-400">
                {formData.contactNumber || "N/A"}
              </p>
              <p className="border-r border-gray-400 font-semibold p-1 w-[15%] bg-gray-50">
                Email Address
              </p>
              <p className="p-1 w-[20%]">{formData.customerEmail || "N/A"}</p>
            </div>
          </div>

          {/* UUT Details */}
          <h2 className="border-t border-gray-400 bg-gray-300 p-1 font-semibold text-xs">
            Details of Unit Under Test (UUT)
          </h2>

          <div className="flex flex-row border-t border-gray-400 text-xs">
            <p className="border-r border-gray-400 p-1 font-semibold w-[20%] bg-gray-50">
              UUT Name
            </p>
            <p className="p-1 w-[30%] border-r border-gray-400">
              {formData.uutName || "N/A"}
            </p>
            <p className="border-r border-gray-400 p-1 font-semibold w-[20%] bg-gray-50">
              No. of UUT for Test
            </p>
            <p className="p-1 w-[30%]">{formData.noOfUUT || "N/A"}</p>
          </div>

          <div className="flex flex-row border-t border-gray-400 text-xs">
            <p className="border-r border-gray-400 p-1 font-semibold w-[20%] bg-gray-50">
              Dimension
            </p>
            <p className="p-1 w-[30%] border-r border-gray-400">
              {formData.dimension || "N/A"}
            </p>
            <p className="border-r border-gray-400 p-1 font-semibold w-[20%] bg-gray-50">
              Weight
            </p>
            <p className="p-1 w-[30%]">{formData.weight || "N/A"}</p>
          </div>

          <div className="flex flex-row border-t border-gray-400 text-xs">
            <p className="border-r border-gray-400 p-1 font-semibold w-[20%] bg-gray-50">
              UUT Sr. No.
            </p>
            <p className="p-1 w-[80%]">{formData.uutSerialNo || "N/A"}</p>
          </div>

          <div className="flex flex-row border-t border-gray-400 text-xs">
            <p className="border-r border-gray-400 p-1 font-semibold w-[25%] bg-gray-50">
              Whether Repeat Test (Y/N)
            </p>
            <p className="p-1 w-[25%] border-r border-gray-400 uppercase">
              {formData.repeatTest || "N/A"}
            </p>
            <p className="border-r border-gray-400 p-1 font-semibold w-[25%] bg-gray-50">
              If Already Provided, Ref. No.
            </p>
            <p className="p-1 w-[25%]">{formData.previousRefNo || "N/A"}</p>
          </div>

          {/* Level of Test */}
          <h2 className="border-t border-gray-400 bg-gray-300 p-1 font-semibold text-xs">
            Level of Test
          </h2>

          <div className="flex flex-row border-t border-gray-400 flex-wrap text-xs">
            {testLevelKeys.map((key) => (
              <div
                key={key}
                className="flex items-center space-x-1 border-r px-2 py-1 border-gray-400"
              >
                <span className="font-medium text-xs">{key}</span>
                <span
                  className={
                    formData.testLevel === key
                      ? "text-green-600 font-bold"
                      : "text-red-500"
                  }
                >
                  {formData.testLevel === key ? "✓" : "✗"}
                </span>
              </div>
            ))}
            <div className="flex items-center px-2 py-1">
              <span className="font-medium mr-1 text-xs">Any Other:</span>
              <span className="font-semibold text-xs">
                {formData.testLevel === "Other"
                  ? formData.otherTestLevel
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Test Name and Specification */}
          <h2 className="border-t border-gray-400 bg-gray-300 p-1 font-semibold text-xs">
            Test Name and Specification
          </h2>

          <p className="px-2 py-1 border-t border-gray-400 text-xs italic">
            Test Name (i.e.): High Temperature / Thermal Shock / Burn In / Low
            Temperature / Thermal Cycling / Damp Heat / High Altitude /
            Random-Vibration / Sinusoidal-Vibration / Shock / Tropical Exposure
          </p>

          <div className="flex flex-row border-t border-gray-400 text-xs">
            <p className="p-1 border-r font-semibold w-[20%] border-gray-400 bg-gray-50">
              Test Name
            </p>
            <p className="p-1 w-[30%] border-r border-gray-400">
              {formData.testName || "N/A"}
            </p>
            <p className="p-1 font-semibold border-r border-gray-400 w-[20%] bg-gray-50">
              Test Standard
            </p>
            <p className="p-1 w-[30%]">{formData.testStandard || "N/A"}</p>
          </div>

          <div className="flex flex-row border-t border-gray-400 text-xs">
            <p className="font-semibold p-1 border-r border-gray-400 w-[20%] bg-gray-50">
              Test Specification
            </p>
            <p className="p-1 w-[80%] text-start whitespace-pre-wrap text-xs">
              {formData.testSpecification || "N/A"}
            </p>
          </div>

          <div className="flex flex-row border-t border-gray-400 text-xs">
            <p className="font-semibold p-1  border-r border-gray-400 w-[20%] bg-gray-50">
              Special Requirement
              <br />
              <i className="text-xs">(if any)</i>
            </p>
            <p className="p-1 w-[80%] text-start text-xs">
              {formData.specialRequirement || "N/A"}
            </p>
          </div>

          {/* Signatures Section */}
          <div className="flex flex-row justify-between border-t border-gray-400 text-xs">
            <div className="flex flex-col w-[50%] border-r border-gray-400 p-2">
              <p className="font-semibold mb-2 text-center  text-xs">
                (Customer Representative)
              </p>
              <div className="flex flex-row mb-1">
                <p className="font-semibold mr-2 w-12 text-xs">Name:</p>
                <p className="flex-1 text-xs">{formData.customerRepName || "N/A"}</p>
              </div>
              <div className="flex flex-row">
                <p className="font-semibold mr-2 w-12 text-xs">Date:</p>
                <p className="flex-1 text-xs">
                  {formatDate(formData.customerRepDate)}
                </p>
              </div>
            </div>

            <div className="flex flex-col w-[50%] p-2">
              <p className="font-semibold mb-2 text-center  text-xs">
                R&QA / QA Agency / Project QC / Other
              </p>
              <div className="flex flex-row mb-1">
                <p className="font-semibold mr-2 w-12 text-xs">Name:</p>
                <p className="flex-1 text-xs">{formData.qaRepName || "N/A"}</p>
              </div>
              <div className="flex flex-row">
                <p className="font-semibold mr-2 w-12 text-xs">Date:</p>
                <p className="flex-1 text-xs">{formatDate(formData.qaRepDate)}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-400">
            {/* Technical Manager Section */}
            <div className="w-full p-2 space-y-2 text-xs">
              <h2 className="font-semibold text-center underline">
                (To Be filled by Technical Manager)
              </h2>

              {/* Yes / No Rows */}
              <div className="">
                <div className="flex items-center gap-3">
                  <p className="w-40 font-medium text-xs">Laboratory Capability:</p>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> Yes
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> No
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <p className="w-40 font-medium text-xs">Resource Availability:</p>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> Yes
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> No
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <p className="w-40 font-medium text-xs">Subcontracting Required:</p>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> Yes
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> No
                  </label>
                </div>
              </div>

              {/* Test Request and Request Control No. - Row wise */}
              <div className="flex gap-2 mt-1">
                <div className=" items-center gap-2 flex-1">
                  <p className="w-40 font-medium text-xs">Test Request:</p>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> Accepted
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> Rejected
                  </label>
                </div>
                <div className=" items-center gap-2 flex-1">
                  <p className="font-medium w-40 text-xs">Request Control No.:</p>
                  <div className="flex-1 h-4" />
                </div>
              </div>

              {/* Equipment & Allocation Details */}
              <div className="flex gap-4 mt-1">
                {/* Left side - Equipment Details */}
                <div className="flex-1">
                  <div className="flex gap-2 mb-1">
                    <p className="w-36 font-medium text-xs">Test Equipment Name:</p>
                    <div className="flex-1 h-4" />
                  </div>
                  <div className="flex gap-2">
                    <p className="w-36 font-medium text-xs">Equipment ID:</p>
                    <div className="flex-1 h-4" />
                  </div>
                </div>

                {/* Right side - UUT Details */}
                <div className="flex-1">
                  <div className="flex gap-2 mb-1">
                    <p className="w-36 font-medium text-xs">UUT Unique Code:</p>
                    <div className="flex-1 h-4" />
                  </div>
                  <div className="flex gap-2 mb-1">
                    <p className="w-36 font-medium text-xs">Lot Size:</p>
                    <div className="flex-1 h-4" />
                  </div>
                  <div className="flex gap-2">
                    <p className="w-36 font-medium text-xs">Date Allocated:</p>
                    <div className="flex-1 h-4" />
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between pt-2">
                <p className="font-medium text-xs">
                  Signature of Technical Manager
                </p>

                <p className="font-medium text-xs">Approved by Quality Manager</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs font-semibold mt-1">END OF REPORT</p>
      </div>
    </div>
  );
};

export default TestRequestPreview;
