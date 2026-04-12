'use client';

import { useEffect, useRef, useState } from 'react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  user_type?: string;
}

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  const [userType, setUserType] = useState<'yacht_owner' | 'marina_owner' | ''>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserType('');
      setName('');
      setEmail('');
      setErrors({});
      setSubmitted(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
    if (!userType) newErrors.user_type = 'Please select a user type';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, user_type: userType }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ name: 'Something went wrong. Please try again.' });
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ name: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-2xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-navy-800 mb-6 text-center">
          Get Started with EasyDock
        </h2>

        {submitted ? (
          <div className="text-center py-8">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-500 text-3xl">
              <i className="fas fa-check-circle" />
            </div>
            <p className="text-xl font-bold text-navy-800 mb-2">
              You&apos;re on the list!
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              We&apos;ll email you at <strong>{email}</strong> when EasyDock launches in your area.
            </p>
            <p className="text-gray-400 text-xs">
              No spam — just your slip notification.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-400 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* User type selector */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setUserType('yacht_owner')}
                className={`flex-1 flex flex-col items-center gap-2 rounded-xl border-2 py-4 transition-colors cursor-pointer ${
                  userType === 'yacht_owner'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-ship text-2xl" />
                <span className="text-sm font-medium">Yacht Owner</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('marina_owner')}
                className={`flex-1 flex flex-col items-center gap-2 rounded-xl border-2 py-4 transition-colors cursor-pointer ${
                  userType === 'marina_owner'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-anchor text-2xl" />
                <span className="text-sm font-medium">Marina Owner</span>
              </button>
            </div>
            {errors.user_type && (
              <p className="text-red-500 text-sm mb-4 -mt-4">{errors.user_type}</p>
            )}

            {/* Name field */}
            <div className="mb-4">
              <label htmlFor="lead-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lead-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                  errors.name ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email field */}
            <div className="mb-6">
              <label htmlFor="lead-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="lead-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                  errors.email ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
