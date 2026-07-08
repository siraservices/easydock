import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useMarinaStore } from '../stores/marinaStore';
import VesselProfile from '../components/yacht-owner/VesselProfile';
import BookingHistory from '../components/yacht-owner/BookingHistory';
import { Link } from 'react-router-dom';

export default function YachtOwnerDashboard() {
  const { profile, signOut } = useAuthStore();
  const { fetchBookings } = useMarinaStore();

  useEffect(() => {
    if (profile?.id) {
      fetchBookings();
    }
  }, [profile, fetchBookings]);

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-navy">EasyDock</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/search"
                className="px-4 py-2 text-sm font-medium text-primary-navy hover:text-primary-dark"
              >
                Search Marinas
              </Link>
              <span className="text-gray-700">{profile.full_name || profile.user_id}</span>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yacht Owner Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your vessel profile and bookings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <VesselProfile />
          </div>
          <div>
            <BookingHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
