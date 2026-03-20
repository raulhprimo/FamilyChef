import { Navigate } from 'react-router-dom';
import { useActiveMember } from '../../../core/hooks/useActiveMember';
import { FIN_MEMBER_IDS } from '../types';
import type { MemberId } from '../../../core/constants/members';

/**
 * Protege rotas do FamilyFin — redireciona membros não participantes.
 */
function FinGuard({ children }: { children: React.ReactNode }) {
  const member = useActiveMember();

  if (member && !FIN_MEMBER_IDS.includes(member.id as MemberId)) {
    return <Navigate to="/select-module" replace />;
  }

  return <>{children}</>;
}

export default FinGuard;
