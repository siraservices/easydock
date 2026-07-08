import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useMarinaStore } from '../../stores/marinaStore';
import { Booking } from '../../types';

interface BookingApprovalProps {
  marinaId: string;
}

export const BookingApproval = ({ marinaId }: BookingApprovalProps) => {
  const { bookings, fetchBookings, loading } = useMarinaStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (marinaId) {
      fetchBookings(marinaId);
    }
  }, [marinaId, fetchBookings]);

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchBookings(marinaId);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-secondary font-bold text-primary-navy">Booking Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary-navy text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending'
                ? 'bg-primary-navy text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'approved'
                ? 'bg-primary-navy text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'rejected'
                ? 'bg-primary-navy text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No bookings found.</div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {booking.vessel_name || 'Unnamed Vessel'}
                  </h3>
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
                  <p className="text-gray-600">Vessel Size</p>
                  <p className="font-medium">
                    {booking.vessel_length}' × {booking.vessel_width}'
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Price</p>
                  <p className="font-medium">${booking.total_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Booking Date</p>
                  <p className="font-medium">
                    {format(new Date(booking.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium">
                    {Math.ceil(
                      (new Date(booking.end_date).getTime() -
                        new Date(booking.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </p>
                </div>
              </div>

              {booking.special_requests && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Special Requests:</p>
                  <p className="text-sm">{booking.special_requests}</p>
                </div>
              )}

              {booking.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleStatusChange(booking.id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
