import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';

const leadSchema = z.object({
  email: z.string().email('Invalid email address'),
  user_type: z.enum(['yacht_owner', 'marina_owner']).optional(),
  launch_notify: z.boolean().default(false),
  message: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureProps {
  onClose?: () => void;
}

export const LeadCapture = ({ onClose }: LeadCaptureProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      launch_notify: false,
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('leads').insert({
        email: data.email,
        user_type: data.user_type,
        launch_notify: data.launch_notify,
        message: data.message || null,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      reset();
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-auto">
      <h2 className="text-2xl font-secondary font-bold text-primary-navy mb-6 text-center">
        Get Started with EasyDock
      </h2>

      {success ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-green-600 text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600">
            Your information has been successfully submitted. We'll be in touch soon!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-navy transition">
                <input
                  {...register('user_type')}
                  type="radio"
                  value="yacht_owner"
                  className="mr-2"
                />
                <div>
                  <i className="fas fa-ship text-secondary-teal block mb-1"></i>
                  <span className="text-sm font-medium">Yacht Owner</span>
                </div>
              </label>
              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-navy transition">
                <input
                  {...register('user_type')}
                  type="radio"
                  value="marina_owner"
                  className="mr-2"
                />
                <div>
                  <i className="fas fa-anchor text-secondary-teal block mb-1"></i>
                  <span className="text-sm font-medium">Marina Owner</span>
                </div>
              </label>
            </div>
            {errors.user_type && (
              <p className="mt-1 text-sm text-red-600">{errors.user_type.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center">
              <input
                {...register('launch_notify')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-navy mr-2"
              />
              <span className="text-sm text-gray-700">Notify me when the platform launches</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              {...register('message')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
              placeholder="Tell us about your marina needs or services..."
            />
          </div>

          <div className="flex space-x-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-primary-navy text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
