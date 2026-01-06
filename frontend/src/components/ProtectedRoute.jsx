import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authentication/authContext";

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return null; 
  if (!user) return <Navigate to="/login" replace />;

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}