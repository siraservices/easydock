import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import type { Slip, Marina } from '../../types';
import { format, differenceInDays } from 'date-fns';

interface BookingFlowProps {
  slip: Slip;
  marina: Marina;
  startDate: string;
  endDate: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface BookingFormData {
  vessel_name: string;
  vessel_length: number;
  vessel_width: number;
  special_requests?: string;
}

export default function BookingFlow({
  slip,
  marina,
  startDate,
  endDate,
  onComplete,
  onCancel,
}: BookingFlowProps) {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>();

  const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
  const totalPrice = slip.daily_rate * days;

  const onSubmit = async (data: BookingFormData) => {
    if (!profile?.id) {
      setError('You must be logged in to make a booking');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: bookingError } = await supabase.from('bookings').insert({
        slip_id: slip.id,
        yacht_owner_id: profile.id,
        marina_id: marina.id,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending',
        vessel_name: data.vessel_name,
        vessel_length: data.vessel_length,
        vessel_width: data.vessel_width,
        special_requests: data.special_requests || null,
      });

      if (bookingError) {
        setError(bookingError.message);
        setLoading(false);
      } else {
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Your Booking</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">{marina.name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          Slip {slip.slip_number} - {slip.length}' × {slip.width}'
        </p>
        <p className="text-sm text-gray-600">
          {format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d, yyyy')} ({days}{' '}
          {days === 1 ? 'day' : 'days'})
        </p>
        <p className="text-lg font-semibold text-gray-900 mt-2">
          Total: ${totalPrice.toFixed(2)}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Vessel Name *</label>
          <input
            type="text"
            {...register('vessel_name', { required: 'Vessel name is required' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
          />
          {errors.vessel_name && (
            <p className="mt-1 text-sm text-red-600">{errors.vessel_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vessel Length (ft) *</label>
            <input
              type="number"
              step="0.1"
              {...register('vessel_length', {
                required: 'Length is required',
                min: { value: 1, message: 'Length must be greater than 0' },
                valueAsNumber: true,
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
            />
            {errors.vessel_length && (
              <p className="mt-1 text-sm text-red-600">{errors.vessel_length.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vessel Width (ft) *</label>
            <input
              type="number"
              step="0.1"
              {...register('vessel_width', {
                required: 'Width is required',
                min: { value: 1, message: 'Width must be greater than 0' },
                valueAsNumber: true,
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
            />
            {errors.vessel_width && (
              <p className="mt-1 text-sm text-red-600">{errors.vessel_width.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Special Requests</label>
          <textarea
            rows={3}
            {...register('special_requests')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
            placeholder="Any special requests or notes..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-navy text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
