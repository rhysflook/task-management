import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const useAuth = () => {
  const { user, initialized } = useSelector((state) => state.auth);
  return { user, initialized };
};

export const GuestRoute = ({ children }) => {
  const { user, initialized } = useAuth();
  if (!initialized) return null;
  if (user) return <Navigate to="/unitMaps" replace />;
  return children;
};

export const UserRoute = ({ children }) => {
  const { user, initialized } = useAuth();
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, initialized } = useAuth();
  if (!initialized) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/unitMaps" replace />;
  return children;
};
