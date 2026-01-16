import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaVial, FaCalendarAlt, FaProjectDiagram } from "react-icons/fa";
import Request_Generation from "./Request_Generation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const View_Request_No = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/test-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (err) {
      alert("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.controlNo.includes(searchTerm) ||
    report.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaVial className="text-amber-600" /> Request Control No.
          </h1>
          <p className="text-gray-600 mt-1">Manage all request control numbers</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-3 transition"
        >
          <FaPlus size={20} />
          Add New
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Control No., Project, Test Name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 outline-none text-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-xl text-gray-600">No Control No. yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 px-8 py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700"
            >
              Generate New Control No.
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200">
                <tr>
                  <th className="px-8 py-5 text-left font-bold text-gray-800">Control No.</th>
                  <th className="px-8 py-5 text-left font-bold text-gray-800">Project</th>
                  <th className="px-8 py-5 text-left font-bold text-gray-800">Test Name</th>
                  <th className="px-8 py-5 text-left font-bold text-gray-800">Test Date</th>
                  <th className="px-8 py-5 text-center font-bold text-gray-800">Units</th>
                  <th className="px-8 py-5 text-center font-bold text-gray-800">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-amber-50 transition cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="font-mono text-xl font-bold text-amber-700">
                        {report.controlNo}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <FaProjectDiagram className="text-amber-600" />
                        <span className="font-semibold">{report.projectName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-medium">{report.testName}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-600" />
                        <span>{new Date(report.testStartDate).toLocaleDateString("en-IN")}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-bold">
                        {report.uuts?.length || 0}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-block px-5 py-2 rounded-full font-bold text-sm ${
                        report.status === "COMPLETED" 
                          ? "bg-green-100 text-green-800" 
                          : report.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {report.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showCreateModal && (
        <Request_Generation
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchReports();
          }}
        />
      )}
    </div>
  );
};

export default View_Request_No;