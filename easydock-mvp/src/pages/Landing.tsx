import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import LeadCapture from '../components/landing/LeadCapture';

export default function Landing() {
  const { profile } = useAuthStore();
  const [showLeadModal, setShowLeadModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-navy flex items-center">
                <span className="mr-2">⚓</span>
                EasyDock
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/search"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Search Marinas
              </Link>
              {profile ? (
                <Link
                  to={profile.role === 'marina_owner' ? '/marina' : '/yacht-owner'}
                  className="text-primary-navy hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Hero onGetStarted={() => setShowLeadModal(true)} />
      <HowItWorks />
      <Features />
      <LeadCapture
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
      />
    </div>
  );
}
