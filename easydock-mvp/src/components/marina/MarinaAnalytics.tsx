import { useEffect, useMemo } from 'react';
import { useMarinaStore } from '../../stores/marinaStore';
import { format } from 'date-fns';

interface MarinaAnalyticsProps {
  marinaId: string;
}

export default function MarinaAnalytics({ marinaId }: MarinaAnalyticsProps) {
  const { slips, fetchSlips, bookings, fetchBookings, loading } = useMarinaStore();

  useEffect(() => {
    fetchSlips(marinaId);
    fetchBookings(marinaId);
  }, [marinaId, fetchSlips, fetchBookings]);

  const analytics = useMemo(() => {
    const totalSlips = slips.length;
    const activeSlips = slips.filter((s) => s.is_active).length;
    const totalBookings = bookings.length;
    const approvedBookings = bookings.filter((b) => b.status === 'approved').length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;

    const totalRevenue = bookings
      .filter((b) => b.status === 'approved' || b.status === 'completed')
      .reduce((sum, b) => sum + b.total_price, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = bookings
      .filter((b) => {
        const bookingDate = new Date(b.created_at);
        return (
          (b.status === 'approved' || b.status === 'completed') &&
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, b) => sum + b.total_price, 0);

    // Calculate occupancy rate (simplified - based on approved bookings)
    const today = new Date();
    const activeBookings = bookings.filter(
      (b) =>
        b.status === 'approved' &&
        new Date(b.start_date) <= today &&
        new Date(b.end_date) >= today
    );
    const occupancyRate = totalSlips > 0 ? (activeBookings.length / totalSlips) * 100 : 0;

    return {
      totalSlips,
      activeSlips,
      totalBookings,
      approvedBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
      monthlyRevenue,
      occupancyRate,
    };
  }, [slips, bookings]);

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Slips</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalSlips}</p>
          <p className="text-sm text-gray-600 mt-1">{analytics.activeSlips} active</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Occupancy Rate</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.occupancyRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-600 mt-1">Current occupancy</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings}</p>
          <p className="text-sm text-gray-600 mt-1">
            {analytics.approvedBookings} approved, {analytics.pendingBookings} pending
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">${analytics.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-1">All time</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">${analytics.monthlyRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-1">{format(new Date(), 'MMMM yyyy')}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Completed Bookings</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics.completedBookings}</p>
          <p className="text-sm text-gray-600 mt-1">Successfully completed</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice(0, 10).map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(booking.start_date), 'MMM d')} -{' '}
                      {format(new Date(booking.end_date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${booking.total_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
