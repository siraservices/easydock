import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useSearchStore } from '../../stores/searchStore';
import { Marina, Slip } from '../../types';
import { Link } from 'react-router-dom';

const searchSchema = z.object({
  location: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  powerAvailable: z.boolean().optional(),
  waterAvailable: z.boolean().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

export const SlipSearch = () => {
  const { filters, setFilters, results, setResults, setLoading } = useSearchStore();
  const [searching, setSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: filters,
  });

  const onSubmit = async (data: SearchFormData) => {
    setSearching(true);
    setLoading(true);
    setFilters(data);

    try {
      let marinaQuery = supabase.from('marinas').select('*');
      let slipQuery = supabase.from('slips').select('*');

      // Apply location filters
      if (data.city) {
        marinaQuery = marinaQuery.ilike('city', `%${data.city}%`);
      }
      if (data.state) {
        marinaQuery = marinaQuery.eq('state', data.state);
      }
      if (data.location) {
        marinaQuery = marinaQuery.or(
          `city.ilike.%${data.location}%,state.ilike.%${data.location}%,address.ilike.%${data.location}%`
        );
      }

      const { data: marinas, error: marinaError } = await marinaQuery;
      if (marinaError) throw marinaError;

      if (!marinas || marinas.length === 0) {
        setResults([]);
        setLoading(false);
        setSearching(false);
        return;
      }

      const marinaIds = marinas.map((m) => m.id);
      slipQuery = slipQuery.in('marina_id', marinaIds);

      // Apply slip filters
      if (data.minLength) {
        slipQuery = slipQuery.gte('length', data.minLength);
      }
      if (data.maxLength) {
        slipQuery = slipQuery.lte('length', data.maxLength);
      }
      if (data.minPrice) {
        slipQuery = slipQuery.gte('daily_rate', data.minPrice);
      }
      if (data.maxPrice) {
        slipQuery = slipQuery.lte('daily_rate', data.maxPrice);
      }
      if (data.powerAvailable) {
        slipQuery = slipQuery.eq('power_available', true);
      }
      if (data.waterAvailable) {
        slipQuery = slipQuery.eq('water_available', true);
      }

      const { data: slips, error: slipError } = await slipQuery;
      if (slipError) throw slipError;

      // Combine results
      const combinedResults = (slips || []).map((slip) => {
        const marina = marinas.find((m) => m.id === slip.marina_id);
        return { marina: marina as Marina, slip: slip as Slip };
      });

      setResults(combinedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-secondary font-bold text-primary-navy mb-4">
          Search for Marina Slips
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                {...register('location')}
                type="text"
                placeholder="City, State, or Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                {...register('state')}
                type="text"
                placeholder="e.g., FL, CA, NY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                {...register('startDate')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                {...register('endDate')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Length (ft)</label>
              <input
                {...register('minLength', { valueAsNumber: true })}
                type="number"
                placeholder="Minimum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Length (ft)</label>
              <input
                {...register('maxLength', { valueAsNumber: true })}
                type="number"
                placeholder="Maximum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($/day)</label>
              <input
                {...register('minPrice', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="Minimum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($/day)</label>
              <input
                {...register('maxPrice', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="Maximum"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                {...register('powerAvailable')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-navy"
              />
              <span className="ml-2 text-sm text-gray-700">Power Available</span>
            </label>

            <label className="flex items-center">
              <input
                {...register('waterAvailable')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-navy"
              />
              <span className="ml-2 text-sm text-gray-700">Water Available</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={searching}
            className="w-full px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 font-medium"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-primary-navy mb-2">
                    {result.marina.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {result.marina.address}, {result.marina.city}, {result.marina.state}{' '}
                    {result.marina.zip_code}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-gray-100 rounded text-sm">
                      {result.slip.length}' × {result.slip.width}'
                    </span>
                    {result.slip.power_available && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        Power
                      </span>
                    )}
                    {result.slip.water_available && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                        Water
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-accent-gold">
                    ${result.slip.daily_rate.toFixed(2)}/day
                  </p>
                </div>
                <Link
                  to={`/book/${result.slip.id}`}
                  className="ml-4 px-6 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90 font-medium"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            {searching ? 'Searching...' : 'No results found. Try adjusting your search criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};
