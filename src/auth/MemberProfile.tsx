import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { FireIcon, Medal01Icon, Logout01Icon, ArrowLeft01Icon, Award02Icon } from '@hugeicons/core-free-icons';
import { useActiveMember } from '../core/hooks/useActiveMember';
import { useGlobalStatsStore } from '../core/store/globalStatsStore';
import type { MemberId } from '../core/constants/members';

const MODULE_CARDS = [
  { id: 'chef', name: 'FamilyChef', emoji: 'woman-cook', color: '#FF6B6B' },
  { id: 'home', name: 'FamilyHome', emoji: 'house', color: '#F9A825' },
  { id: 'fin', name: 'FamilyFin', emoji: 'money-bag', color: '#4ECDC4' },
] as const;

function MemberProfile() {
  const navigate = useNavigate();
  const member = useActiveMember();
  const getGlobalStats = useGlobalStatsStore((s) => s.getGlobalStats);
  const recalculateScore = useGlobalStatsStore((s) => s.recalculateScore);

  // Recalculate on mount
  useMemo(() => {
    if (member) {
      recalculateScore(member.id as MemberId);
    }
  }, [member, recalculateScore]);

  const gs = useMemo(() => {
    if (!member) return null;
    return getGlobalStats(member.id as MemberId);
  }, [member, getGlobalStats]);

  if (!member || !gs) return null;

  function handleSwitchProfile() {
    localStorage.removeItem('4family_active_member');
    navigate('/');
  }

  return (
    <main className="min-h-svh bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <button
            onClick={() => navigate('/select-module')}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            aria-label="Voltar"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#6B7280" />
          </button>
          <span className="font-display text-base font-extrabold text-text-primary">Perfil</span>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6 flex flex-col gap-5">
        {/* Hero */}
        <div
          className="rounded-2xl px-4 pb-6 pt-8"
          style={{
            background: `linear-gradient(180deg, ${member.color}18 0%, transparent 100%)`,
          }}
        >
          <div className="flex flex-col items-center">
            <div
              className="mb-3 flex h-24 w-24 items-center justify-center rounded-full shadow-md"
              style={{ backgroundColor: `${member.color}25` }}
            >
              <Emoji name={member.emoji} width={56} />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-text-primary">
              {member.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <HugeiconsIcon icon={Award02Icon} size={18} color={member.color} />
              <span className="text-lg font-extrabold" style={{ color: member.color }}>
                {gs.fourFamilyScore} pts
              </span>
              <span className="text-sm text-text-muted">4Family Score</span>
            </div>
          </div>
        </div>

        {/* Streak + Stats */}
        <section className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <HugeiconsIcon icon={FireIcon} size={22} color="#FF6B6B" aria-hidden="true" />
            <span className="text-xl font-extrabold text-text-primary">{gs.globalStreak}d</span>
            <span className="text-xs font-semibold text-text-muted">Streak Global</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <HugeiconsIcon icon={Medal01Icon} size={22} color={member.color} aria-hidden="true" />
            <span className="text-xl font-extrabold text-text-primary">{gs.fourFamilyScore}</span>
            <span className="text-xs font-semibold text-text-muted">Score Total</span>
          </div>
        </section>

        {/* Module points */}
        <section>
          <h2 className="mb-3 text-sm font-bold text-text-muted">Pontos por Módulo</h2>
          <div className="grid grid-cols-3 gap-3">
            {MODULE_CARDS.map((mod) => {
              const pts = gs.modulePoints[mod.id as keyof typeof gs.modulePoints];
              return (
                <div
                  key={mod.id}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <Emoji name={mod.emoji} width={28} />
                  <span className="text-lg font-extrabold text-text-primary">{pts}</span>
                  <span className="text-[11px] font-semibold" style={{ color: mod.color }}>
                    {mod.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Ranking link */}
        <button
          onClick={() => navigate('/ranking')}
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition-colors hover:bg-gray-50"
        >
          <HugeiconsIcon icon={Award02Icon} size={20} color="#1A1A1A" />
          <span className="text-sm font-bold text-text-primary">Ver Ranking Global</span>
        </button>

        {/* Switch profile */}
        <button
          onClick={handleSwitchProfile}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-gray-100"
        >
          <HugeiconsIcon icon={Logout01Icon} size={18} aria-hidden="true" />
          Trocar perfil
        </button>
      </div>
    </main>
  );
}

export default MemberProfile;
