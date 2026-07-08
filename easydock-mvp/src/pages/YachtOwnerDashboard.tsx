import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Layout } from '../components/common/Layout';
import { YachtOwnerDashboard } from '../components/yacht-owner/YachtOwnerDashboard';
import { VesselProfile } from '../components/yacht-owner/VesselProfile';
import { useState } from 'react';

export const YachtOwnerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');

  return (
    <ProtectedRoute requiredRole="yacht_owner">
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-secondary font-bold text-primary-navy mb-8">
              Yacht Owner Dashboard
            </h1>

            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === 'bookings'
                        ? 'border-primary-navy text-primary-navy'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === 'profile'
                        ? 'border-primary-navy text-primary-navy'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Vessel Profile
                </button>
              </nav>
            </div>

            <div>
              {activeTab === 'bookings' && <YachtOwnerDashboard />}
              {activeTab === 'profile' && <VesselProfile />}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
