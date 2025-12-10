import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { user, isLoading, isError } = useAuth();
  const refreshToken = localStorage.getItem('refreshToken');

  // If loading, show a spinner
  if (isLoading && refreshToken) return <div>Loading session...</div>;

  // If no user and no refresh token, redirect to login
  if ((!user && !isLoading) || isError) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;