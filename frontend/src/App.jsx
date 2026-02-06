import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/authentication/layout";
import AuthLayout from "./components/authentication/AuthLayout";
import Login from "./auth/Login";
import Dashboard from "./pages/Dashboard";
import UutIn from "./Pages/Unit_In_Out_Record/Unit_In_Record";
import UutRecords from "./Pages/Unit_In_Out_Record/View_Unit_Record";
import List_Of_Employees from "./Pages/Employee_Record/List_Of_Employees";
import RegisterEmployee from "./Pages/Employee_Record/Register";
import View_Request_No from "./Pages/ControlNo_Details/View_GeneratedControl_No";
import RequestForm from "./Pages/RequestForm/requestForm";

export default function App() {
  return (
    <>
      <Toaster position="bottom-center" richColors />
      <Routes>
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/units" element={<UutRecords />} />
            <Route path="/units/in" element={<UutIn />} />
            <Route path="/list_of_employees" element={<List_Of_Employees />} />
            <Route path="/register" element={<RegisterEmployee />} />
            <Route path="/request_details" element={<View_Request_No />} />
            <Route path="/request_form" element={<RequestForm />} />
          </Route
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
