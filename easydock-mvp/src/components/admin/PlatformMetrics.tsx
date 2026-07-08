import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const PlatformMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalMarinas: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    approvedBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [users, marinas, bookings] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('marinas').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('*'),
      ]);

      const totalRevenue =
        bookings.data
          ?.filter((b) => b.status === 'approved' || b.status === 'completed')
          .reduce((sum, b) => sum + b.total_price, 0) || 0;

      setMetrics({
        totalUsers: users.count || 0,
        totalMarinas: marinas.count || 0,
        totalBookings: bookings.data?.length || 0,
        totalRevenue,
        pendingBookings: bookings.data?.filter((b) => b.status === 'pending').length || 0,
        approvedBookings: bookings.data?.filter((b) => b.status === 'approved').length || 0,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-secondary font-bold text-primary-navy">Platform Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-primary-navy mt-2">{metrics.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Marinas</p>
              <p className="text-3xl font-bold text-secondary-teal mt-2">
                {metrics.totalMarinas}
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <i className="fas fa-anchor text-teal-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-accent-gold mt-2">
                {metrics.totalBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-calendar-check text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${metrics.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Bookings</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {metrics.pendingBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved Bookings</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {metrics.approvedBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
