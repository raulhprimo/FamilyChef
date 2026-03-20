import { useMemo, useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import type { MemberId } from '../../../core/constants/members';
import { useExpensesStore } from '../store/expensesStore';
import { useFinStatsStore } from '../store/finStatsStore';
import { useToastStore } from '../../../core/store/toastStore';
import { formatCurrency, FIN_MEMBER_IDS } from '../types';
import { formatDateISO } from '../../../core/utils/dates';

const FIN_MEMBERS = FAMILY_MEMBERS.filter((m) => FIN_MEMBER_IDS.includes(m.id as MemberId));

function FinDebts() {
  const [monthOffset, setMonthOffset] = useState(0);
  const expenses = useExpensesStore((s) => s.expenses);
  const addExpense = useExpensesStore((s) => s.addExpense);
  const addPoints = useFinStatsStore((s) => s.addPoints);
  const addBadge = useFinStatsStore((s) => s.addBadge);
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

  const debts = useMemo(
    () => useExpensesStore.getState().calculateDebts(month),
    [expenses, month],
  );

  // Net balance per member
  const balances = useMemo(() => {
    const bal: Record<string, number> = {};
    for (const id of FIN_MEMBER_IDS) bal[id] = 0;
    for (const d of debts) {
      bal[d.from] = (bal[d.from] ?? 0) - d.amount;
      bal[d.to] = (bal[d.to] ?? 0) + d.amount;
    }
    return bal;
  }, [debts]);

  function handleSettle(from: MemberId, to: MemberId, amount: number) {
    addExpense({
      description: `Acerto: ${FAMILY_MEMBERS.find((m) => m.id === from)?.name} → ${FAMILY_MEMBERS.find((m) => m.id === to)?.name}`,
      amount,
      category: 'outros',
      paidBy: [from],
      splitBetween: [to],
      date: formatDateISO(new Date()),
      isSettlement: true,
    });
    addPoints(from, 10);
    // Check if all debts cleared
    const remaining = useExpensesStore.getState().calculateDebts(month);
    if (remaining.length === 0) {
      for (const id of FIN_MEMBER_IDS) addBadge(id, 'sem_dividas');
    }
    showToast('Dívida liquidada! +10 pts');
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-extrabold text-text-primary">Acerto de Contas</h1>
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

      {/* Balances */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-text-muted">Saldo do mês</h2>
        <div className="flex flex-col gap-3">
          {FIN_MEMBERS.map((member) => {
            const bal = balances[member.id] ?? 0;
            return (
              <div key={member.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${member.color}20` }}>
                  <Emoji name={member.emoji} width={24} />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-text-primary">{member.name}</span>
                  <p className={`text-xs font-semibold ${bal > 0 ? 'text-green-600' : bal < 0 ? 'text-red-500' : 'text-text-muted'}`}>
                    {bal > 0 ? `Tem a receber ${formatCurrency(bal)}` : bal < 0 ? `Deve ${formatCurrency(-bal)}` : 'Quitado'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transfers */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-text-muted">Transferências necessárias</h2>
        {debts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
            <Emoji name="check-mark-button" width={16} />
            Nenhuma dívida pendente!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {debts.map((debt, i) => {
              const from = FAMILY_MEMBERS.find((m) => m.id === debt.from);
              const to = FAMILY_MEMBERS.find((m) => m.id === debt.to);
              return (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center gap-2 flex-1">
                    {from && <Emoji name={from.emoji} width={20} />}
                    <span className="text-xs text-text-muted">→</span>
                    {to && <Emoji name={to.emoji} width={20} />}
                    <span className="text-sm font-bold text-text-primary">{formatCurrency(debt.amount)}</span>
                  </div>
                  <button
                    onClick={() => handleSettle(debt.from, debt.to, debt.amount)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: '#4ECDC4' }}
                  >
                    Liquidar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default FinDebts;
