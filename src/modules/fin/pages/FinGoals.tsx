import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import type { MemberId } from '../../../core/constants/members';
import { useGoalsStore } from '../store/goalsStore';
import { useFinStatsStore } from '../store/finStatsStore';
import { useToastStore } from '../../../core/store/toastStore';
import { useActiveMember } from '../../../core/hooks/useActiveMember';
import { formatCurrency } from '../types';
import CurrencyInput from '../components/CurrencyInput';

const GOAL_COLORS = ['#FF6B6B', '#4ECDC4', '#F9A825', '#7C83FD', '#FF6B9D', '#22C55E'];

function FinGoals() {
  const member = useActiveMember();
  const goals = useGoalsStore((s) => s.goals);
  const addGoal = useGoalsStore((s) => s.addGoal);
  const addContribution = useGoalsStore((s) => s.addContribution);
  const getGoalProgress = useGoalsStore((s) => s.getGoalProgress);
  const addPoints = useFinStatsStore((s) => s.addPoints);
  const addBadge = useFinStatsStore((s) => s.addBadge);
  const showToast = useToastStore((s) => s.showToast);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState(0);
  const [newDeadline, setNewDeadline] = useState('');
  const [newColor, setNewColor] = useState(GOAL_COLORS[0]);

  const [contribGoalId, setContribGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState(0);

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  function handleCreateGoal() {
    if (!newName.trim() || newTarget <= 0 || !newDeadline) return;
    addGoal({ name: newName.trim(), targetAmount: newTarget, deadline: newDeadline, color: newColor });
    setShowNewForm(false);
    setNewName('');
    setNewTarget(0);
    setNewDeadline('');
    showToast('Meta criada!');
  }

  function handleContribute(goalId: string) {
    if (!member || contribAmount <= 0) return;
    const completed = addContribution(goalId, member.id as MemberId, contribAmount);
    addPoints(member.id as MemberId, 20);
    if (completed) {
      addBadge(member.id as MemberId, 'meta_atingida');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#4ECDC4', '#FFE66D', '#FF6B6B'] });
      showToast('Meta atingida! Parabéns!');
    } else {
      showToast('Contribuição registrada! +20 pts');
    }
    setContribGoalId(null);
    setContribAmount(0);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-extrabold text-text-primary">Metas</h1>
          <p className="mt-1 text-sm text-text-muted">Economize em família</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: '#4ECDC4' }}
        >
          <HugeiconsIcon icon={Add01Icon} size={16} color="#fff" />
          Nova
        </button>
      </div>

      {/* Active goals */}
      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
          <Emoji name="direct-hit" width={48} />
          <p className="text-sm text-text-muted">Nenhuma meta criada ainda</p>
        </div>
      )}

      {activeGoals.map((goal) => {
        const progress = getGoalProgress(goal.id);
        return (
          <div key={goal.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">{goal.name}</span>
              <span className="text-xs font-semibold" style={{ color: progress.daysLeft < 7 ? '#EF4444' : '#6B7280' }}>
                {progress.daysLeft}d restantes
              </span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-gray-100">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress.percent}%`, backgroundColor: goal.color }} />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-text-muted">
              <span>{formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}</span>
              <span>{progress.percent}%</span>
            </div>
            {/* Contributors */}
            {goal.contributions.length > 0 && (
              <div className="mt-2 flex items-center gap-1">
                {[...new Set(goal.contributions.map((c) => c.memberId))].map((mid) => {
                  const m = FAMILY_MEMBERS.find((f) => f.id === mid);
                  return m ? <Emoji key={mid} name={m.emoji} width={14} /> : null;
                })}
              </div>
            )}
            {/* Contribute */}
            {contribGoalId === goal.id ? (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={contribAmount === 0 ? '' : (contribAmount / 100).toFixed(2).replace('.', ',')}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value.replace(',', '.'));
                    setContribAmount(isNaN(val) ? 0 : Math.round(val * 100));
                  }}
                  placeholder="Ex: 50,00"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                />
                <button onClick={() => handleContribute(goal.id)} className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: '#4ECDC4' }}>
                  OK
                </button>
                <button onClick={() => setContribGoalId(null)} className="rounded-lg p-2 hover:bg-gray-100">
                  <HugeiconsIcon icon={Cancel01Icon} size={16} color="#6B7280" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setContribGoalId(goal.id)}
                className="mt-3 w-full rounded-lg border border-teal-200 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50"
              >
                Contribuir
              </button>
            )}
          </div>
        );
      })}

      {/* Completed */}
      {completedGoals.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-text-muted">Metas concluídas</h2>
          <div className="flex flex-col gap-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50/30 p-3 shadow-sm">
                <Emoji name="trophy" width={20} />
                <span className="flex-1 text-sm font-semibold text-text-primary">{goal.name}</span>
                <span className="text-xs font-semibold text-green-600">{formatCurrency(goal.targetAmount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New goal form modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center" onClick={(e) => e.target === e.currentTarget && setShowNewForm(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl md:rounded-2xl">
            <h2 className="mb-4 font-display text-lg font-bold text-text-primary">Nova Meta</h2>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-text-muted">Nome</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Viagem de férias"
                className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-sm outline-none focus:border-teal-500" />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-text-muted">Valor alvo</label>
              <CurrencyInput value={newTarget} onChange={setNewTarget} placeholder="Ex: 5000,00" />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-text-muted">Prazo</label>
              <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-sm outline-none focus:border-teal-500" />
            </div>
            <div className="mb-5">
              <label className="mb-1 block text-sm font-semibold text-text-muted">Cor</label>
              <div className="flex gap-2">
                {GOAL_COLORS.map((c) => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className={`h-8 w-8 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-offset-2' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button onClick={handleCreateGoal} disabled={!newName.trim() || newTarget <= 0 || !newDeadline}
              className="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-40" style={{ backgroundColor: '#4ECDC4' }}>
              Criar Meta
            </button>
            <button onClick={() => setShowNewForm(false)} className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-text-muted hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinGoals;
