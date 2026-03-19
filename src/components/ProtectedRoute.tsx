import { Navigate } from 'react-router-dom';
import { useActiveMember } from '../hooks/useActiveMember';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const member = useActiveMember();

  if (!member) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
