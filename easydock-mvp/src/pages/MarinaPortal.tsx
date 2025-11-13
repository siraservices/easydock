import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useMarinaStore } from '../stores/marinaStore';
import MarinaRegistration from '../components/marina/MarinaRegistration';
import MarinaDashboard from '../components/marina/MarinaDashboard';

export default function MarinaPortal() {
  const { profile, signOut } = useAuthStore();
  const { marinas, fetchMarinas, currentMarina, fetchMarina } = useMarinaStore();
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchMarinas(profile.id);
    }
  }, [profile, fetchMarinas]);

  useEffect(() => {
    if (marinas.length > 0 && !currentMarina) {
      fetchMarina(marinas[0].id);
    }
  }, [marinas, currentMarina, fetchMarina]);

  if (!profile) {
    return null;
  }

  // Show registration if no marinas exist
  if (marinas.length === 0 || showRegistration) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-primary-navy">EasyDock</h1>
              </div>
              <div className="flex items-center space-x-4">
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
        <MarinaRegistration
          onComplete={() => {
            setShowRegistration(false);
            if (profile.id) {
              fetchMarinas(profile.id);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-navy">EasyDock Marina Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRegistration(true)}
                className="px-4 py-2 text-sm font-medium text-primary-navy hover:text-primary-dark"
              >
                Add Marina
              </button>
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
      {currentMarina && <MarinaDashboard marina={currentMarina} />}
    </div>
  );
}
