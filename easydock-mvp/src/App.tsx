import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MarinaPortal from './pages/MarinaPortal';
import YachtOwnerDashboard from './pages/YachtOwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SearchResults from './pages/SearchResults';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { initialize, initialized, loading } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/marina"
          element={
            <ProtectedRoute allowedRoles={['marina_owner']}>
              <MarinaPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/yacht-owner"
          element={
            <ProtectedRoute allowedRoles={['yacht_owner']}>
              <YachtOwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/search" element={<SearchResults />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
