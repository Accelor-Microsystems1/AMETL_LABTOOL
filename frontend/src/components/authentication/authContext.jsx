import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function clearStoredToken() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
}

function storeToken(token, rememberMe) {
  if (rememberMe) localStorage.setItem("token", token);
  else sessionStorage.setItem("token", token);
}

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  const json = atob(padded);
  return JSON.parse(json);
}

function isExpired(payload) {
  if (!payload?.exp) return false; 
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSec;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      
  const [token, setToken] = useState(null);   
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const t = getStoredToken();
    if (!t) {
      setLoading(false);
      return;
    }

    try {
      const payload = decodeJwtPayload(t);

      if (isExpired(payload)) {
        clearStoredToken();
        setUser(null);
        setToken(null);
      } else {
        setUser(payload);
        setToken(t);
      }
    } catch (e) {
      console.error("Invalid token:", e);
      clearStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || "Login failed" };
      }

      if (!data?.token) {
        return { success: false, message: "Token not received from server" };
      }

      const payload = decodeJwtPayload(data.token);

      if (isExpired(payload)) {
        return { success: false, message: "Received an expired token" };
      }

      storeToken(data.token, rememberMe);
      setToken(data.token);
      setUser(payload);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error" };
    }
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(() => {
    const role = user?.role;

    return {
      user,
      token,
      loading,
      login,
      logout,

      isAuthenticated: !!user,
      role,
      isAdmin: role === "ADMIN",
      isUser: role === "USER",
      isViewer: role === "VIEWER",

      hasRole: (...roles) => !!role && roles.includes(role),
    };
  }, [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;