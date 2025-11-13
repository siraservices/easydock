import { useEffect, useState } from 'react';
import { useSearchStore } from '../stores/searchStore';
import { useAuthStore } from '../stores/authStore';
import SlipSearch from '../components/yacht-owner/SlipSearch';
import BookingFlow from '../components/yacht-owner/BookingFlow';
import { Link } from 'react-router-dom';

export default function SearchResults() {
  const { results, search, loading } = useSearchStore();
  const { profile } = useAuthStore();
  const [selectedSlip, setSelectedSlip] = useState<{
    slip: any;
    marina: any;
    startDate: string;
    endDate: string;
  } | null>(null);

  useEffect(() => {
    if (results.length === 0) {
      search();
    }
  }, [results, search]);

  const handleBook = (slip: any, marina: any) => {
    if (!profile) {
      alert('Please log in to make a booking');
      return;
    }
    // For now, use default dates - in a real app, these would come from the search filters
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setSelectedSlip({ slip, marina, startDate, endDate });
  };

  if (selectedSlip) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedSlip(null)}
            className="mb-4 text-primary-navy hover:text-primary-dark"
          >
            ← Back to Results
          </button>
          <BookingFlow
            slip={selectedSlip.slip}
            marina={selectedSlip.marina}
            startDate={selectedSlip.startDate}
            endDate={selectedSlip.endDate}
            onComplete={() => {
              setSelectedSlip(null);
              alert('Booking request submitted! The marina will review and approve your request.');
            }}
            onCancel={() => setSelectedSlip(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-navy">
                EasyDock
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {profile ? (
                <>
                  <Link
                    to={profile.role === 'yacht_owner' ? '/yacht-owner' : '/marina'}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <span className="text-gray-700">{profile.full_name || profile.user_id}</span>
                </>
              ) : (
                <Link to="/login" className="text-primary-navy hover:text-primary-dark">
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SlipSearch />

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Results</h2>
          {loading ? (
            <div className="text-center py-12">Searching...</div>
          ) : results.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No results found. Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {results.map((result, index) => (
                <div key={index} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{result.marina.name}</h3>
                      <p className="text-gray-600 mt-1">
                        {result.marina.address}, {result.marina.city}, {result.marina.state}
                      </p>
                      <div className="mt-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Slip {result.slip.slip_number}:</span>{' '}
                          {result.slip.length}' × {result.slip.width}'
                          {result.slip.draft && ` (${result.slip.draft}' draft)`}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          {result.slip.power_available && (
                            <span className="flex items-center">
                              <span className="mr-1">⚡</span> Power
                            </span>
                          )}
                          {result.slip.water_available && (
                            <span className="flex items-center">
                              <span className="mr-1">💧</span> Water
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          ${result.slip.daily_rate.toFixed(2)}/day
                        </p>
                      </div>
                    </div>
                    <div className="ml-6">
                      {result.available ? (
                        <button
                          onClick={() => handleBook(result.slip, result.marina)}
                          className="px-6 py-2 bg-primary-navy text-white rounded-md hover:bg-primary-dark"
                        >
                          Book Now
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
                          Not Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
