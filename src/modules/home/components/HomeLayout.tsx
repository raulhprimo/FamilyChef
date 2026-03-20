import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, TaskDaily02Icon, RepeatIcon, Clock01Icon, ArrowLeft01Icon, RankingIcon } from '@hugeicons/core-free-icons';
import { useActiveMember } from '../../../core/hooks/useActiveMember';
import { useRecurringStore } from '../store/recurringStore';
import { useTasksStore } from '../store/tasksStore';
import Toast from '../../../core/components/Toast';

type NavItem = {
  path: string;
  label: string;
  icon: typeof Home01Icon;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/home-tasks', label: 'Hoje', icon: Home01Icon },
  { path: '/home-tasks/all', label: 'Todas', icon: TaskDaily02Icon },
  { path: '/home-tasks/ranking', label: 'Ranking', icon: RankingIcon },
  { path: '/home-tasks/recurring', label: 'Recorrentes', icon: RepeatIcon },
  { path: '/home-tasks/history', label: 'Histórico', icon: Clock01Icon },
];

const ACCENT = '#F9A825';

function HomeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const member = useActiveMember();
  const recurringTasks = useRecurringStore((s) => s.recurringTasks);
  const generateFromRecurring = useTasksStore((s) => s.generateFromRecurring);

  // Generate instances on mount
  useEffect(() => {
    generateFromRecurring(recurringTasks);
  }, [recurringTasks, generateFromRecurring]);

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center gap-2 px-5 pt-6 pb-4">
          <Emoji name="house" width={26} />
          <span className="font-display text-lg font-extrabold" style={{ color: ACCENT }}>
            FamilyHome
          </span>
        </div>

        <button
          onClick={() => navigate('/select-module')}
          className="mx-3 mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-gray-50"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} aria-hidden="true" />
          Trocar módulo
        </button>

        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active ? 'bg-gray-50 text-text-primary' : 'text-text-muted hover:bg-gray-50'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={20}
                  color={active ? ACCENT : '#6B7280'}
                  aria-hidden="true"
                />
                {item.label}
              </button>
            );
          })}

        </nav>

        {member && (
          <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${member.color}20` }}
            >
              <Emoji name={member.emoji} width={18} />
            </div>
            <span className="text-sm font-semibold text-text-primary">{member.name}</span>
          </div>
        )}
      </aside>

      <div className="flex flex-1 flex-col lg:pl-56">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => navigate('/select-module')}
                className="mr-1 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                aria-label="Voltar ao seletor de módulos"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="#6B7280" />
              </button>
              <Emoji name="house" width={24} />
              <span className="font-display text-base font-extrabold" style={{ color: ACCENT }}>
                FamilyHome
              </span>
            </div>

            <span className="text-sm font-bold text-text-muted lg:ml-0">
              Tarefas de Casa
            </span>

            {member && (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: `${member.color}20` }}
              >
                <Emoji name={member.emoji} width={20} />
              </div>
            )}
          </div>
        </header>

        <Toast />

        <main className="flex-1 bg-bg-primary px-4 pb-20 pt-4 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-md">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${
                  active ? 'text-text-primary' : 'text-text-muted'
                }`}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={22}
                  color={active ? ACCENT : '#6B7280'}
                  aria-hidden="true"
                />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default HomeLayout;
