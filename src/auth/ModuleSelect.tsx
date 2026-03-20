import { useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserCircleIcon, Award02Icon } from '@hugeicons/core-free-icons';
import { MODULES } from '../core/constants/modules';
import { setActiveModule } from '../core/hooks/useActiveModule';
import { useActiveMember } from '../core/hooks/useActiveMember';
import { FIN_MEMBER_IDS } from '../modules/fin/types';
import type { ModuleId } from '../core/constants/modules';
import type { MemberId } from '../core/constants/members';

function ModuleSelect() {
  const navigate = useNavigate();
  const member = useActiveMember();

  // Leticia não participa do Fin
  const visibleModules = MODULES.filter((mod) => {
    if (mod.id === 'fin' && member && !FIN_MEMBER_IDS.includes(member.id as MemberId)) {
      return false;
    }
    return true;
  });

  function handleSelect(moduleId: ModuleId, route: string) {
    setActiveModule(moduleId);
    navigate(route);
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-bg-primary px-4 py-12">
      <div className="mb-2">
        <Emoji name="family" width={48} aria-hidden="true" />
      </div>
      <h1 className="mb-1 font-display text-2xl font-extrabold text-text-primary">
        4Family
      </h1>
      {member && (
        <p className="mb-8 text-sm text-text-muted">
          Olá, {member.name}! O que vamos fazer?
        </p>
      )}

      <div className="flex w-full max-w-sm flex-col gap-4">
        {/* Quick links */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white py-3 text-sm font-semibold text-text-muted shadow-sm transition-colors hover:bg-gray-50"
          >
            <HugeiconsIcon icon={UserCircleIcon} size={18} color="#6B7280" />
            Perfil
          </button>
          <button
            onClick={() => navigate('/ranking')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white py-3 text-sm font-semibold text-text-muted shadow-sm transition-colors hover:bg-gray-50"
          >
            <HugeiconsIcon icon={Award02Icon} size={18} color="#6B7280" />
            Ranking
          </button>
        </div>

        {visibleModules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => mod.enabled && handleSelect(mod.id as ModuleId, mod.route)}
            disabled={!mod.enabled}
            className={`flex items-center gap-4 rounded-2xl border bg-bg-card p-5 shadow-sm transition-transform duration-150 ${
              mod.enabled
                ? 'border-gray-100 hover:scale-[1.03] active:scale-[0.98]'
                : 'border-gray-100 opacity-50 cursor-not-allowed'
            }`}
            aria-label={mod.enabled ? `Abrir ${mod.name}` : `${mod.name} — Em breve`}
          >
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${mod.color}20` }}
            >
              <Emoji name={mod.emoji} width={32} />
            </span>
            <div className="flex flex-col items-start">
              <span
                className="text-lg font-bold"
                style={{ color: mod.enabled ? mod.color : '#9CA3AF' }}
              >
                {mod.name}
              </span>
              <span className="text-sm text-text-muted">
                {mod.enabled ? mod.description : 'Em breve'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}

export default ModuleSelect;
