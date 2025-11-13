import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchStore } from '../../stores/searchStore';
import type { SearchFilters } from '../../types';

export default function SlipSearch() {
  const { filters, setFilters, search, loading } = useSearchStore();
  const [showFilters, setShowFilters] = useState(false);

  const { register, handleSubmit } = useForm<SearchFilters>({
    defaultValues: filters,
  });

  const onSubmit = async (data: SearchFilters) => {
    setFilters(data);
    await search();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Search for Marina Slips</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              {...register('location')}
              placeholder="City, State, or Address"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                {...register('start_date')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                {...register('end_date')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-primary-navy hover:text-primary-dark"
        >
          {showFilters ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Length (ft)</label>
              <input
                type="number"
                step="0.1"
                {...register('min_length', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Length (ft)</label>
              <input
                type="number"
                step="0.1"
                {...register('max_length', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Width (ft)</label>
              <input
                type="number"
                step="0.1"
                {...register('min_width', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Width (ft)</label>
              <input
                type="number"
                step="0.1"
                {...register('max_width', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Price ($/day)</label>
              <input
                type="number"
                step="0.01"
                {...register('min_price', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Price ($/day)</label>
              <input
                type="number"
                step="0.01"
                {...register('max_price', { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('power_required')}
                className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
              />
              <label className="ml-2 text-sm text-gray-700">Power Required</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('water_required')}
                className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
              />
              <label className="ml-2 text-sm text-gray-700">Water Required</label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
}
