import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { FireIcon, Medal01Icon, Logout01Icon, LockIcon } from '@hugeicons/core-free-icons';
import { useStatsStore } from '../store/statsStore';
import { useMealsStore } from '../store/mealsStore';
import { useActiveMember } from '../../../core/hooks/useActiveMember';
import { useFamilyStore } from '../../../core/store/familyStore';
import { ALL_BADGES } from '../../../core/constants/badges';
import { getStreakMessage } from '../../../core/utils/points';

const BADGE_DESCRIPTIONS: Record<string, string> = {
  chef_da_semana: 'Maior pontuação da semana',
  streak_3: 'Cozinhou 3 dias seguidos',
  streak_7: 'Cozinhou a semana inteira',
  primeiro_prato: 'Preparou o primeiro prato',
  mes_completo: 'Cozinhou todos os dias do mês',
};

// --- Sub-components ---

type StatCardProps = {
  icon: typeof FireIcon;
  iconColor: string;
  label: string;
  value: string | number;
};

function StatCard({ icon, iconColor, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <HugeiconsIcon icon={icon} size={22} color={iconColor} aria-hidden="true" />
      <span className="text-xl font-extrabold text-text-primary">{value}</span>
      <span className="text-xs font-semibold text-text-muted">{label}</span>
    </div>
  );
}

type BadgeChipProps = {
  emoji: string;
  label: string;
  description: string;
  unlocked: boolean;
};

function BadgeChip({ emoji, label, description, unlocked }: BadgeChipProps) {
  return (
    <div className="group relative">
      <div
        className={`flex flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 text-center transition-transform hover:scale-105 ${
          unlocked
            ? 'border-gray-100 bg-white shadow-sm'
            : 'border-gray-100 bg-gray-50'
        }`}
      >
        {unlocked ? (
          <Emoji name={emoji} width={28} />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center opacity-40">
            <HugeiconsIcon icon={LockIcon} size={22} color="#9CA3AF" aria-hidden="true" />
          </div>
        )}
        <span
          className={`text-xs font-semibold ${
            unlocked ? 'text-text-primary' : 'text-gray-400'
          }`}
        >
          {label}
        </span>
      </div>
      <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-text-primary px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {description}
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-text-primary" />
      </div>
    </div>
  );
}

// --- Main page ---

function ChefProfile() {
  const navigate = useNavigate();
  const member = useActiveMember();
  const stats = useStatsStore((s) => s.stats);
  const meals = useMealsStore((s) => s.meals);

  const memberStats = useMemo(() => {
    if (!member) return null;
    return stats[member.id] ?? null;
  }, [stats, member]);

  const firstMealDate = useMemo(() => {
    if (!member) return null;
    const memberMeals = meals
      .filter((m) => m.responsibleIds.includes(member.id) && m.done && m.doneAt)
      .sort((a, b) => (a.doneAt! > b.doneAt! ? 1 : -1));
    if (memberMeals.length === 0) return null;
    return new Date(memberMeals[0].doneAt!);
  }, [meals, member]);

  if (!member) return null;

  const totalPoints = memberStats?.totalPoints ?? 0;
  const currentStreak = memberStats?.currentStreak ?? 0;
  const longestStreak = memberStats?.longestStreak ?? 0;
  const memberBadges = memberStats?.badges ?? [];
  const streakMsg = getStreakMessage(currentStreak);

  const sinceLabel = firstMealDate
    ? firstMealDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    : 'hoje';

  function handleSwitchProfile() {
    useFamilyStore.getState().clearSession();
    navigate('/login');
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Hero with gradient */}
      <div
        className="-mx-4 -mt-4 px-4 pb-6 pt-8"
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
          <p className="mt-0.5 text-sm text-text-muted">Chef desde {sinceLabel}</p>
        </div>
      </div>

      {/* Stats grid */}
      <section className="grid grid-cols-3 gap-3">
        <StatCard icon={Medal01Icon} iconColor={member.color} label="Pontos" value={totalPoints} />
        <StatCard icon={FireIcon} iconColor="#FF6B6B" label="Streak" value={`${currentStreak}d`} />
        <StatCard icon={Medal01Icon} iconColor="#F59E0B" label="Recorde" value={`${longestStreak}d`} />
      </section>

      {/* Streak message */}
      {currentStreak > 0 && (
        <div
          className="rounded-2xl border px-4 py-3 text-center text-sm font-semibold"
          style={{
            borderColor: `${member.color}40`,
            backgroundColor: `${member.color}08`,
            color: member.color,
          }}
        >
          <Emoji name="fire" width={16} /> {streakMsg}
        </div>
      )}

      {/* Badges */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-text-muted">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {ALL_BADGES.map((badge) => (
            <BadgeChip
              key={badge.id}
              emoji={badge.emoji}
              label={badge.label}
              description={BADGE_DESCRIPTIONS[badge.id] ?? badge.label}
              unlocked={memberBadges.includes(badge.id)}
            />
          ))}
        </div>
      </section>

      {/* Switch profile */}
      <button
        onClick={handleSwitchProfile}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-gray-100"
      >
        <HugeiconsIcon icon={Logout01Icon} size={18} aria-hidden="true" />
        Trocar perfil
      </button>
    </div>
  );
}

export default ChefProfile;
