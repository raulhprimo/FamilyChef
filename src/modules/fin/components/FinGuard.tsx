import { Navigate } from 'react-router-dom';
import { useActiveMember } from '../../../core/hooks/useActiveMember';

/**
 * Protege rotas do FamilyFin — redireciona membros excluídos (ex: crianças).
 * Usa o campo `excludeFin` do membro ao invés de lista hardcoded.
 */
function FinGuard({ children }: { children: React.ReactNode }) {
  const member = useActiveMember();

  if (member && member.excludeFin) {
    return <Navigate to="/select-module" replace />;
  }

  return <>{children}</>;
}

export default FinGuard;
