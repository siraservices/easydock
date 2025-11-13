import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMarinaStore } from '../stores/marinaStore';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Layout } from '../components/common/Layout';
import { SlipManagement } from '../components/marina/SlipManagement';
import { AvailabilityCalendar } from '../components/marina/AvailabilityCalendar';
import { BookingApproval } from '../components/marina/BookingApproval';
import { MarinaAnalytics } from '../components/marina/MarinaAnalytics';
import { Marina } from '../types';

export const MarinaPortal = () => {
  const navigate = useNavigate();
  const { profile, initialized } = useAuthStore();
  const { marinas, currentMarina, slips, fetchMarinas, fetchSlips, setCurrentMarina } = useMarinaStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'slips' | 'availability' | 'bookings' | 'analytics'>('overview');
  const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && profile?.id && profile.role === 'marina_owner') {
      fetchMarinas(profile.id);
    }
  }, [initialized, profile, fetchMarinas]);

  useEffect(() => {
    if (marinas.length > 0 && !currentMarina) {
      setCurrentMarina(marinas[0]);
    }
  }, [marinas, currentMarina, setCurrentMarina]);

  useEffect(() => {
    if (currentMarina) {
      fetchSlips(currentMarina.id);
    }
  }, [currentMarina, fetchSlips]);

  if (!initialized) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
        </div>
      </Layout>
    );
  }

  if (marinas.length === 0) {
    return (
      <ProtectedRoute requiredRole="marina_owner">
        <Layout>
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-secondary font-bold text-primary-navy mb-4">
                Welcome to Marina Portal
              </h1>
              <p className="text-gray-600 mb-8">
                You haven't registered a marina yet. Let's get started!
              </p>
              <button
                onClick={() => navigate('/marina-portal/register')}
                className="px-6 py-3 bg-primary-navy text-white rounded-md hover:bg-opacity-90 font-medium"
              >
                Register Your Marina
              </button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="marina_owner">
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-secondary font-bold text-primary-navy mb-2">
                Marina Portal
              </h1>
              {currentMarina && (
                <p className="text-gray-600">{currentMarina.name}</p>
              )}
            </div>

            {/* Marina Selector */}
            {marinas.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Marina
                </label>
                <select
                  value={currentMarina?.id || ''}
                  onChange={(e) => {
                    const marina = marinas.find((m) => m.id === e.target.value);
                    if (marina) setCurrentMarina(marina);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-navy focus:border-primary-navy"
                >
                  {marinas.map((marina) => (
                    <option key={marina.id} value={marina.id}>
                      {marina.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'slips', label: 'Slips' },
                  { id: 'availability', label: 'Availability' },
                  { id: 'bookings', label: 'Bookings' },
                  { id: 'analytics', label: 'Analytics' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm
                      ${
                        activeTab === tab.id
                          ? 'border-primary-navy text-primary-navy'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'overview' && currentMarina && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Marina Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{currentMarina.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">
                          {currentMarina.city}, {currentMarina.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{currentMarina.address}</p>
                      </div>
                      {currentMarina.phone && (
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{currentMarina.phone}</p>
                        </div>
                      )}
                      {currentMarina.email && (
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{currentMarina.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <MarinaAnalytics marinaId={currentMarina.id} />
                </div>
              )}

              {activeTab === 'slips' && currentMarina && (
                <SlipManagement marinaId={currentMarina.id} />
              )}

              {activeTab === 'availability' && currentMarina && (
                <div className="space-y-6">
                  {selectedSlipId ? (
                    <>
                      <button
                        onClick={() => setSelectedSlipId(null)}
                        className="mb-4 text-secondary-teal hover:text-primary-navy"
                      >
                        ← Back to slip selection
                      </button>
                      <AvailabilityCalendar slipId={selectedSlipId} />
                    </>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Select a Slip</h2>
                      <p className="text-gray-600 mb-4">
                        Choose a slip to manage its availability calendar.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {slips.map((slip) => (
                          <button
                            key={slip.id}
                            onClick={() => setSelectedSlipId(slip.id)}
                            className="bg-white p-4 rounded-lg shadow hover:shadow-md text-left"
                          >
                            <p className="font-semibold">
                              Slip {slip.slip_number || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {slip.length}' × {slip.width}'
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bookings' && currentMarina && (
                <BookingApproval marinaId={currentMarina.id} />
              )}

              {activeTab === 'analytics' && currentMarina && (
                <MarinaAnalytics marinaId={currentMarina.id} />
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
