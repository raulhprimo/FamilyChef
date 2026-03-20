import { useMemo, useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import type { MemberId } from '../../../core/constants/members';
import { useExpensesStore } from '../store/expensesStore';
import { useGoalsStore } from '../store/goalsStore';
import { useFinStatsStore } from '../store/finStatsStore';
import { useToastStore } from '../../../core/store/toastStore';
import { useActiveMember } from '../../../core/hooks/useActiveMember';
import { formatDateISO } from '../../../core/utils/dates';
import { formatCurrency } from '../types';
import type { Expense, ExpenseCategory } from '../types';
import ExpenseForm from '../components/ExpenseForm';

const CATEGORY_INFO: Record<ExpenseCategory, { label: string; emoji: string }> = {
  mercado: { label: 'Mercado', emoji: 'shopping-cart' },
  conta: { label: 'Contas', emoji: 'page-facing-up' },
  transporte: { label: 'Transporte', emoji: 'automobile' },
  lazer: { label: 'Lazer', emoji: 'party-popper' },
  outros: { label: 'Outros', emoji: 'package' },
};

function FinHome() {
  const member = useActiveMember();
  const [monthOffset, setMonthOffset] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  const expenses = useExpensesStore((s) => s.expenses);
  const addExpense = useExpensesStore((s) => s.addExpense);
  const addPoints = useFinStatsStore((s) => s.addPoints);
  const showToast = useToastStore((s) => s.showToast);
  const goals = useGoalsStore((s) => s.goals);

  const month = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [monthOffset]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-');
    const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${names[Number(m) - 1]} ${y}`;
  }, [month]);

  const summary = useMemo(
    () => useExpensesStore.getState().getMonthSummary(month),
    [expenses, month],
  );
  const expenseCount = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month) && !e.isSettlement).length,
    [expenses, month],
  );

  const categoryBars = useMemo(() => {
    const entries = Object.entries(summary.byCategory)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a);
    const max = entries[0]?.[1] ?? 1;
    return entries.map(([cat, amount]) => ({
      category: cat as ExpenseCategory,
      amount,
      percent: Math.round((amount / max) * 100),
      ofTotal: summary.totalExpenses > 0 ? Math.round((amount / summary.totalExpenses) * 100) : 0,
    }));
  }, [summary]);

  const activeGoals = useMemo(() => {
    const active = goals.filter((g) => !g.completed).slice(0, 2);
    return active.map((g) => ({
      ...g,
      progress: useGoalsStore.getState().getGoalProgress(g.id),
    }));
  }, [goals]);

  function handleSave(data: Omit<Expense, 'id' | 'createdAt'>) {
    addExpense(data);
    if (member && data.date === formatDateISO(new Date())) {
      addPoints(member.id as MemberId, 5);
    }
    showToast('Gasto registrado!');
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Month nav */}
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <button onClick={() => setMonthOffset((o) => o - 1)} className="rounded-lg p-2 hover:bg-gray-100">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </button>
          <div className="text-center">
            <span className="font-display text-base font-bold text-text-primary">{monthLabel}</span>
            <p className="text-xs text-text-muted">{expenseCount} gastos</p>
          </div>
          <button onClick={() => setMonthOffset((o) => o + 1)} className="rounded-lg p-2 hover:bg-gray-100">
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
          </button>
        </div>

        {/* Total */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-semibold text-text-muted">Total gasto</p>
          <p className="font-display text-3xl font-extrabold" style={{ color: '#4ECDC4' }}>
            {formatCurrency(summary.totalExpenses)}
          </p>
        </div>

        {/* Debts card */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-text-muted">Acerto de contas</h2>
          {summary.debts.length === 0 ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <Emoji name="check-mark-button" width={16} />
              Tudo certo! Nenhuma dívida pendente
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {summary.debts.map((debt, i) => {
                const from = FAMILY_MEMBERS.find((m) => m.id === debt.from);
                const to = FAMILY_MEMBERS.find((m) => m.id === debt.to);
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {from && <Emoji name={from.emoji} width={16} />}
                    <span className="font-semibold" style={{ color: from?.color }}>{from?.name}</span>
                    <span className="text-text-muted">→</span>
                    {to && <Emoji name={to.emoji} width={16} />}
                    <span className="font-semibold" style={{ color: to?.color }}>{to?.name}</span>
                    <span className="ml-auto font-bold text-text-primary">{formatCurrency(debt.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Goals preview */}
        {activeGoals.length > 0 && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-text-muted">Metas</h2>
            <div className="flex flex-col gap-3">
              {activeGoals.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-text-primary">{goal.name}</span>
                      <span className="text-xs text-text-muted">{goal.progress.percent}%</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${goal.progress.percent}%`, backgroundColor: goal.color }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-text-muted">
                      {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
              ))}
            </div>
          </section>
        )}

        {/* Category breakdown */}
        {categoryBars.length > 0 && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-text-muted">Por categoria</h2>
            <div className="flex flex-col gap-3">
              {categoryBars.map(({ category: cat, amount, percent, ofTotal }) => {
                const info = CATEGORY_INFO[cat];
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                        <Emoji name={info.emoji} width={14} />
                        {info.label}
                      </span>
                      <span className="text-xs text-text-muted">{ofTotal}%</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-text-primary">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 lg:bottom-6"
        style={{ backgroundColor: '#4ECDC4' }}
        aria-label="Adicionar gasto"
      >
        <HugeiconsIcon icon={Add01Icon} size={24} color="#fff" />
      </button>

      <ExpenseForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} />
    </>
  );
}

export default FinHome;
