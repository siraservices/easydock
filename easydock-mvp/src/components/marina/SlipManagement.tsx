import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMarinaStore } from '../../stores/marinaStore';
import type { Slip } from '../../types';

const slipSchema = z.object({
  slip_number: z.string().min(1, 'Slip number is required'),
  length: z.number().min(1, 'Length must be greater than 0'),
  width: z.number().min(1, 'Width must be greater than 0'),
  draft: z.number().optional().nullable(),
  power_available: z.boolean(),
  power_voltage: z.number().optional().nullable(),
  water_available: z.boolean(),
  daily_rate: z.number().min(0, 'Daily rate must be 0 or greater'),
  weekly_rate: z.number().optional().nullable(),
  monthly_rate: z.number().optional().nullable(),
  is_active: z.boolean(),
});

type SlipFormData = z.infer<typeof slipSchema>;

interface SlipManagementProps {
  marinaId: string;
}

export default function SlipManagement({ marinaId }: SlipManagementProps) {
  const { slips, fetchSlips, createSlip, updateSlip, deleteSlip, loading } = useMarinaStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSlip, setEditingSlip] = useState<Slip | null>(null);

  useEffect(() => {
    fetchSlips(marinaId);
  }, [marinaId, fetchSlips]);

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
      is_active: true,
    },
  });

  useEffect(() => {
    if (editingSlip) {
      setValue('slip_number', editingSlip.slip_number);
      setValue('length', editingSlip.length);
      setValue('width', editingSlip.width);
      setValue('draft', editingSlip.draft);
      setValue('power_available', editingSlip.power_available);
      setValue('power_voltage', editingSlip.power_voltage);
      setValue('water_available', editingSlip.water_available);
      setValue('daily_rate', editingSlip.daily_rate);
      setValue('weekly_rate', editingSlip.weekly_rate);
      setValue('monthly_rate', editingSlip.monthly_rate);
      setValue('is_active', editingSlip.is_active);
      setShowForm(true);
    }
  }, [editingSlip, setValue]);

  const onSubmit = async (data: SlipFormData) => {
    if (editingSlip) {
      await updateSlip(editingSlip.id, data);
    } else {
      await createSlip({
        marina_id: marinaId,
        ...data,
        draft: data.draft ?? null,
        power_voltage: data.power_voltage ?? null,
        weekly_rate: data.weekly_rate ?? null,
        monthly_rate: data.monthly_rate ?? null,
      });
    }
    reset();
    setShowForm(false);
    setEditingSlip(null);
    fetchSlips(marinaId);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this slip?')) {
      await deleteSlip(id);
      fetchSlips(marinaId);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Slip Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-primary-dark"
        >
          {showForm ? 'Cancel' : '+ Add Slip'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingSlip ? 'Edit Slip' : 'Add New Slip'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Slip Number *</label>
                <input
                  type="text"
                  {...register('slip_number')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                />
                {errors.slip_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.slip_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Length (ft) *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('length', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                />
                {errors.length && (
                  <p className="mt-1 text-sm text-red-600">{errors.length.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Width (ft) *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('width', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                />
                {errors.width && (
                  <p className="mt-1 text-sm text-red-600">{errors.width.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Draft (ft)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('draft', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Daily Rate ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('daily_rate', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                />
                {errors.daily_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.daily_rate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Weekly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('weekly_rate', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('monthly_rate', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Power Voltage</label>
                <input
                  type="number"
                  {...register('power_voltage', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('power_available')}
                  className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                />
                <span className="ml-2 text-sm text-gray-700">Power Available</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('water_available')}
                  className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                />
                <span className="ml-2 text-sm text-gray-700">Water Available</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-primary-dark"
              >
                {editingSlip ? 'Update' : 'Create'} Slip
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
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
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : slips.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No slips found. Add your first slip to get started.
                </td>
              </tr>
            ) : (
              slips.map((slip) => (
                <tr key={slip.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {slip.slip_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {slip.length}' × {slip.width}'
                    {slip.draft && ` (${slip.draft}' draft)`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {slip.power_available && '⚡'}
                    {slip.water_available && '💧'}
                    {!slip.power_available && !slip.water_available && '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${slip.daily_rate.toFixed(2)}/day
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        slip.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {slip.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(slip)}
                      className="text-primary-navy hover:text-primary-dark mr-4"
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
