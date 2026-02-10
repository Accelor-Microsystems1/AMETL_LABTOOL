import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useDependentDropdowns = () => {
  const [projectNames, setProjectNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all project names from approved requests on mount
  useEffect(() => {
    fetchProjectNames();
  }, []);

  const fetchProjectNames = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
    //   console.log("🔍 Fetching approved requests for project names...");
      
      const response = await fetch(`${API_BASE_URL}/test-requests`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch requests");
      }

      // Filter approved requests and get unique UUT names
      const approvedRequests = (data.data || []).filter(req => req.status === "APPROVED" && req.uutName);
      const uniqueProjects = [...new Set(approvedRequests.map(r => r.uutName))].sort();
      
    //   console.log("✅ Projects found:", uniqueProjects);
      
      setProjectNames(uniqueProjects);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error fetching project names:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search for a serial number in approved requests of a specific test type
  const searchSerialInProject = async (projectName, serialNo) => {
    if (!projectName || !serialNo) return null;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
    //   console.log(`🔍 Searching for serial: ${serialNo} in test: ${projectName}`);
      
      const response = await fetch(`${API_BASE_URL}/test-requests`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch requests");
      }

      // Filter by UUT name, approved status, and serial number
      const matchedRequest = (data.data || []).find(
        req => req.uutName === projectName && 
               req.status === "APPROVED" && 
               req.uutSerialNo.toLowerCase() === serialNo.toLowerCase()
      );

      if (matchedRequest) {
        // console.log("✅ Serial number match found:", matchedRequest);
        return {
          projectName: matchedRequest.uutName,
          serialNo: matchedRequest.uutSerialNo,
          customerName: matchedRequest.companyName,
          customerCode: (matchedRequest.companyName || "XX").substring(0, 2).toUpperCase(),
          testTypeName: matchedRequest.testName,
          testTypeCode: matchedRequest.testLevel?.charAt(0) || "T",
          uutType: "UT",
          uutQty: parseInt(matchedRequest.noOfUUT) || 1,
          contactPersonName: matchedRequest.contactPerson,
          uutDescription: matchedRequest.uutName,
        };
      } else {
        console.log("❌ No matching serial number found");
        return null;
      }
    } catch (err) {
      console.error("Error searching for serial:", err);
      return null;
    }
  };

  return {
    projectNames,
    loading,
    error,
    fetchProjectNames,
    searchSerialInProject,
  };
};
