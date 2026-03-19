import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, RankingIcon, UserCircleIcon, GridIcon } from '@hugeicons/core-free-icons';
import { useActiveMember } from '../hooks/useActiveMember';
import { getWeekId } from '../utils/dates';
import Toast from './Toast';

type NavItem = {
  path: string;
  label: string;
  icon: typeof Home01Icon;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/home', label: 'Cardápio', icon: Home01Icon },
  { path: '/ranking', label: 'Ranking', icon: RankingIcon },
  { path: '/profile', label: 'Perfil', icon: UserCircleIcon },
  { path: '', label: 'Em breve', icon: GridIcon, disabled: true },
];

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const member = useActiveMember();

  const weekLabel = useMemo(() => {
    const weekId = getWeekId(new Date());
    return `Semana ${parseInt(weekId.split('-W')[1], 10)}`;
  }, []);

  const activeColor = member?.color ?? '#FF6B6B';

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-gray-100 bg-white lg:flex">
        {/* Sidebar logo */}
        <div className="flex items-center gap-2 px-5 pt-6 pb-4">
          <Emoji name="woman-cook" width={26} />
          <span className="font-display text-lg font-extrabold text-text-primary">
            FamilyChef
          </span>
        </div>

        {/* Sidebar nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
          {NAV_ITEMS.map((item) => {
            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-300"
                >
                  <HugeiconsIcon icon={item.icon} size={20} color="#D1D5DB" aria-hidden="true" />
                  {item.label}
                </div>
              );
            }
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
                  color={active ? activeColor : '#6B7280'}
                  aria-hidden="true"
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar member */}
        {member && (
          <button
            onClick={() => navigate('/profile')}
            className="mx-3 mb-4 flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-3 transition-colors hover:bg-gray-50"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${member.color}20` }}
            >
              <Emoji name={member.emoji} width={18} />
            </div>
            <span className="text-sm font-semibold text-text-primary">{member.name}</span>
          </button>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-56">
        {/* Header (mobile + desktop) */}
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-4">
            {/* Left: Logo (mobile only) */}
            <div className="flex items-center gap-2 lg:hidden">
              <Emoji name="woman-cook" width={24} />
              <span className="font-display text-base font-extrabold text-text-primary">
                FamilyChef
              </span>
            </div>

            {/* Center: Week label */}
            <span className="text-sm font-bold text-text-muted lg:ml-0">
              {weekLabel}
            </span>

            {/* Right: Member avatar */}
            {member && (
              <button
                onClick={() => navigate('/profile')}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: `${member.color}20` }}
                aria-label={`Perfil de ${member.name}`}
              >
                <Emoji name={member.emoji} width={20} />
              </button>
            )}
          </div>
        </header>

        {/* Toast notifications */}
        <Toast />

        {/* Page content */}
        <main className="flex-1 bg-bg-primary px-4 pb-20 pt-4 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-md">
          {NAV_ITEMS.map((item) => {
            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold text-gray-300"
                >
                  <HugeiconsIcon icon={item.icon} size={22} color="#D1D5DB" aria-hidden="true" />
                  {item.label}
                </div>
              );
            }
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
                  color={active ? activeColor : '#6B7280'}
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

export default Layout;
