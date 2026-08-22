import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { auth } = useAuth();

  if (!auth) return <Navigate to="/login" replace />;
  if (adminOnly && auth.user.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  if (!adminOnly && auth.user.role === 'Admin') return <Navigate to="/admin" replace />;

  return children;
}
