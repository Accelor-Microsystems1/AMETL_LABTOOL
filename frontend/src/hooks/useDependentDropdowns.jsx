import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useDependentDropdowns = () => {
  const [projectNames, setProjectNames] = useState([]);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [allSerialNumbers, setAllSerialNumbers] = useState([]); // All serials before filtering
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all project names on mount
  useEffect(() => {
    fetchProjectNames();
  }, []);

  const fetchProjectNames = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/uut-records/dropdown/projects`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch projects");
      }
      setProjectNames(data.data || []);
      // Also fetch all serial numbers on initial load
      await fetchAllSerialNumbers();
    } catch (err) {
      setError(err.message);
      console.error("Error fetching project names:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all serial numbers from all projects
  const fetchAllSerialNumbers = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/uut-records`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.data) {
        const uniqSerials = [...new Set(data.data.map(r => r.serialNo))];
        setAllSerialNumbers(uniqSerials.sort());
        setSerialNumbers(uniqSerials.sort()); // Initially show all
      }
    } catch (err) {
      console.error("Error fetching all serial numbers:", err);
    }
  };

  const fetchSerialNumbersByProject = async (projectName) => {
    if (!projectName) {
      setSerialNumbers(allSerialNumbers); // Reset to all serials
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/uut-records/dropdown/serials/${encodeURIComponent(projectName)}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch serial numbers");
      }
      setSerialNumbers(data.data || []);
    } catch (err) {
      setError(err.message);
      setSerialNumbers(allSerialNumbers); // Fall back to all serials
      console.error("Error fetching serial numbers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailsBySerialNumber = async (serialNo) => {
    if (!serialNo) return null;

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/uut-records/dropdown/project-by-serial/${encodeURIComponent(serialNo)}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch details");
      }
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error("Error fetching details by serial number:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    projectNames,
    serialNumbers,
    loading,
    error,
    fetchProjectNames,
    fetchSerialNumbersByProject,
    fetchDetailsBySerialNumber,
  };
};
