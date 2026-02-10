import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header className="print:hidden" />
      <main className="pt-24">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;