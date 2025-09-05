// src/components/Loader.js
import React from "react";

export default function Loader({ message = "Cargando..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-30 animate-fade-in">
      <div className="flex flex-col items-center justify-center px-24 py-12 bg-white rounded-xl shadow-2xl space-y-6 md:space-y-8">
        {" "}
        <div className="w-24 h-24 border-12 border-t-12 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}