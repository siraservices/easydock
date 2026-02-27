"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import LoadingSpinner from "@/components/ui/loading-spinner";
import MarinaForm from "@/components/marina-form";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];

export default function EditMarinaPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [marina, setMarina] = useState<Marina | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = (await supabase
        .from("marinas")
        .select("*")
        .eq("id", id)
        .single()) as unknown as { data: Marina | null };
      setMarina(data);
      setLoading(false);
    }
    fetch();
  }, [id, supabase]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["marina_owner"]}>
        <LoadingSpinner size="lg" message="Loading marina..." />
      </ProtectedRoute>
    );
  }

  if (!marina || marina.owner_id !== user?.id) {
    return (
      <ProtectedRoute allowedRoles={["marina_owner"]}>
        <div className="max-w-5xl mx-auto px-6 py-10 text-center">
          <p className="text-gray-600">Marina not found.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["marina_owner"]}>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-navy-800 mb-6">Edit Marina</h1>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <MarinaForm initialData={marina} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
