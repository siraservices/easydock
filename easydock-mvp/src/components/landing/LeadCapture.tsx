import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';

interface LeadCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeadFormData {
  email: string;
  user_type: 'yacht_owner' | 'marina_owner' | '';
  message: string;
  launch_notify: boolean;
}

export default function LeadCapture({ isOpen, onClose }: LeadCaptureProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    defaultValues: {
      email: '',
      user_type: '',
      message: '',
      launch_notify: false,
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('leads').insert({
        email: data.email,
        user_type: data.user_type || null,
        message: data.message || null,
        launch_notify: data.launch_notify,
      });

      if (error) {
        console.error('Error saving lead:', error);
        alert('There was an error submitting your information. Please try again.');
      } else {
        setSuccess(true);
        reset();
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Get Started with EasyDock</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✓</div>
                <p className="text-lg font-semibold text-gray-900 mb-2">Thank you!</p>
                <p className="text-gray-600">We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-navy">
                      <input
                        type="radio"
                        value="yacht_owner"
                        {...register('user_type', { required: 'Please select a user type' })}
                        className="mr-2"
                      />
                      <span>Yacht Owner</span>
                    </label>
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-navy">
                      <input
                        type="radio"
                        value="marina_owner"
                        {...register('user_type', { required: 'Please select a user type' })}
                        className="mr-2"
                      />
                      <span>Marina Owner</span>
                    </label>
                  </div>
                  {errors.user_type && (
                    <p className="text-sm text-red-600">{errors.user_type.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('launch_notify')}
                      className="rounded border-gray-300 text-primary-navy focus:ring-primary-navy"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Notify me when the platform launches
                    </span>
                  </label>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    {...register('message')}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-navy focus:border-primary-navy sm:text-sm"
                    placeholder="Tell us about your marina needs or services..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary-navy text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
