import { useMemo, useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { useExpensesStore } from '../store/expensesStore';
import { useBudgetStore } from '../store/budgetStore';
import { useToastStore } from '../../../core/store/toastStore';
import { formatCurrency } from '../types';
import type { ExpenseCategory } from '../types';
import CurrencyInput from '../components/CurrencyInput';

const ALL_CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'mercado', label: 'Mercado', emoji: 'shopping-cart' },
  { value: 'conta', label: 'Contas', emoji: 'page-facing-up' },
  { value: 'transporte', label: 'Transporte', emoji: 'automobile' },
  { value: 'lazer', label: 'Lazer', emoji: 'party-popper' },
  { value: 'outros', label: 'Outros', emoji: 'package' },
];

const STATUS_COLORS = { ok: '#22C55E', warning: '#F59E0B', over: '#EF4444' };

function FinBudget() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [editCat, setEditCat] = useState<ExpenseCategory | null>(null);
  const [editLimit, setEditLimit] = useState(0);

  const expenses = useExpensesStore((s) => s.expenses);
  const setBudget = useBudgetStore((s) => s.setBudget);
  const budgetList = useBudgetStore((s) => s.budgets);
  const showToast = useToastStore((s) => s.showToast);

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
  const statuses = useMemo(
    () => useBudgetStore.getState().getBudgetStatus(month, summary.byCategory),
    [budgetList, month, summary],
  );

  const categoriesWithBudget = statuses.map((s) => s.category);
  const categoriesWithout = ALL_CATEGORIES.filter((c) => !categoriesWithBudget.includes(c.value));

  const hasWarning = statuses.some((s) => s.status === 'warning');
  const hasOver = statuses.some((s) => s.status === 'over');

  function handleSaveBudget() {
    if (!editCat || editLimit <= 0) return;
    setBudget(editCat, editLimit, month);
    setEditCat(null);
    setEditLimit(0);
    showToast('Orçamento definido!');
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-extrabold text-text-primary">Orçamento</h1>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
        <button onClick={() => setMonthOffset((o) => o - 1)} className="rounded-lg p-2 hover:bg-gray-100">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
        </button>
        <span className="font-display text-base font-bold text-text-primary">{monthLabel}</span>
        <button onClick={() => setMonthOffset((o) => o + 1)} className="rounded-lg p-2 hover:bg-gray-100">
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
        </button>
      </div>

      {/* Alerts */}
      {hasOver && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          Orçamento estourado em alguma categoria!
        </div>
      )}
      {hasWarning && !hasOver && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700">
          Atenção: algumas categorias estão acima de 80%
        </div>
      )}

      {/* Categories with budget */}
      {statuses.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-text-muted">Categorias com limite</h2>
          <div className="flex flex-col gap-4">
            {statuses.map((s) => {
              const cat = ALL_CATEGORIES.find((c) => c.value === s.category)!;
              return (
                <div key={s.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                      <Emoji name={cat.emoji} width={14} />
                      {cat.label}
                    </span>
                    <span className="text-xs font-bold" style={{ color: STATUS_COLORS[s.status] }}>
                      {s.percent}%
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(s.percent, 100)}%`, backgroundColor: STATUS_COLORS[s.status] }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {formatCurrency(s.spent)} de {formatCurrency(s.limit)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories without budget */}
      {categoriesWithout.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-text-muted">Sem limite definido</h2>
          <div className="flex flex-col gap-2">
            {categoriesWithout.map((cat) => (
              <div key={cat.value} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Emoji name={cat.emoji} width={14} />
                  {cat.label}
                  {(summary.byCategory[cat.value] ?? 0) > 0 && (
                    <span className="text-xs">({formatCurrency(summary.byCategory[cat.value])} gasto)</span>
                  )}
                </span>
                <button
                  onClick={() => { setEditCat(cat.value); setEditLimit(0); }}
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  Definir limite
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit budget modal */}
      {editCat && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center" onClick={(e) => e.target === e.currentTarget && setEditCat(null)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl md:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-text-primary">
                Limite: {ALL_CATEGORIES.find((c) => c.value === editCat)?.label}
              </h2>
              <button onClick={() => setEditCat(null)} className="rounded-lg p-1.5 hover:bg-gray-100">
                <HugeiconsIcon icon={Cancel01Icon} size={20} color="#6B7280" />
              </button>
            </div>
            <div className="mb-4">
              <CurrencyInput value={editLimit} onChange={setEditLimit} autoFocus placeholder="Ex: 800,00" />
            </div>
            <button onClick={handleSaveBudget} disabled={editLimit <= 0}
              className="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-40" style={{ backgroundColor: '#4ECDC4' }}>
              Salvar
            </button>
            <button onClick={() => setEditCat(null)} className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-text-muted hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinBudget;
