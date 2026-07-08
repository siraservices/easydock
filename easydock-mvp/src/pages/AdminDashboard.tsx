import { useState } from 'react';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Layout } from '../components/common/Layout';
import { UserManagement } from '../components/admin/UserManagement';
import { PlatformMetrics } from '../components/admin/PlatformMetrics';
import { LeadManagement } from '../components/admin/LeadManagement';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'leads'>('metrics');

  return (
    <ProtectedRoute requiredRole="admin">
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-secondary font-bold text-primary-navy mb-8">
              Admin Dashboard
            </h1>

            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === 'metrics'
                        ? 'border-primary-navy text-primary-navy'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Platform Metrics
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === 'users'
                        ? 'border-primary-navy text-primary-navy'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  User Management
                </button>
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === 'leads'
                        ? 'border-primary-navy text-primary-navy'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  Lead Management
                </button>
              </nav>
            </div>

            <div>
              {activeTab === 'metrics' && <PlatformMetrics />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'leads' && <LeadManagement />}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
