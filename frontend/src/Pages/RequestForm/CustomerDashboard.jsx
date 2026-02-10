// pages/Customer/CustomerDashboard.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/authentication/authContext";
import TestRequestPreview from "../../components/customizedComponents/TestRequestPreview";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const { user, token } = useAuth();

  // Fetch requests for logged-in user
  const fetchMyRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (user && token) {
        const response = await fetch(
          `${API_BASE_URL}/test-requests/my-requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setRequests(result.data || []);
        } else {
          setError(result.error);
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchMyRequests();
    }
  }, [user, token]);

  // Function to count requests by status
  const getStatusCount = (status) => {
    if (status === "ALL") {
      return requests.length;
    }
    return requests.filter((r) => (r.status || "PENDING") === status).length;
  };

  // Filter requests based on active tab
  const filteredRequests = useMemo(() => {
    if (activeTab === "ALL") {
      return requests;
    }
    return requests.filter((r) => (r.status || "PENDING") === activeTab);
  }, [requests, activeTab]);

  // Handle preview
  const handlePreview = (request) => {
    setSelectedRequest(request);
    setShowPreview(true);
  };

  // Close preview
  const closePreview = () => {
    setSelectedRequest(null);
    setShowPreview(false);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/test-requests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();

      if (json.success) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        alert("Request deleted successfully");
      } else {
        alert(json.error || "Failed to delete request");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete request");
    }
  };

  // Status badge color
  const getStatusBadge = (status) => {
    const colors = {
      PENDING: "bg-yellow-500 text-yellow-900",
      APPROVED: "bg-green-500 text-green-900",
      REJECTED: "bg-red-500 text-white",
      IN_PROGRESS: "bg-blue-500 text-white",
      COMPLETED: "bg-purple-500 text-white",
      CANCELLED: "bg-gray-500 text-white",
    };
    return colors[status] || "bg-gray-500 text-white";
  };

  // Status icon
  const getStatusIcon = (status) => {
    const icons = {
      PENDING: "⏳",
      APPROVED: "✅",
      REJECTED: "❌",
      IN_PROGRESS: "🔄",
      COMPLETED: "✓",
      CANCELLED: "🚫",
    };
    return icons[status] || "❓";
  };

  // If not authenticated
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-200 mb-4 text-lg">
            Please log in to view your test requests
          </p>
          <button onClick={() => navigate("/login")} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Dashboard Content - Hidden when printing */}
      <div className="min-h-screen bg-gray-900 p-6 print:hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-200">
                  📋 My Test Requests
                </h1>
                <p className="text-gray-400 mt-1">
                  Welcome, {user.name || user.email}
                </p>
              </div>
              <button
                onClick={() => navigate("/request_form")}
                className="btn-primary flex items-center gap-2"
              >
                ➕ Create New Request
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6">
              <p className="text-red-200">❌ Error: {error}</p>
            </div>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">
                {getStatusCount("PENDING")}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-500">
                {getStatusCount("APPROVED")}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-500">
                {getStatusCount("REJECTED")}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-blue-500">
                {getStatusCount("ALL")}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? tab === "ALL"
                      ? "bg-blue-600 text-white shadow-lg"
                      : tab === "PENDING"
                      ? "bg-yellow-600 text-white shadow-lg"
                      : tab === "APPROVED"
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-red-600 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {tab} ({getStatusCount(tab)})
              </button>
            ))}
          </div>

          {/* Requests Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin text-4xl mb-2">⏳</div>
                <p>Loading your requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center">
                {activeTab === "ALL" && requests.length === 0 ? (
                  <>
                    <p className="text-4xl mb-4">📭</p>
                    <p className="text-gray-400 mb-4">
                      You haven't submitted any test requests yet.
                    </p>
                    <button
                      onClick={() => navigate("/request_form")}
                      className="btn-primary"
                    >
                      Create Your First Request
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-3xl mb-4">🔍</p>
                    <p className="text-gray-400">
                      No {activeTab.toLowerCase()} requests found.
                    </p>
                    {activeTab !== "ALL" && (
                      <button
                        onClick={() => setActiveTab("ALL")}
                        className="text-blue-500 hover:text-blue-400 mt-2"
                      >
                        View all requests
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div>
                {/* Active Filter Indicator */}
                {activeTab !== "ALL" && (
                  <div className="bg-gray-700 px-4 py-2 text-sm text-gray-300">
                    Showing:{" "}
                    <span className="font-semibold text-white">
                      {activeTab} requests ({filteredRequests.length})
                    </span>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-200">
                          Serial No.
                        </th>
                        <th className="px-4 py-3 text-left text-gray-200">
                          Project (UUT)
                        </th>
                        <th className="px-4 py-3 text-left text-gray-200">
                          Test Name
                        </th>
                        <th className="px-4 py-3 text-center text-gray-200">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-gray-200">
                          Submitted On
                        </th>
                        <th className="px-4 py-3 text-center text-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="hover:bg-gray-750 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <span className="text-gray-300 font-mono text-xs">
                              #{request.id}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-200 font-medium">
                            {request.uutName}
                          </td>
                          <td className="px-4 py-4 text-gray-300">
                            {request.testName}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`${getStatusBadge(
                                request.status || "PENDING"
                              )} px-3 py-1 rounded-full text-xs font-medium`}
                            >
                              {getStatusIcon(request.status || "PENDING")}{" "}
                              {request.status || "PENDING"}
                            </span>
                            {request.status === "REJECTED" &&
                              request.rejectionReason && (
                                <p className="text-red-400 text-xs mt-1">
                                  Reason: {request.rejectionReason}
                                </p>
                              )}
                          </td>
                          <td className="px-4 py-4 text-center text-gray-400 text-xs">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* View Button */}
                              <button
                                onClick={() => handlePreview(request)}
                                className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1 transition-colors"
                                title="View full details"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                View
                              </button>

                              {/* Delete Button - Only for PENDING */}
                              {(!request.status ||
                                request.status === "PENDING") && (
                                <>
                                  <span className="text-gray-600">|</span>
                                  <button
                                    onClick={() => handleDelete(request.id)}
                                    className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 transition-colors"
                                    title="Delete request"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {requests.length > 0 && (
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Status Legend:</p>
              <div className="flex flex-wrap gap-4">
                <span className="flex items-center gap-1 text-xs text-gray-300">
                  <span className="bg-yellow-500 w-3 h-3 rounded-full"></span>
                  PENDING - Awaiting approval
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-300">
                  <span className="bg-green-500 w-3 h-3 rounded-full"></span>
                  APPROVED - Ready to proceed
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-300">
                  <span className="bg-red-500 w-3 h-3 rounded-full"></span>
                  REJECTED - Request denied
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal - Only this should print */}
      {showPreview && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto print:static print:overflow-visible" id="print-modal">
          {/* Backdrop - Hidden when printing */}
          <div
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity print:hidden"
            onClick={closePreview}
          />

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4 print:p-0 print:block">
            <div className="relative bg-gray-800 rounded-lg max-w-4xl w-full 
     print:bg-white print:min-h-0 print:h-auto">

              {/* Modal Header - Hidden when printing */}
              <div className="sticky top-0 bg-gray-700 px-6 py-4 border-b border-gray-600 flex justify-between items-center z-10 print:hidden">
                <h2 className="text-xl font-bold text-white">
                  Test Request Details - #{selectedRequest.id}
                </h2>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Body - This is what we want to print */}
              <div 
                className="overflow-y-auto max-h-[calc(90vh-130px)] print:overflow-visible print:max-h-none print:mt-10"
              
              >
                <TestRequestPreview formData={selectedRequest} />
              </div>

              {/* Modal Footer - Hidden when printing */}
              <div className="sticky bottom-0 bg-gray-700 px-6 py-4 border-t border-gray-600 flex justify-end gap-3 print:hidden">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </button>
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Styles */}
      <style>{`
        @media print {
          /* Hide EVERYTHING by default */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
          }
          
          /* Hide all elements */
          body > * {
            display: none !important;
          }
          
          /* Hide header, nav, sidebar - add your specific selectors */
          header,
          nav,
          footer,
          aside,
          .navbar,
          .sidebar,
          .header,
          .nav,
          .print\\:hidden {
            display: none !important;
          }
          
          /* Show only the root div that contains our modal */
          #root {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          /* Hide the main dashboard content */
          #root > div:first-child {
            display: none !important;
          }
          
          /* Show the print modal */
          #print-modal {
            display: block !important;
            position: static !important;
            overflow: visible !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            top: 0 !important;
            left: 0 !important;
          }
          
          /* Hide modal backdrop */
          #print-modal > div:first-child {
            display: none !important;
          }
          
          /* Hide modal header and footer background during print */
          #print-modal [id*="header"],
          #print-modal > div:nth-child(2) > div > div:first-child {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Hide footer completely with zero dimensions */
          #print-modal > div:nth-child(2) > div > div:last-child {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            visibility: hidden !important;
          }
          
          /* Hide modal backdrop */
          #print-modal > div:nth-child(1) {
            display: none !important;
          }
          
          /* Remove positioning and space from sticky elements */
          .sticky {
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            display: none !important;
            height: 0 !important;
          }
          
          /* Style the modal container for print */
          #print-modal > div:nth-child(2) {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
          }
          
          /* Style the modal inner container */
          #print-modal > div:nth-child(2) > div {
            max-width: 210mm !important;
            max-height: 297mm !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
            display: block !important;
            overflow: hidden !important;
          }
          
          /* Ensure printable content is visible and full width */
          #printable-content {
            overflow: hidden !important;
            max-height: 297mm !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          #printable-content > div {
            max-height: 297mm !important;
            overflow: hidden !important;
            border-radius: 0 !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
          }
          
          /* Ensure images are visible */
          img {
            max-width: 100% !important;
            height: auto !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Ensure colors print properly before page settings */
          body, body * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Page settings */
          @page {
            size: A4;
            margin: 5mm;
          }
          
          @media print {
  html, body {
    width: 210mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }

  #root,
  #print-modal {
    width: 210mm !important;
    height: auto !important;   /* 🔥 important */
    background: white !important;
  }
}

          
          /* Scale content to fit one page */
          #printable-content > div > div {
            transform: scale(1);
            transform-origin: top left;
            font-size: 12px !important;
          }
          
          /* Reduce text size for printing */
          body, #printable-content {
            font-size: 11px !important;
            line-height: 1.2 !important;
          }
          
          /* Prevent page breaks to keep on one page */
          * {
            page-break-inside: avoid !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
          }
          
          /* Allow page breaks only where necessary */
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
    </>
  );
};

export default CustomerDashboard;