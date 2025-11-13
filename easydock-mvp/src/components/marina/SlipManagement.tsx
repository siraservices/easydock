import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useMarinaStore } from '../../stores/marinaStore';
import { Slip } from '../../types';

const slipSchema = z.object({
  slip_number: z.string().optional(),
  length: z.number().min(1, 'Length is required'),
  width: z.number().min(1, 'Width is required'),
  draft: z.number().optional(),
  power_available: z.boolean().default(false),
  power_voltage: z.number().optional(),
  water_available: z.boolean().default(false),
  daily_rate: z.number().min(0.01, 'Daily rate is required'),
  weekly_rate: z.number().optional(),
  monthly_rate: z.number().optional(),
  description: z.string().optional(),
});

type SlipFormData = z.infer<typeof slipSchema>;

interface SlipManagementProps {
  marinaId: string;
}

export const SlipManagement = ({ marinaId }: SlipManagementProps) => {
  const { slips, fetchSlips, loading } = useMarinaStore();
  const [editingSlip, setEditingSlip] = useState<Slip | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SlipFormData>({
    resolver: zodResolver(slipSchema),
    defaultValues: {
      power_available: false,
      water_available: false,
    },
  });

  useEffect(() => {
    if (marinaId) {
      fetchSlips(marinaId);
    }
  }, [marinaId, fetchSlips]);

  useEffect(() => {
    if (editingSlip) {
      setValue('slip_number', editingSlip.slip_number || '');
      setValue('length', editingSlip.length);
      setValue('width', editingSlip.width);
      setValue('draft', editingSlip.draft || undefined);
      setValue('power_available', editingSlip.power_available || false);
      setValue('power_voltage', editingSlip.power_voltage || undefined);
      setValue('water_available', editingSlip.water_available || false);
      setValue('daily_rate', editingSlip.daily_rate);
      setValue('weekly_rate', editingSlip.weekly_rate || undefined);
      setValue('monthly_rate', editingSlip.monthly_rate || undefined);
      setValue('description', editingSlip.description || '');
      setShowForm(true);
    }
  }, [editingSlip, setValue]);

  const onSubmit = async (data: SlipFormData) => {
    setError(null);

    try {
      if (editingSlip) {
        const { error: updateError } = await supabase
          .from('slips')
          .update({
            slip_number: data.slip_number || null,
            length: data.length,
            width: data.width,
            draft: data.draft || null,
            power_available: data.power_available,
            power_voltage: data.power_voltage || null,
            water_available: data.water_available,
            daily_rate: data.daily_rate,
            weekly_rate: data.weekly_rate || null,
            monthly_rate: data.monthly_rate || null,
            description: data.description || null,
          })
          .eq('id', editingSlip.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('slips')
          .insert({
            marina_id: marinaId,
            slip_number: data.slip_number || null,
            length: data.length,
            width: data.width,
            draft: data.draft || null,
            power_available: data.power_available,
            power_voltage: data.power_voltage || null,
            water_available: data.water_available,
            daily_rate: data.daily_rate,
            weekly_rate: data.weekly_rate || null,
            monthly_rate: data.monthly_rate || null,
            description: data.description || null,
          });

        if (insertError) throw insertError;
      }

      await fetchSlips(marinaId);
      reset();
      setShowForm(false);
      setEditingSlip(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save slip');
    }
  };

  const handleDelete = async (slipId: string) => {
    if (!confirm('Are you sure you want to delete this slip?')) return;

    try {
      const { error } = await supabase.from('slips').delete().eq('id', slipId);
      if (error) throw error;
      await fetchSlips(marinaId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete slip');
    }
  };

  const handleEdit = (slip: Slip) => {
    setEditingSlip(slip);
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingSlip(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-secondary font-bold text-primary-navy">Slip Inventory</h2>
        <button
          onClick={() => {
            setEditingSlip(null);
            reset();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90"
        >
          Add New Slip
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingSlip ? 'Edit Slip' : 'Add New Slip'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Slip Number</label>
                <input
                  {...register('slip_number')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Length (ft) *</label>
                <input
                  {...register('length', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.length && (
                  <p className="mt-1 text-sm text-red-600">{errors.length.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Width (ft) *</label>
                <input
                  {...register('width', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.width && (
                  <p className="mt-1 text-sm text-red-600">{errors.width.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Draft (ft)</label>
                <input
                  {...register('draft', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Daily Rate ($) *</label>
                <input
                  {...register('daily_rate', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.daily_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.daily_rate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Weekly Rate ($)</label>
                <input
                  {...register('weekly_rate', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Rate ($)</label>
                <input
                  {...register('monthly_rate', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Power Voltage</label>
                <input
                  {...register('power_voltage', { valueAsNumber: true })}
                  type="number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  {...register('power_available')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-navy"
                />
                <span className="ml-2 text-sm text-gray-700">Power Available</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('water_available')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-navy"
                />
                <span className="ml-2 text-sm text-gray-700">Water Available</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90"
              >
                {editingSlip ? 'Update' : 'Create'} Slip
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading slips...</div>
      ) : slips.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No slips added yet. Click "Add New Slip" to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slip #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimensions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amenities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Daily Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slips.map((slip) => (
                <tr key={slip.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {slip.slip_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {slip.length}' × {slip.width}'
                    {slip.draft && ` (${slip.draft}' draft)`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {slip.power_available && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          Power
                        </span>
                      )}
                      {slip.water_available && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Water
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${slip.daily_rate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(slip)}
                      className="text-secondary-teal hover:text-primary-navy"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slip.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
