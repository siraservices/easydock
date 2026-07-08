"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import { VESSEL_TYPES } from "@/lib/constants";

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  vessel_name: string | null;
  vessel_length_ft: number | null;
  vessel_type: string | null;
}

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [vesselLength, setVesselLength] = useState("");
  const [vesselType, setVesselType] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setVesselName(data.vessel_name || "");
        setVesselLength(data.vessel_length_ft ? String(data.vessel_length_ft) : "");
        setVesselType(data.vessel_type || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        phone,
        vessel_name: vesselName,
        vessel_length_ft: vesselLength ? Number(vesselLength) : null,
        vessel_type: vesselType,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save profile.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["boat_owner", "marina_owner"]}>
        <div className="max-w-lg mx-auto px-6 py-12 text-center text-gray-500">Loading...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["boat_owner", "marina_owner"]}>
      <div className="max-w-lg mx-auto px-6 py-10">
        <button
          onClick={() => router.back()}
          className="text-teal-600 hover:underline text-sm mb-6 inline-block"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold text-navy-800 mb-6">Account Settings</h1>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile section */}
          <section className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h2 className="text-base font-semibold text-navy-800">Profile</h2>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <p className="text-sm text-gray-700">{profile?.email}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </section>

          {/* Vessel section — boat owners only */}
          {profile?.role === "boat_owner" && (
            <section className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-navy-800">My Vessel</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Saved vessel info pre-fills the booking form automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vessel Name</label>
                <input
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="e.g. Sea Breeze"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Length (ft)</label>
                  <input
                    type="number"
                    value={vesselLength}
                    onChange={(e) => setVesselLength(e.target.value)}
                    placeholder="e.g. 35"
                    min="1"
                    max="200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={vesselType}
                    onChange={(e) => setVesselType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select type</option>
                    {VESSEL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
