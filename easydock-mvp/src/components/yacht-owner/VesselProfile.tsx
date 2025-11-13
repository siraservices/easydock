import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface VesselFormData {
  vessel_name: string;
  vessel_length: number;
  vessel_width: number;
  vessel_draft?: number;
}

export default function VesselProfile() {
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VesselFormData>({
    defaultValues: {
      vessel_name: '',
      vessel_length: 0,
      vessel_width: 0,
      vessel_draft: undefined,
    },
  });

  const onSubmit = async (_data: VesselFormData) => {
    // In a real app, this would save to a vessel profile table
    // For now, we'll just show a success message
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Vessel Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="vessel_name" className="block text-sm font-medium text-gray-700">
            Vessel Name
          </label>
          <input
            type="text"
            id="vessel_name"
            {...register('vessel_name', { required: 'Vessel name is required' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
          />
          {errors.vessel_name && (
            <p className="mt-1 text-sm text-red-600">{errors.vessel_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vessel_length" className="block text-sm font-medium text-gray-700">
              Length (ft)
            </label>
            <input
              type="number"
              step="0.1"
              id="vessel_length"
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
            <label htmlFor="vessel_width" className="block text-sm font-medium text-gray-700">
              Width (ft)
            </label>
            <input
              type="number"
              step="0.1"
              id="vessel_width"
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
          <label htmlFor="vessel_draft" className="block text-sm font-medium text-gray-700">
            Draft (ft) - Optional
          </label>
          <input
            type="number"
            step="0.1"
            id="vessel_draft"
            {...register('vessel_draft', { valueAsNumber: true })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
          />
        </div>

        {saved && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">Vessel profile saved successfully!</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-primary-dark"
        >
          Save Vessel Profile
        </button>
      </form>
    </div>
  );
}
