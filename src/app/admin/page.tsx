"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import LoadingSpinner from "@/components/ui/loading-spinner";
import StatusBadge from "@/components/ui/status-badge";

interface AdminStats {
  total: number;
  claimed: number;
  unclaimed: number;
  active: number;
  bookingsTotal: number;
  bookingsActive: number;
  totalRevenue: number;
}

interface AdminMarina {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  is_active: boolean;
  source: string;
  claimed_at: string | null;
  owner_id: string | null;
  created_at: string;
  profiles: { email: string; full_name: string | null } | null;
}

interface EditModalProps {
  marina: AdminMarina;
  onClose: () => void;
  onSaved: (updated: AdminMarina) => void;
}

function EditModal({ marina, onClose, onSaved }: EditModalProps) {
  const [form, setForm] = useState({
    name: marina.name,
    address: marina.address,
    city: marina.city,
    state: marina.state,
    zip: marina.zip ?? "",
    phone: marina.phone ?? "",
    email: marina.email ?? "",
    website: marina.website ?? "",
    description: marina.description ?? "",
    is_active: marina.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/marinas/${marina.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          zip: form.zip || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          description: form.description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onSaved({ ...marina, ...form });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-navy-800">Edit Marina</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Field
            label="Name"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <Field
            label="Address"
            value={form.address}
            onChange={(v) => setForm((f) => ({ ...f, address: v }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="City"
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="State"
                value={form.state}
                onChange={(v) => setForm((f) => ({ ...f, state: v }))}
              />
              <Field
                label="ZIP"
                value={form.zip}
                onChange={(v) => setForm((f) => ({ ...f, zip: v }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
          </div>
          <Field
            label="Website"
            value={form.website}
            onChange={(v) => setForm((f) => ({ ...f, website: v }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">Active (visible to boat owners)</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminContent />
    </Suspense>
  );
}

interface BlogLead {
  id: string;
  name: string;
  email: string;
  user_type: "yacht_owner" | "marina_owner";
  created_at: string;
}

interface CalcLead {
  id: string;
  created_at: string;
  email: string;
  phone: string | null;
  role: string | null;
  region: string | null;
  marina_name: string | null;
  total_slips: number | null;
  vacant_slips: number | null;
  avg_monthly_rate: number | null;
  annual_loss: number | null;
}

interface AdminBooking {
  id: string;
  status: string;
  check_in: string;
  check_out: string;
  total_price: number;
  platform_fee_amount: number | null;
  vessel_name: string | null;
  vessel_length: number | null;
  created_at: string;
  slips: { name: string; marina_id: string } | null;
  marinas: { name: string; city: string; state: string } | null;
  profiles: { email: string; full_name: string | null } | null;
}

function AdminContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "marinas" | "claims" | "leads" | "bookings">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [marinas, setMarinas] = useState<AdminMarina[]>([]);
  const [marinasLoading, setMarinasLoading] = useState(false);
  const [marinasTotal, setMarinasTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [claimedFilter, setClaimedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingMarina, setEditingMarina] = useState<AdminMarina | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  // Leads tab state
  const [leadsSubTab, setLeadsSubTab] = useState<"blog" | "calculator">("blog");
  const [blogLeads, setBlogLeads] = useState<BlogLead[]>([]);
  const [blogLeadsTotal, setBlogLeadsTotal] = useState(0);
  const [calcLeads, setCalcLeads] = useState<CalcLead[]>([]);
  const [calcLeadsTotal, setCalcLeadsTotal] = useState(0);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsUserTypeFilter, setLeadsUserTypeFilter] = useState("all");
  const [leadsPage, setLeadsPage] = useState(1);

  // Bookings tab state
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsStatusFilter, setBookingsStatusFilter] = useState("all");
  const [bookingsPage, setBookingsPage] = useState(1);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch {
      // non-fatal
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchMarinas = useCallback(async () => {
    setMarinasLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        claimed: claimedFilter,
        page: String(page),
      });
      const res = await fetch(`/api/admin/marinas?${params}`);
      const data = await res.json();
      if (res.ok) {
        setMarinas(data.marinas);
        setMarinasTotal(data.total);
      }
    } catch {
      setMarinas([]);
    } finally {
      setMarinasLoading(false);
    }
  }, [search, statusFilter, claimedFilter, page]);

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const blogParams = new URLSearchParams({
        kind: "blog",
        user_type: leadsUserTypeFilter,
        page: String(leadsPage),
      });
      const calcParams = new URLSearchParams({ kind: "calculator", page: String(leadsPage) });

      const [blogRes, calcRes] = await Promise.all([
        fetch(`/api/admin/leads?${blogParams}`),
        fetch(`/api/admin/leads?${calcParams}`),
      ]);

      if (blogRes.ok) {
        const d = await blogRes.json();
        setBlogLeads(d.leads ?? []);
        setBlogLeadsTotal(d.total ?? 0);
      }
      if (calcRes.ok) {
        const d = await calcRes.json();
        setCalcLeads(d.leads ?? []);
        setCalcLeadsTotal(d.total ?? 0);
      }
    } catch {
      // non-fatal
    } finally {
      setLeadsLoading(false);
    }
  }, [leadsUserTypeFilter, leadsPage]);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const params = new URLSearchParams({
        status: bookingsStatusFilter,
        page: String(bookingsPage),
      });
      const res = await fetch(`/api/admin/bookings?${params}`);
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings ?? []);
        setBookingsTotal(data.total ?? 0);
      }
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [bookingsStatusFilter, bookingsPage]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === "marinas" || activeTab === "claims") {
      fetchMarinas();
    }
  }, [activeTab, fetchMarinas]);

  useEffect(() => {
    if (activeTab === "leads") {
      fetchLeads();
    }
  }, [activeTab, fetchLeads]);

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [activeTab, fetchBookings]);

  const handleToggleActive = async (marina: AdminMarina) => {
    setToggleLoadingId(marina.id);
    try {
      const res = await fetch(`/api/admin/marinas/${marina.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !marina.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setMarinas((prev) =>
        prev.map((m) => (m.id === marina.id ? { ...m, is_active: !marina.is_active } : m))
      );
      setToast({
        message: `${marina.name} ${!marina.is_active ? "activated" : "deactivated"}`,
        type: "success",
      });
      fetchStats();
    } catch {
      setToast({ message: "Failed to update marina", type: "error" });
    } finally {
      setToggleLoadingId(null);
    }
  };

  const handleEditSaved = (updated: AdminMarina) => {
    setMarinas((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditingMarina(null);
    setToast({ message: `${updated.name} updated`, type: "success" });
    fetchStats();
  };

  const claimedMarinas = marinas.filter((m) => m.owner_id && !m.is_active);
  const totalPages = Math.ceil(marinasTotal / 25);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-800">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Internal tools for managing EasyDock marina data</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-1">
          {(["overview", "marinas", "claims", "leads", "bookings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {tab === "claims" && claimedMarinas.length > 0 && activeTab !== "claims" && (
                <span className="ml-2 bg-amber-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {claimedMarinas.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div>
            {statsLoading ? (
              <LoadingSpinner message="Loading stats..." />
            ) : stats ? (
              <>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Marinas</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Total Marinas" value={stats.total} color="navy" />
                    <StatCard label="Claimed" value={stats.claimed} color="teal" />
                    <StatCard label="Unclaimed" value={stats.unclaimed} color="gray" />
                    <StatCard label="Active" value={stats.active} color="green" />
                  </div>
                </div>
                <div className="mb-8">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bookings</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatCard label="Total Bookings" value={stats.bookingsTotal ?? 0} color="navy" />
                    <StatCard label="Active Bookings" value={stats.bookingsActive ?? 0} color="teal" />
                    <div className="rounded-xl p-5 bg-green-600 text-white">
                      <p className="text-3xl font-bold">
                        ${Math.round((stats.totalRevenue ?? 0) / 100).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1 opacity-90">GMV (confirmed)</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="font-semibold text-navy-800 mb-3">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab("marinas")}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                    >
                      Browse All Marinas
                    </button>
                    <button
                      onClick={() => {
                        setClaimedFilter("claimed");
                        setStatusFilter("inactive");
                        setActiveTab("claims");
                      }}
                      className="border border-amber-500 text-amber-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-50 transition-colors"
                    >
                      Review Claims Queue
                    </button>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="border border-navy-300 text-navy-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-navy-50 transition-colors"
                    >
                      View All Bookings
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Failed to load stats.</p>
            )}
          </div>
        )}

        {/* Marinas tab */}
        {activeTab === "marinas" && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, city, state..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={claimedFilter}
                onChange={(e) => { setClaimedFilter(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All (Claimed + Unclaimed)</option>
                <option value="claimed">Claimed</option>
                <option value="unclaimed">Unclaimed</option>
              </select>
              <button
                onClick={() => { setSearch(""); setStatusFilter("all"); setClaimedFilter("all"); setPage(1); }}
                className="text-sm text-gray-500 hover:text-gray-700 px-2"
              >
                Clear
              </button>
            </div>

            {marinasLoading ? (
              <LoadingSpinner message="Loading marinas..." />
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">
                  {marinasTotal} marina{marinasTotal !== 1 ? "s" : ""} found
                </p>
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Location</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Claim</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Source</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {marinas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-gray-400">
                            No marinas match your filters.
                          </td>
                        </tr>
                      ) : (
                        marinas.map((marina) => (
                          <MarinaRow
                            key={marina.id}
                            marina={marina}
                            toggleLoading={toggleLoadingId === marina.id}
                            onEdit={() => setEditingMarina(marina)}
                            onToggle={() => handleToggleActive(marina)}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Claims tab */}
        {activeTab === "claims" && (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Marinas that have been claimed by an owner but are not yet active. Review and activate
                once the owner has completed their setup.
              </p>
            </div>

            {marinasLoading ? (
              <LoadingSpinner message="Loading claims..." />
            ) : claimedMarinas.length === 0 ? (
              <div className="bg-white rounded-xl border shadow-sm p-10 text-center">
                <p className="text-gray-500 font-medium">No pending claims</p>
                <p className="text-sm text-gray-400 mt-1">
                  Claims will appear here after marina owners claim their listing and before they
                  activate their account.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Marina</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Location</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Owner</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Claimed</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {claimedMarinas.map((marina) => (
                      <tr key={marina.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-navy-800">{marina.name}</p>
                          <p className="text-xs text-gray-400">{marina.source}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {marina.city}, {marina.state}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {marina.profiles?.email ?? marina.owner_id}
                          {marina.profiles?.full_name && (
                            <p className="text-xs text-gray-400">{marina.profiles.full_name}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {marina.claimed_at
                            ? new Date(marina.claimed_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingMarina(marina)}
                              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(marina)}
                              disabled={toggleLoadingId === marina.id}
                              className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-60"
                            >
                              {toggleLoadingId === marina.id ? "..." : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
              Hook for future claim approval flow: when marina owners claim a listing, it lands
              here for admin review before going live. Currently self-serve — activate manually

              once the owner has completed Stripe setup.
            </div>
          </div>
        )}
        {/* Leads tab */}
        {activeTab === "leads" && (
          <div>
            {/* Sub-tabs */}
            <div className="flex gap-1 mb-5 border-b border-gray-200">
              {(["blog", "calculator"] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => { setLeadsSubTab(sub); setLeadsPage(1); }}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                    leadsSubTab === sub
                      ? "border-teal-600 text-teal-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {sub === "blog" ? `Blog / Form (${blogLeadsTotal})` : `Calculator (${calcLeadsTotal})`}
                </button>
              ))}
            </div>

            {leadsSubTab === "blog" && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <select
                    value={leadsUserTypeFilter}
                    onChange={(e) => { setLeadsUserTypeFilter(e.target.value); setLeadsPage(1); }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Types</option>
                    <option value="marina_owner">Marina Owner</option>
                    <option value="yacht_owner">Yacht Owner</option>
                  </select>
                  <span className="text-sm text-gray-500">{blogLeadsTotal} lead{blogLeadsTotal !== 1 ? "s" : ""}</span>
                </div>

                {leadsLoading ? (
                  <LoadingSpinner message="Loading leads..." />
                ) : (
                  <>
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Type</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {blogLeads.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-10 text-gray-400">
                                No leads yet.
                              </td>
                            </tr>
                          ) : (
                            blogLeads.map((lead) => (
                              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-navy-800">{lead.name}</td>
                                <td className="px-4 py-3 text-gray-600">
                                  <a href={`mailto:${lead.email}`} className="hover:underline text-teal-700">
                                    {lead.email}
                                  </a>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    lead.user_type === "marina_owner"
                                      ? "bg-teal-100 text-teal-800"
                                      : "bg-navy-100 text-navy-800"
                                  }`}>
                                    {lead.user_type === "marina_owner" ? "Marina Owner" : "Yacht Owner"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {Math.ceil(blogLeadsTotal / 25) > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <button
                          disabled={leadsPage === 1}
                          onClick={() => setLeadsPage((p) => p - 1)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-500">
                          Page {leadsPage} of {Math.ceil(blogLeadsTotal / 25)}
                        </span>
                        <button
                          disabled={leadsPage === Math.ceil(blogLeadsTotal / 25)}
                          onClick={() => setLeadsPage((p) => p + 1)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {leadsSubTab === "calculator" && (
              <div>
                <p className="text-sm text-gray-500 mb-4">{calcLeadsTotal} calculator submission{calcLeadsTotal !== 1 ? "s" : ""}</p>
                {leadsLoading ? (
                  <LoadingSpinner message="Loading leads..." />
                ) : (
                  <>
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Marina</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Region</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Slips</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Est. Loss</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {calcLeads.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-10 text-gray-400">
                                No calculator submissions yet.
                              </td>
                            </tr>
                          ) : (
                            calcLeads.map((lead) => (
                              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-gray-600">
                                  <a href={`mailto:${lead.email}`} className="hover:underline text-teal-700">
                                    {lead.email}
                                  </a>
                                  {lead.phone && <p className="text-xs text-gray-400">{lead.phone}</p>}
                                </td>
                                <td className="px-4 py-3 text-navy-800 font-medium">{lead.marina_name ?? "—"}</td>
                                <td className="px-4 py-3 text-gray-500">{lead.region ?? "—"}</td>
                                <td className="px-4 py-3 text-gray-500">
                                  {lead.total_slips != null ? (
                                    <span>{lead.total_slips} total / {lead.vacant_slips ?? "?"} vacant</span>
                                  ) : "—"}
                                </td>
                                <td className="px-4 py-3">
                                  {lead.annual_loss != null ? (
                                    <span className="font-semibold text-red-700">
                                      ${Math.round(lead.annual_loss).toLocaleString()}
                                    </span>
                                  ) : "—"}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {Math.ceil(calcLeadsTotal / 25) > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <button
                          disabled={leadsPage === 1}
                          onClick={() => setLeadsPage((p) => p - 1)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-500">
                          Page {leadsPage} of {Math.ceil(calcLeadsTotal / 25)}
                        </span>
                        <button
                          disabled={leadsPage === Math.ceil(calcLeadsTotal / 25)}
                          onClick={() => setLeadsPage((p) => p + 1)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <div>
            <div className="flex flex-wrap gap-3 mb-5">
              <select
                value={bookingsStatusFilter}
                onChange={(e) => { setBookingsStatusFilter(e.target.value); setBookingsPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="declined">Declined</option>
              </select>
              <span className="self-center text-sm text-gray-500">
                {bookingsTotal} booking{bookingsTotal !== 1 ? "s" : ""}
              </span>
            </div>

            {bookingsLoading ? (
              <LoadingSpinner message="Loading bookings..." />
            ) : (
              <>
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Marina / Slip</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Boat Owner</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Dates</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Amount</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-gray-400">
                            No bookings found.
                          </td>
                        </tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium text-navy-800">{booking.marinas?.name ?? "—"}</p>
                              <p className="text-xs text-gray-400">
                                {booking.slips?.name ?? "—"} · {booking.marinas?.city}, {booking.marinas?.state}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              <p>{booking.profiles?.email ?? "—"}</p>
                              {booking.vessel_name && (
                                <p className="text-xs text-gray-400">{booking.vessel_name}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">
                              <p>{new Date(booking.check_in).toLocaleDateString()}</p>
                              <p className="text-gray-400">→ {new Date(booking.check_out).toLocaleDateString()}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-navy-800">
                                ${(booking.total_price / 100).toLocaleString()}
                              </p>
                              {booking.platform_fee_amount != null && (
                                <p className="text-xs text-gray-400">
                                  fee: ${(booking.platform_fee_amount / 100).toLocaleString()}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={booking.status} />
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {Math.ceil(bookingsTotal / 25) > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      disabled={bookingsPage === 1}
                      onClick={() => setBookingsPage((p) => p - 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {bookingsPage} of {Math.ceil(bookingsTotal / 25)}
                    </span>
                    <button
                      disabled={bookingsPage === Math.ceil(bookingsTotal / 25)}
                      onClick={() => setBookingsPage((p) => p + 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {/* Edit Modal */}
      {editingMarina && (
        <EditModal
          marina={editingMarina}
          onClose={() => setEditingMarina(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${
            toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ProtectedRoute>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "navy" | "teal" | "gray" | "green";
}) {
  const colorMap = {
    navy: "bg-navy-800 text-white",
    teal: "bg-teal-600 text-white",
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-600 text-white",
  };
  return (
    <div className={`rounded-xl p-5 ${colorMap[color]}`}>
      <p className="text-3xl font-bold">{value.toLocaleString()}</p>
      <p className="text-sm mt-1 opacity-90">{label}</p>
    </div>
  );
}

function MarinaRow({
  marina,
  toggleLoading,
  onEdit,
  onToggle,
}: {
  marina: AdminMarina;
  toggleLoading: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <p className="font-medium text-navy-800">{marina.name}</p>
        {marina.phone && <p className="text-xs text-gray-400">{marina.phone}</p>}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {marina.city}, {marina.state}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={marina.is_active ? "active" : "inactive"} />
      </td>
      <td className="px-4 py-3 text-gray-600">
        {marina.owner_id ? (
          <span className="inline-flex items-center gap-1 text-xs text-teal-700 font-medium">
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
            Claimed
          </span>
        ) : (
          <span className="text-xs text-gray-400">Unclaimed</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">{marina.source}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Edit
          </button>
          <button
            onClick={onToggle}
            disabled={toggleLoading}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-60 transition-colors ${
              marina.is_active
                ? "border border-red-300 text-red-600 hover:bg-red-50"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            {toggleLoading ? "..." : marina.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
}
