import { useEffect, useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { formatDateISO } from '../../../core/utils/dates';
import type { MemberId } from '../../../core/constants/members';
import type { ExpenseCategory, Expense } from '../types';
import { FIN_MEMBER_IDS } from '../types';
import CurrencyInput from './CurrencyInput';

const FIN_MEMBERS = FAMILY_MEMBERS.filter((m) => FIN_MEMBER_IDS.includes(m.id as MemberId));

const CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'mercado', label: 'Mercado', emoji: 'shopping-cart' },
  { value: 'conta', label: 'Conta', emoji: 'page-facing-up' },
  { value: 'transporte', label: 'Transporte', emoji: 'automobile' },
  { value: 'lazer', label: 'Lazer', emoji: 'party-popper' },
  { value: 'outros', label: 'Outros', emoji: 'package' },
];

type ExpenseFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  existingExpense?: Expense;
};

function ExpenseForm({ isOpen, onClose, onSave, onDelete, existingExpense }: ExpenseFormProps) {
  const [amountCents, setAmountCents] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('mercado');
  const [paidBy, setPaidBy] = useState<MemberId[]>([]);
  const [date, setDate] = useState('');
  const [visible, setVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmountCents(existingExpense?.amount ?? 0);
      setDescription(existingExpense?.description ?? '');
      setCategory(existingExpense?.category ?? 'mercado');
      setPaidBy(existingExpense?.paidBy ?? []);
      setDate(existingExpense?.date ?? formatDateISO(new Date()));
      setConfirmDelete(false);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen, existingExpense]);

  if (!isOpen) return null;

  const isEditing = !!existingExpense;
  const canSave = amountCents > 0 && paidBy.length > 0 && description.trim().length > 0;

  function togglePayer(memberId: MemberId) {
    setPaidBy((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      description: description.trim(),
      amount: amountCents,
      category,
      paidBy,
      splitBetween: FIN_MEMBER_IDS,
      date,
    });
    handleClose();
  }

  function handleDelete() {
    if (!existingExpense || !onDelete) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(existingExpense.id);
    handleClose();
  }

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-200 md:items-center ${
        visible ? 'bg-black/40' : 'bg-black/0'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl transition-transform duration-200 md:rounded-2xl ${
          visible ? 'translate-y-0 md:scale-100' : 'translate-y-full md:translate-y-0 md:scale-95'
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text-primary">
            {isEditing ? 'Editar Gasto' : 'Novo Gasto'}
          </h2>
          <button onClick={handleClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <HugeiconsIcon icon={Cancel01Icon} size={20} color="#6B7280" />
          </button>
        </div>

        {/* Amount */}
        <div className="mb-5">
          <p className="mb-1 text-center text-xs font-semibold text-text-muted">Valor</p>
          <CurrencyInput value={amountCents} onChange={setAmountCents} autoFocus />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">Descrição</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Mercado, Netflix, Conta de luz"
            className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition-all ${
                  category === cat.value
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-100 text-text-muted hover:border-gray-200'
                }`}
              >
                <Emoji name={cat.emoji} width={14} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Paid by */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">
            Quem pagou? <span className="font-normal">(pode ser mais de um)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FIN_MEMBERS.map((member) => {
              const selected = paidBy.includes(member.id as MemberId);
              return (
                <button
                  key={member.id}
                  onClick={() => togglePayer(member.id as MemberId)}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${
                    selected ? 'shadow-sm' : 'border-gray-100 text-text-muted hover:border-gray-200'
                  }`}
                  style={selected ? { borderColor: member.color, backgroundColor: `${member.color}15`, color: member.color } : undefined}
                >
                  <Emoji name={member.emoji} width={20} />
                  {member.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full rounded-xl px-4 py-3 font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#4ECDC4' }}
          >
            Salvar
          </button>
          <button onClick={handleClose} className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-text-muted hover:bg-gray-50">
            Cancelar
          </button>
          {isEditing && onDelete && (
            <button
              onClick={handleDelete}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                confirmDelete ? 'bg-red-50 text-red-600' : 'text-red-400 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} aria-hidden="true" />
              {confirmDelete ? 'Confirmar exclusão' : 'Excluir gasto'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseForm;
