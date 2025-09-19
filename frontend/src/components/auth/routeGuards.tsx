// components/routeGuards.tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../stores/hooks';
import { JSX } from '@emotion/react/jsx-runtime';

const useAuth = () => {
  const { user, initialized } = useAppSelector((state) => state.auth);
  return { user, initialized };
};

export const GuestRoute = ({ children }: { children: JSX.Element }) => {
  const { user, initialized } = useAuth();
  console.log('UserRoute Rendered', { user, initialized });
  if (!initialized) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

export const UserRoute = ({ children }: { children: JSX.Element }) => {
  const { user, initialized } = useAuth();
  console.log('UserRoute Rendered', { user, initialized });
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, initialized } = useAuth();
  console.log('UserRoute Rendered', { user, initialized });
  if (!initialized) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};