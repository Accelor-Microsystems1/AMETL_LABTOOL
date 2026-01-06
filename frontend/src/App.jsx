import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/authentication/layout";
import Login from "./auth/Login";
import Dashboard from "./pages/Dashboard";
import UutIn from "./Pages/Unit_In_Out_Record/Unit_In_Record";
import UutRecords from "./Pages/Unit_In_Out_Record/View_Unit_Record";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/units" element={<UutRecords />} /> 
          <Route path="/units/in" element={<UutIn />} />   
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}