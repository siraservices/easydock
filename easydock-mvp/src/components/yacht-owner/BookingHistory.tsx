import { useEffect } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
import { useMarinaStore } from '../../stores/marinaStore';
import type { Booking } from '../../types';

export default function BookingHistory() {
  const { profile } = useAuthStore();
  const { bookings, fetchBookings, loading } = useMarinaStore();

  useEffect(() => {
    if (profile?.id) {
      fetchBookings();
    }
  }, [profile, fetchBookings]);

  const userBookings = bookings.filter(
    (b) => b.yacht_owner_id === profile?.id
  );

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Booking History</h2>
      {loading ? (
        <div className="text-center py-8">Loading bookings...</div>
      ) : userBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No bookings yet</p>
          <p className="text-sm mt-2">Start by searching for available marina slips</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userBookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(booking.start_date), 'MMM d')} -{' '}
                    {format(new Date(booking.end_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Booking ID: {booking.id.slice(0, 8)}...
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <div>
                  {booking.vessel_name && (
                    <p className="text-sm text-gray-600">Vessel: {booking.vessel_name}</p>
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  ${booking.total_price.toFixed(2)}
                </p>
              </div>
              {booking.special_requests && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Special requests:</span> {booking.special_requests}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
