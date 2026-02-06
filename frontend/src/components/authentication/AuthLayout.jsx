import { LightWavesBackground } from "../ui/light-waves";
import React from "react";
export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <LightWavesBackground className="fixed inset-0 -z-10" />
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
