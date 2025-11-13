import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const vesselSchema = z.object({
  name: z.string().min(1, 'Vessel name is required'),
  length: z.number().min(1, 'Length is required'),
  width: z.number().min(1, 'Width is required'),
  draft: z.number().optional(),
  type: z.string().optional(),
  year: z.number().optional(),
  registration_number: z.string().optional(),
});

type VesselFormData = z.infer<typeof vesselSchema>;

// Note: This is a simplified version. In a full implementation,
// you would have a separate vessels table in the database.
export const VesselProfile = () => {
  const { profile } = useAuthStore();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VesselFormData>({
    resolver: zodResolver(vesselSchema),
  });

  const onSubmit = async (data: VesselFormData) => {
    // In a full implementation, this would save to a vessels table
    // For now, we'll just store it in localStorage
    localStorage.setItem(`vessel_${profile?.id}`, JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    // Load saved vessel data
    if (profile?.id) {
      const savedData = localStorage.getItem(`vessel_${profile.id}`);
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          // You would populate the form here with react-hook-form's setValue
        } catch (error) {
          console.error('Error loading vessel data:', error);
        }
      }
    }
  }, [profile]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-secondary font-bold text-primary-navy mb-6">
        Vessel Profile
      </h2>

      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          Vessel profile saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Name *</label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
            placeholder="My Yacht"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Length (ft) *</label>
            <input
              {...register('length', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
            />
            {errors.length && (
              <p className="mt-1 text-sm text-red-600">{errors.length.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width (ft) *</label>
            <input
              {...register('width', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
            />
            {errors.width && (
              <p className="mt-1 text-sm text-red-600">{errors.width.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Draft (ft)</label>
            <input
              {...register('draft', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Type</label>
            <input
              {...register('type')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              placeholder="e.g., Motor Yacht, Sailboat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              {...register('year', { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              placeholder="2020"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Number
          </label>
          <input
            {...register('registration_number')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
            placeholder="US123456"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90 font-medium"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};
