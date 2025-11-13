import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInDays } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Slip, Marina } from '../../types';
import { Layout } from '../common/Layout';

const bookingSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  vessel_name: z.string().min(1, 'Vessel name is required'),
  vessel_length: z.number().min(1, 'Vessel length is required'),
  vessel_width: z.number().min(1, 'Vessel width is required'),
  special_requests: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ['end_date'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

export const BookingFlow = () => {
  const { slipId } = useParams<{ slipId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [slip, setSlip] = useState<Slip | null>(null);
  const [marina, setMarina] = useState<Marina | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');

  useEffect(() => {
    const fetchSlipData = async () => {
      if (!slipId) return;

      try {
        const { data: slipData, error: slipError } = await supabase
          .from('slips')
          .select('*')
          .eq('id', slipId)
          .single();

        if (slipError) throw slipError;
        setSlip(slipData);

        if (slipData.marina_id) {
          const { data: marinaData, error: marinaError } = await supabase
            .from('marinas')
            .select('*')
            .eq('id', slipData.marina_id)
            .single();

          if (marinaError) throw marinaError;
          setMarina(marinaData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load slip information');
      } finally {
        setLoading(false);
      }
    };

    fetchSlipData();
  }, [slipId]);

  const calculateTotal = () => {
    if (!startDate || !endDate || !slip) return 0;
    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
    return days * slip.daily_rate;
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!profile?.id || !slip || !marina) {
      setError('Missing required information');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const totalPrice = calculateTotal();

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          slip_id: slip.id,
          yacht_owner_id: profile.id,
          marina_id: marina.id,
          start_date: data.start_date,
          end_date: data.end_date,
          total_price: totalPrice,
          vessel_name: data.vessel_name,
          vessel_length: data.vessel_length,
          vessel_width: data.vessel_width,
          special_requests: data.special_requests || null,
          status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      navigate('/yacht-dashboard', { state: { bookingSuccess: true } });
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
        </div>
      </Layout>
    );
  }

  if (error && !slip) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/search')}
              className="px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90"
            >
              Back to Search
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-secondary font-bold text-primary-navy mb-8">
            Complete Your Booking
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold mb-4">Booking Dates</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        {...register('start_date')}
                        type="date"
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
                      />
                      {errors.start_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        {...register('end_date')}
                        type="date"
                        min={startDate || format(new Date(), 'yyyy-MM-dd')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
                      />
                      {errors.end_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Vessel Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vessel Name *
                      </label>
                      <input
                        {...register('vessel_name')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
                        placeholder="My Yacht"
                      />
                      {errors.vessel_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.vessel_name.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Length (ft) *
                        </label>
                        <input
                          {...register('vessel_length', { valueAsNumber: true })}
                          type="number"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
                        />
                        {errors.vessel_length && (
                          <p className="mt-1 text-sm text-red-600">{errors.vessel_length.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Width (ft) *
                        </label>
                        <input
                          {...register('vessel_width', { valueAsNumber: true })}
                          type="number"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
                        />
                        {errors.vessel_width && (
                          <p className="mt-1 text-sm text-red-600">{errors.vessel_width.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests
                      </label>
                      <textarea
                        {...register('special_requests')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
                        placeholder="Any special requests or requirements..."
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 font-medium"
                >
                  {submitting ? 'Processing...' : 'Complete Booking'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow sticky top-4">
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                {marina && (
                  <div className="mb-4">
                    <p className="font-medium text-primary-navy">{marina.name}</p>
                    <p className="text-sm text-gray-600">
                      {marina.city}, {marina.state}
                    </p>
                  </div>
                )}
                {slip && (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Slip Size:</span>
                      <span className="font-medium">
                        {slip.length}' × {slip.width}'
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span className="font-medium">${slip.daily_rate.toFixed(2)}</span>
                    </div>
                    {startDate && endDate && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">
                            {differenceInDays(new Date(endDate), new Date(startDate)) + 1} days
                          </span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-accent-gold">${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
