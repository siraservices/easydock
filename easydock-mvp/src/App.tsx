import { useEffect, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MarinaPortal } from './pages/MarinaPortal';
import { MarinaRegistration } from './components/marina/MarinaRegistration';
import { YachtOwnerDashboardPage } from './pages/YachtOwnerDashboard';
import { SearchResults } from './pages/SearchResults';
import { BookingFlow } from './components/yacht-owner/BookingFlow';
import { AdminDashboard } from './pages/AdminDashboard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const AppContent = memo(() => {
  const { initialize, initialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/book/:slipId" element={<BookingFlow />} />
      <Route path="/marina-portal" element={<MarinaPortal />} />
      <Route path="/marina-portal/register" element={<MarinaRegistration />} />
      <Route path="/yacht-dashboard" element={<YachtOwnerDashboardPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
});

AppContent.displayName = 'AppContent';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
