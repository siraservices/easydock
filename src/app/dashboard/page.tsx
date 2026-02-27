"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EmptyState from "@/components/ui/empty-state";
import StatusBadge from "@/components/ui/status-badge";

interface MarinaWithSlipCount {
  id: string;
  name: string;
  city: string;
  state: string;
  is_active: boolean;
  photos: string[];
  slips: { count: number }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [marinas, setMarinas] = useState<MarinaWithSlipCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarinas = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("marinas")
      .select("id, name, city, state, is_active, photos, slips(count)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    setMarinas((data as unknown as MarinaWithSlipCount[]) || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchMarinas();
  }, [fetchMarinas]);

  return (
    <ProtectedRoute allowedRoles={["marina_owner"]}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-800">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage your marinas and slips
            </p>
          </div>
          {marinas.length > 0 && (
            <Link
              href="/dashboard/marinas/new"
              className="bg-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
            >
              + Add Marina
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner size="lg" message="Loading your marinas..." />
        ) : marinas.length === 0 ? (
          <EmptyState
            title="You haven't listed a marina yet"
            message="Get started by adding your first marina. You can then add individual slips and start receiving bookings."
            action={{ label: "Add Your Marina", href: "/dashboard/marinas/new" }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {marinas.map((marina) => (
              <Link
                key={marina.id}
                href={`/dashboard/marinas/${marina.id}`}
                className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow block"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-navy-800 text-lg">
                    {marina.name}
                  </h3>
                  <StatusBadge
                    status={marina.is_active ? "active" : "inactive"}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {marina.city}, {marina.state}
                </p>
                <p className="text-sm text-gray-500">
                  {marina.slips?.[0]?.count || 0} slip
                  {(marina.slips?.[0]?.count || 0) !== 1 && "s"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
