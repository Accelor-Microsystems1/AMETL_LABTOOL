import React from "react";
import logo from "../../assets/image.png";

const TestRequestPreview = ({ formData }) => {
  const testLevelKeys = [
    "Developmental",
    "ESS",
    "Acceptance",
    "Qualification",
    "Cemilac",
  ];

  return (
    <div className="bg-white rounded-lg overflow-auto max-h-[70vh]">
      <div className="p-6 space-y-4 border border-blue-900">
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-4 border-t border-blue-400">
          <img src={logo} alt="AMETL Logo" className="w-24 h-20 ml-4" />
          <div className="ml-12">
            <h1 className="text-2xl font-bold text-center w-full text-gray-800">
              Accelor Microsystems
            </h1>
            <h1 className="text-2xl font-bold  w-full text-gray-800">
              Environment Test Laboratory
            </h1>
          </div>

          <div className=" text-xs">
            <div className="flex flex-row border-b ">
              <span className="font-semibold text-60 p-1 w-24  ">
                Document No.
              </span>
              <span className="p-1 text-blue-400 w-28">F/MK/01</span>
            </div>
            <div className="flex flex-row border-t border-blue-400 bg-blue-50">
              <span className="font-semibold p-1 w-24   ">
                Revision No.
              </span>
              <span className="p-1 w-28">02</span>
            </div>
            <div className="flex flex-row ">
              <span className="font-semibold p-1 w-24  ">
                Date:
              </span>
              <span className="p-1 w-28">
                24-04-2025
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-center border-b border-blue-400 bg-blue-50 p-2">
          Test Request Form
        </h2>

        <div className="border border-black text-sm">
          {/* Date Section */}
          <div className="flex flex-row ">
            <div className="flex flex-col border-black border-r w-[50%] justify-center items-center p-2">
              <h1 className="font-semibold">Test Request Form</h1>
              <h1>
                <i>(To Be filled by customer)</i>
              </h1>
            </div>
            <div className="flex flex-row items-center">
              <h1 className="font-semibold p-3">Date:</h1>
              <p className="p-3">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Customer Information */}
          <h2 className="border-t border-black bg-gray-300 p-2 font-semibold">
            Customer Information
          </h2>

          <div className="flex flex-col">
            <div className="flex flex-row border-t border-black">
              <p className="border-r border-black font-semibold p-2 w-[30%] bg-gray-50">
                Company Name
              </p>
              <p className="p-2  w-[70%]">{formData.companyName || "N/A"}</p>
            </div>

            <div className="flex flex-row border-t border-black">
              <p className="border-r border-black font-semibold p-2 w-[30%] bg-gray-50">
                Company Address
              </p>
              <p className="p-2  w-[70%]">{formData.companyAddress || "N/A"}</p>
            </div>

            <div className="flex flex-row border-t border-black">
              <p className="border-r border-black font-semibold p-2 w-[20%] bg-gray-50">
                Contact Person
              </p>
              <p className="p-2  w-[13%] border-r border-black">
                {formData.contactPerson || "N/A"}
              </p>
              <p className="border-r border-black font-semibold p-2 w-[17%] bg-gray-50">
                Contact Number
              </p>
              <p className="p-2  w-[15%] border-r border-black">
                {formData.contactNumber || "N/A"}
              </p>
              <p className="border-r border-black font-semibold p-2 w-[15%] bg-gray-50">
                Email Address
              </p>
              <p className="p-2  w-[20%]">{formData.customerEmail || "N/A"}</p>
            </div>
          </div>

          {/* UUT Details */}
          <h2 className="border-t border-black bg-gray-300 p-2 font-semibold">
            Details of Unit Under Test (UUT)
          </h2>

          <div className="flex flex-row border-t border-black">
            <p className="border-r border-black p-2 font-semibold w-[20%] bg-gray-50">
              UUT Name
            </p>
            <p className="p-2 w-[30%] border-r border-black">
              {formData.unitName || "N/A"}
            </p>
            <p className="border-r border-black p-2 font-semibold w-[20%] bg-gray-50">
              No. of UUT for Test
            </p>
            <p className="p-2 w-[30%] ">{formData.noOfUUT || "N/A"}</p>
          </div>

          <div className="flex flex-row border-t border-black">
            <p className="border-r border-black p-2 font-semibold w-[20%] bg-gray-50">
              Dimension
            </p>
            <p className="p-2 w-[30%] border-r border-black">
              {formData.dimension || "N/A"}
            </p>
            <p className="border-r border-black p-2 font-semibold w-[20%] bg-gray-50">
              Weight
            </p>
            <p className="p-2 w-[30%] ">{formData.weight || "N/A"}</p>
          </div>

          <div className="flex flex-row border-t border-black">
            <p className="border-r border-black p-2 font-semibold w-[20%] bg-gray-50">
              UUT Sr. No.
            </p>
            <p className="p-2 w-[80%] ">{formData.uutSerialNo || "N/A"}</p>
          </div>

          <div className="flex flex-row border-t border-black">
            <p className="border-r border-black p-2 font-semibold w-[25%] bg-gray-50">
              Whether Repeat Test (Y/N)
            </p>
            <p className="p-2 w-[25%] border-r border-black uppercase">
              {formData.repeatTest || "N/A"}
            </p>
            <p className="border-r border-black p-2 font-semibold w-[25%] bg-gray-50">
              If Already Provided, Ref. No.
            </p>
            <p className="p-2 w-[25%] ">{formData.previousRefNo || "N/A"}</p>
          </div>

          {/* Level of Test */}
          <h2 className="border-t border-black bg-gray-300 p-2 font-semibold">
            Level of Test
          </h2>

          <div className="flex flex-row border-t border-black flex-wrap">
            {testLevelKeys.map((key) => (
              <div
                key={key}
                className="flex items-center space-x-2 border-r px-3 py-2 border-black"
              >
                <span className="font-medium">{key}</span>
                <span
                  className={
                    formData.testLevel === key
                      ? "text-green-600 font-bold text-lg"
                      : "text-red-500"
                  }
                >
                  {formData.testLevel === key ? "✓" : "✗"}
                </span>
              </div>
            ))}
            <div className="flex items-center px-3 py-2">
              <span className="font-medium mr-2">Any Other:</span>
              <span className="font-semibold">
                {formData.testLevel === "Other"
                  ? formData.otherTestLevel
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Test Name and Specification */}
          <h2 className="border-t border-black bg-gray-300 p-2 font-semibold">
            Test Name and Specification
          </h2>

          <p className="px-3 py-2 border-t border-black text-xs italic">
            Test Name (i.e.): High Temperature / Thermal Shock / Burn In / Low
            Temperature / Thermal Cycling / Damp Heat / High Altitude /
            Random-Vibration / Sinusoidal-Vibration / Shock / Tropical Exposure
          </p>

          <div className="flex flex-row border-t border-black">
            <p className="p-2 border-r font-semibold w-[20%] border-black bg-gray-50">
              Test Name
            </p>
            <p className="p-2 w-[30%]  border-r border-black">
              {formData.testName || "N/A"}
            </p>
            <p className="p-2 font-semibold border-r border-black w-[20%] bg-gray-50">
              Test Standard
            </p>
            <p className="p-2 w-[30%] ">{formData.testStandard || "N/A"}</p>
          </div>

          <div className="flex flex-row border-t border-black">
            <p className="font-semibold p-2 border-r border-black w-[20%] bg-gray-50">
              Test Specification
            </p>
            <p className="p-2 w-[80%] text-start whitespace-pre-wrap">
              {formData.testSpecification || "N/A"}
            </p>
          </div>

          <div className="flex flex-row border-t border-black">
            <p className="font-semibold p-2 border-r border-black w-[20%] bg-gray-50">
              Special Requirement
              <br />
              <i className="text-xs">(if any)</i>
            </p>
            <p className="p-2 w-[80%] text-start">
              {formData.specialRequirement || "N/A"}
            </p>
          </div>

          {/* Signatures Section */}
          <div className="flex flex-row justify-between border-t border-black">
            <div className="flex flex-col w-[50%] border-r border-black p-4">
              <p className="font-semibold mb-4 text-center underline">
                (Customer Representative)
              </p>
              <div className="flex flex-row mb-2">
                <p className="font-semibold mr-2 w-16">Name:</p>
                <p className="border-b border-black flex-1">
                  {formData.customerRepName || "N/A"}
                </p>
              </div>
              <div className="flex flex-row">
                <p className="font-semibold mr-2 w-16">Date:</p>
                <p className="border-b border-black flex-1">
                  {formData.customerRepDate || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex flex-col w-[50%] p-4">
              <p className="font-semibold mb-4 text-center underline">
                R&QA / QA Agency / Project QC / Other
              </p>
              <div className="flex flex-row mb-2">
                <p className="font-semibold mr-2 w-16">Name:</p>
                <p className="border-b border-black flex-1">
                  {formData.qaRepName || "N/A"}
                </p>
              </div>
              <div className="flex flex-row">
                <p className="font-semibold mr-2 w-16">Date:</p>
                <p className="border-b border-black flex-1">
                  {formData.qaRepDate || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRequestPreview;
