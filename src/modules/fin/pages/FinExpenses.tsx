import { useMemo, useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { formatDateISO } from '../../../core/utils/dates';
import { useToastStore } from '../../../core/store/toastStore';
import { useActiveMember } from '../../../core/hooks/useActiveMember';
import { useExpensesStore } from '../store/expensesStore';
import { useFinStatsStore } from '../store/finStatsStore';
import { formatCurrency, getCurrentMonth } from '../types';
import type { MemberId } from '../../../core/constants/members';
import type { Expense, ExpenseCategory } from '../types';
import ExpenseForm from '../components/ExpenseForm';

const CAT_EMOJI: Record<ExpenseCategory, string> = {
  mercado: 'shopping-cart', conta: 'page-facing-up', transporte: 'automobile', lazer: 'party-popper', outros: 'package',
};

function FinExpenses() {
  const member = useActiveMember();
  const expenses = useExpensesStore((s) => s.expenses);
  const addExpense = useExpensesStore((s) => s.addExpense);
  const deleteExpense = useExpensesStore((s) => s.deleteExpense);
  const addPoints = useFinStatsStore((s) => s.addPoints);
  const showToast = useToastStore((s) => s.showToast);

  const [formOpen, setFormOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Expense | undefined>(undefined);

  const todayISO = formatDateISO(new Date());
  const month = getCurrentMonth();

  const monthExpenses = useMemo(
    () => expenses
      .filter((e) => e.date.startsWith(month) && !e.isSettlement)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [expenses, month],
  );

  const grouped = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    for (const exp of monthExpenses) {
      if (!groups[exp.date]) groups[exp.date] = [];
      groups[exp.date].push(exp);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [monthExpenses]);

  function formatDayLabel(dateISO: string): string {
    if (dateISO === todayISO) return 'Hoje';
    const d = new Date(dateISO + 'T12:00:00');
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (dateISO === formatDateISO(yesterday)) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function handleSave(data: Omit<Expense, 'id' | 'createdAt'>) {
    if (editingExp) {
      useExpensesStore.getState().updateExpense(editingExp.id, data);
    } else {
      addExpense(data);
      if (member && data.date === todayISO) addPoints(member.id as MemberId, 5);
    }
    showToast(editingExp ? 'Gasto atualizado!' : 'Gasto registrado!');
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="font-display text-xl font-extrabold text-text-primary">Gastos</h1>
          <p className="mt-1 text-sm text-text-muted">{monthExpenses.length} gastos neste mês</p>
        </div>

        {grouped.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
            <Emoji name="money-with-wings" width={48} />
            <p className="text-sm text-text-muted">Nenhum gasto registrado neste mês</p>
          </div>
        ) : (
          grouped.map(([day, exps]) => (
            <section key={day}>
              <h3 className="mb-2 text-sm font-bold text-text-muted">{formatDayLabel(day)}</h3>
              <div className="flex flex-col gap-2">
                {exps.map((exp) => {
                  const payers = FAMILY_MEMBERS.filter((m) => exp.paidBy.includes(m.id as MemberId));
                  return (
                    <button
                      key={exp.id}
                      onClick={() => { setEditingExp(exp); setFormOpen(true); }}
                      className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                        <Emoji name={CAT_EMOJI[exp.category]} width={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">{exp.description}</p>
                        <div className="mt-0.5 flex items-center gap-1">
                          {payers.map((p) => <Emoji key={p.id} name={p.emoji} width={12} />)}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold" style={{ color: '#4ECDC4' }}>
                        {formatCurrency(exp.amount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      <button
        onClick={() => { setEditingExp(undefined); setFormOpen(true); }}
        className="fixed bottom-[5.5rem] right-20 z-30 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 lg:bottom-6 lg:right-20"
        style={{ backgroundColor: '#4ECDC4' }}
        aria-label="Adicionar gasto"
      >
        <HugeiconsIcon icon={Add01Icon} size={20} color="#fff" />
      </button>

      <ExpenseForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingExp(undefined); }}
        onSave={handleSave}
        onDelete={editingExp ? (id) => { deleteExpense(id); setFormOpen(false); setEditingExp(undefined); } : undefined}
        existingExpense={editingExp}
      />
    </>
  );
}

export default FinExpenses;
