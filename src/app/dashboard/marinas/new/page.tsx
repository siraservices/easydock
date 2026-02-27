"use client";

import ProtectedRoute from "@/components/protected-route";
import MarinaForm from "@/components/marina-form";

export default function NewMarinaPage() {
  return (
    <ProtectedRoute allowedRoles={["marina_owner"]}>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-navy-800 mb-6">
          Add Your Marina
        </h1>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <MarinaForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
