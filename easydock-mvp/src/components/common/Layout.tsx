import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <i className="fas fa-anchor text-secondary-teal text-2xl"></i>
              <span className="font-secondary font-bold text-xl text-primary-navy">EasyDock</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {profile?.role === 'marina_owner' && (
                    <Link
                      to="/marina-portal"
                      className="text-gray-700 hover:text-primary-navy px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Marina Portal
                    </Link>
                  )}
                  {profile?.role === 'yacht_owner' && (
                    <Link
                      to="/yacht-dashboard"
                      className="text-gray-700 hover:text-primary-navy px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-primary-navy px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="bg-primary-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-navy px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      
      <main>{children}</main>
      
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-secondary font-bold text-white mb-4">EasyDock</h3>
              <p className="text-sm">Professional marina booking platform connecting yacht owners with premium docking spaces.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/search" className="hover:text-white">Marina Booking</Link></li>
                <li><Link to="/marina-portal" className="hover:text-white">Marina Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 EasyDock. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
