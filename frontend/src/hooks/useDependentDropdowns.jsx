import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useDependentDropdowns = () => {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApprovedRequests();
    fetchAllTests();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/test-requests/approved-requests`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch approved requests");
      }

      setApprovedRequests(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTests = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tests`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAllTests(data.data);
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
    }
  };

  const getProjectNames = () => {
    return [...new Set(
      approvedRequests
        .filter(req => req.uutName)
        .map(req => req.uutName)
    )].sort();
  };

  const getSerialsByProject = (projectName) => {
    if (!projectName) return [];
    
    return [...new Set(
      approvedRequests
        .filter(req => req.uutName === projectName && req.uutSerialNo)
        .map(req => req.uutSerialNo)
    )].sort();
  };

const getTestsByProjectAndSerial = (projectName, serialNo) => {
  if (!projectName || !serialNo) return [];

  console.log("🔍 Getting tests for:", { projectName, serialNo });
  console.log("🔍 Total approved requests:", approvedRequests.length);

  const matches = approvedRequests.filter(
    req => req.uutName === projectName && 
           req.uutSerialNo?.toLowerCase() === serialNo.toLowerCase()
  );

  console.log("🔍 Matched requests:", matches.length);
  console.log("🔍 Matched data:", matches);

  const tests = matches
    .filter(req => req.testId && req.testName)
    .map(req => ({
      testId: req.testId,
      testName: req.testName,
      testCode: req.testLevel?.charAt(0) || req.testName?.charAt(0) || "T",
      testSpecification: req.testSpecification || ""
    }));

  console.log("🔍 Extracted tests:", tests);

  return tests.filter(
    (test, index, self) => index === self.findIndex(t => t.testId === test.testId)
  );
};

  const getDataByProjectAndSerial = (projectName, serialNo) => {
    if (!projectName || !serialNo) return null;

    const matches = approvedRequests.filter(
      req => req.uutName === projectName && 
             req.uutSerialNo?.toLowerCase() === serialNo.toLowerCase()
    );

    if (matches.length === 0) return null;

    const firstRequest = matches[0];
    const tests = getTestsByProjectAndSerial(projectName, serialNo);

    return {
      projectName: firstRequest.uutName,
      serialNo: firstRequest.uutSerialNo,
      customerName: firstRequest.companyName || "",
      contactPersonName: firstRequest.contactPerson || "",
      uutQty: parseInt(firstRequest.noOfUUT) || 1,
      tests: tests,
    };
  };

  const getTestIdByName = (testName) => {
  if (!testName) return null;
  
  const test = allTests.find(
    t => t.testName?.toLowerCase().trim() === testName?.toLowerCase().trim()
  );  
  if (test && test.id) {
    return test.id;
  }  
  return null;
};

  return {
    approvedRequests,
    allTests,
    loading,
    error,
    getProjectNames,
    getSerialsByProject,
    getTestsByProjectAndSerial,
    getDataByProjectAndSerial,
    getTestIdByName,
    fetchApprovedRequests,
    fetchAllTests,
  };
};