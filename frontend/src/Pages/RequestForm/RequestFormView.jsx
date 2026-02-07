// pages/HOD/HodDashboard.jsx

import React, { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RequestFormView = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all requests
  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests by status
  useEffect(() => {
    if (activeTab === "ALL") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((req) => req.status === activeTab));
    }
  }, [activeTab, requests]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/test-requests`);
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Approve
  const handleApprove = async (id) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/test-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          approvedBy: "HOD Name" // Replace with logged-in user
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: "APPROVED" } : req
          )
        );
        alert("Request approved successfully!");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/test-requests/${selectedRequest.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "REJECTED",
            rejectionReason: rejectionReason
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequest.id
              ? { ...req, status: "REJECTED" }
              : req
          )
        );
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedRequest(null);
        alert("Request rejected successfully!");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request");
    } finally {
      setIsProcessing(false);
    }
  };

  // Open reject modal
  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  // Status badge color
  const getStatusBadge = (status) => {
    const colors = {
      PENDING: "bg-yellow-500",
      APPROVED: "bg-green-500",
      REJECTED: "bg-red-500",
      IN_PROGRESS: "bg-blue-500",
      COMPLETED: "bg-purple-500",
      CANCELLED: "bg-gray-500"
    };
    return colors[status] || "bg-gray-500";
  };

  // Count by status
  const getStatusCount = (status) => {
    if (status === "ALL") return requests.length;
    return requests.filter((req) => req.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-200">
            🏢   Test Requests
          </h1>
          <p className="text-gray-400 mt-2">
            Review and approve/reject incoming test requests
          </p>
        </div>

        {/* Stats Cards */}
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {tab} ({getStatusCount(tab)})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">
              <span className="animate-spin text-2xl">⏳</span>
              <p className="mt-2">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p>No {activeTab.toLowerCase()} requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-200">
                      Ref No.
                    </th>
                    <th className="px-4 py-3 text-left text-gray-200">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-gray-200">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-gray-200">
                      Test
                    </th>
                    <th className="px-4 py-3 text-left text-gray-200">
                      Serial No.
                    </th>
                    <th className="px-4 py-3 text-center text-gray-200">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-center text-gray-200">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-gray-200">
                      Date
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
                      <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                        {request.referenceNumber?.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-200 font-medium">
                            {request.companyName}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {request.contactPerson}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {request.uutName}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {request.testName}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">
                        {request.uutSerialNo}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          {request.calculatedQuantity || request.noOfUUT}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`${getStatusBadge(request.status)} text-white px-2 py-1 rounded text-xs`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400 text-xs">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {request.status === "PENDING" ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={isProcessing}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(request)}
                              disabled={isProcessing}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            {request.status === "APPROVED" ? "✓ Done" : "✗ Done"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-200 mb-4">
              ❌ Reject Request
            </h2>

            <div className="mb-4 p-3 bg-gray-700 rounded">
              <p className="text-gray-300 text-sm">
                <span className="text-gray-400">Customer:</span>{" "}
                {selectedRequest?.companyName}
              </p>
              <p className="text-gray-300 text-sm">
                <span className="text-gray-400">Project:</span>{" "}
                {selectedRequest?.uutName}
              </p>
              <p className="text-gray-300 text-sm">
                <span className="text-gray-400">Test:</span>{" "}
                {selectedRequest?.testName}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-200 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="input w-full h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedRequest(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
              >
                {isProcessing ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestFormView;