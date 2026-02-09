// pages/Customer/CustomerDashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  // TODO: Get customer email from auth/login
  // For now, using a sample email or you can add an input
  useEffect(() => {
    // Replace with actual logged-in user email
    const email = localStorage.getItem("customerEmail") || "";
    setCustomerEmail(email);
    if (email) {
      fetchMyRequests(email);
    }
  }, []);

  const fetchMyRequests = async (email) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/test-requests/customer/${encodeURIComponent(email)}`
      );
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

  // Status badge color
  const getStatusBadge = (status) => {
    const colors = {
      PENDING: "bg-yellow-500 text-yellow-900",
      APPROVED: "bg-green-500 text-green-900",
      REJECTED: "bg-red-500 text-white",
      IN_PROGRESS: "bg-blue-500 text-white",
      COMPLETED: "bg-purple-500 text-white",
      CANCELLED: "bg-gray-500 text-white"
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
      CANCELLED: "🚫"
    };
    return icons[status] || "❓";
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-200">
                📋 My Test Requests
              </h1>
              <p className="text-gray-400 mt-1">
                Track your submitted test requests
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

        {/* Email Input (if not logged in) */}
        {!customerEmail && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <label className="block text-gray-200 mb-2">
              Enter your email to view requests:
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="input flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const email = e.target.value;
                    setCustomerEmail(email);
                    localStorage.setItem("customerEmail", email);
                    fetchMyRequests(email);
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="email"]');
                  const email = input.value;
                  setCustomerEmail(email);
                  localStorage.setItem("customerEmail", email);
                  fetchMyRequests(email);
                }}
                className="btn-primary"
              >
                View Requests
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {customerEmail && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-400">
                {requests.length}
              </p>
              <p className="text-gray-400 text-sm">Total Requests</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {requests.filter((r) => r.status === "PENDING").length}
              </p>
              <p className="text-gray-400 text-sm">Pending</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-400">
                {requests.filter((r) => r.status === "APPROVED").length}
              </p>
              <p className="text-gray-400 text-sm">Approved</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-400">
                {requests.filter((r) => r.status === "REJECTED").length}
              </p>
              <p className="text-gray-400 text-sm">Rejected</p>
            </div>
          </div>
        )}

        {/* Requests Table */}
        {customerEmail && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">
                <span className="animate-spin text-2xl">⏳</span>
                <p className="mt-2">Loading your requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-4xl mb-4">📭</p>
                <p className="text-gray-400 mb-4">
                  You haven't submitted any test requests yet.
                </p>
                <button
                  onClick={() => navigate("/request-form")}
                  className="btn-primary"
                >
                  Create Your First Request
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-200">
                        Reference No.
                      </th>
                      <th className="px-4 py-3 text-left text-gray-200">
                        Project (UUT)
                      </th>
                      <th className="px-4 py-3 text-left text-gray-200">
                        Test Name
                      </th>
                      <th className="px-4 py-3 text-left text-gray-200">
                        Serial No.
                      </th>
                      <th className="px-4 py-3 text-center text-gray-200">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-center text-gray-200">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-gray-200">
                        Submitted On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="text-gray-300 font-mono text-xs">
                            {request.referenceNumber?.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-200 font-medium">
                          {request.uutName}
                        </td>
                        <td className="px-4 py-4 text-gray-300">
                          {request.testName}
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-xs">
                          {request.uutSerialNo}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            {request.calculatedQuantity || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`${getStatusBadge(request.status)} px-3 py-1 rounded-full text-xs font-medium`}
                          >
                            {getStatusIcon(request.status)} {request.status}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        {customerEmail && requests.length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Status Legend:</p>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1 text-xs text-gray-300">
                <span className="bg-yellow-500 w-3 h-3 rounded-full"></span>
                PENDING - Awaiting approval
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-300">
                <span className="bg-green-500 w-3 h-3 rounded-full"></span>
                APPROVED - Ready to send components
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
  );
};

export default CustomerDashboard;