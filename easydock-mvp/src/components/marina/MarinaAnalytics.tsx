import { useEffect, useMemo } from 'react';
import { useMarinaStore } from '../../stores/marinaStore';
import { Booking } from '../../types';

interface MarinaAnalyticsProps {
  marinaId: string;
}

export const MarinaAnalytics = ({ marinaId }: MarinaAnalyticsProps) => {
  const { bookings, slips, fetchBookings, fetchSlips } = useMarinaStore();

  useEffect(() => {
    if (marinaId) {
      fetchBookings(marinaId);
      fetchSlips(marinaId);
    }
  }, [marinaId, fetchBookings, fetchSlips]);

  const stats = useMemo(() => {
    const totalSlips = slips.length;
    const totalBookings = bookings.length;
    const approvedBookings = bookings.filter((b) => b.status === 'approved').length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const totalRevenue = bookings
      .filter((b) => b.status === 'approved' || b.status === 'completed')
      .reduce((sum, b) => sum + b.total_price, 0);
    const averageBookingValue =
      approvedBookings > 0 ? totalRevenue / approvedBookings : 0;

    // Calculate occupancy rate (simplified - would need date range logic)
    const occupancyRate = totalSlips > 0 ? (approvedBookings / totalSlips) * 100 : 0;

    return {
      totalSlips,
      totalBookings,
      approvedBookings,
      pendingBookings,
      totalRevenue,
      averageBookingValue,
      occupancyRate: Math.min(occupancyRate, 100),
    };
  }, [bookings, slips]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-secondary font-bold text-primary-navy">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Slips</p>
              <p className="text-3xl font-bold text-primary-navy mt-2">{stats.totalSlips}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-anchor text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-secondary-teal mt-2">
                {stats.totalBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <i className="fas fa-calendar-check text-teal-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-accent-gold mt-2">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-dollar-sign text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.occupancyRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-chart-line text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <span className="font-semibold text-green-600">{stats.approvedBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{stats.pendingBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejected</span>
              <span className="font-semibold text-red-600">
                {bookings.filter((b) => b.status === 'rejected').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Booking Value</span>
              <span className="font-semibold">${stats.averageBookingValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold">
                {stats.totalBookings > 0
                  ? ((stats.approvedBookings / stats.totalBookings) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
