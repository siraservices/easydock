import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Booking } from '../../types';
import { Link } from 'react-router-dom';

export const YachtOwnerDashboard = () => {
  const { profile } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('yacht_owner_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [profile]);

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

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-secondary font-bold text-primary-navy">My Bookings</h2>
        <Link
          to="/search"
          className="px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90 font-medium"
        >
          Search for Slips
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">You don't have any bookings yet.</p>
          <Link
            to="/search"
            className="px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90 font-medium inline-block"
          >
            Search for Marina Slips
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{booking.vessel_name || 'Unnamed Vessel'}</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(booking.start_date), 'MMM d, yyyy')} -{' '}
                    {format(new Date(booking.end_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Price</p>
                  <p className="font-medium">${booking.total_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Vessel Size</p>
                  <p className="font-medium">
                    {booking.vessel_length}' × {booking.vessel_width}'
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Booking Date</p>
                  <p className="font-medium">
                    {format(new Date(booking.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium">{booking.status}</p>
                </div>
              </div>

              {booking.special_requests && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Special Requests:</p>
                  <p className="text-sm">{booking.special_requests}</p>
                </div>
              )}

              {booking.status === 'pending' && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
