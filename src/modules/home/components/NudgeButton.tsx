import { useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { FAMILY_MEMBERS, type MemberId } from '../../../core/constants/members';
import { useActiveMember } from '../../../core/hooks/useActiveMember';
import { useNudgeStore } from '../store/nudgeStore';
import { useToastStore } from '../../../core/store/toastStore';
import type { TaskInstance } from '../types';

type NudgeButtonProps = {
  task: TaskInstance;
};

function NudgeButton({ task }: NudgeButtonProps) {
  const activeMember = useActiveMember();
  const sendNudge = useNudgeStore((s) => s.sendNudge);
  const canSendNudge = useNudgeStore((s) => s.canSendNudge);
  const showToast = useToastStore((s) => s.showToast);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberId | null>(task.assignedTo);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!activeMember) return null;
  if (task.done) return null;
  // Don't show nudge button for own tasks
  if (task.assignedTo === activeMember.id) return null;

  const canSend = task.assignedTo
    ? canSendNudge(task.id, activeMember.id)
    : true;

  async function handleSend() {
    if (!activeMember || !selectedMember) return;
    setSending(true);

    const success = await sendNudge(
      activeMember.id,
      selectedMember,
      task.id,
      task.name,
      message || undefined,
    );

    setSending(false);
    setShowModal(false);
    setMessage('');

    if (success) {
      const memberName = FAMILY_MEMBERS.find((m) => m.id === selectedMember)?.name ?? selectedMember;
      showToast(`Lembrete enviado para ${memberName}!`);
    } else {
      showToast('Aguarde 5 min para enviar outro lembrete');
    }
  }

  // Members that can receive a nudge (not the active member)
  const nudgeTargets = FAMILY_MEMBERS.filter((m) => m.id !== activeMember.id);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (task.assignedTo && canSend) {
            // Direct send for assigned tasks
            setSelectedMember(task.assignedTo);
            setShowModal(true);
          } else if (!task.assignedTo) {
            // Show member picker for unassigned tasks
            setShowModal(true);
          } else {
            showToast('Aguarde 5 min para enviar outro lembrete');
          }
        }}
        className={`shrink-0 rounded-lg p-1.5 transition-colors ${
          canSend
            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
            : 'text-gray-400 bg-gray-50 cursor-not-allowed'
        }`}
        aria-label="Enviar lembrete"
        title="Enviar lembrete"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
        >
          <div
            className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
            <h3 className="mb-4 text-lg font-bold text-text-primary">Enviar lembrete</h3>
            <p className="mb-3 text-sm text-text-muted">
              Tarefa: <span className="font-semibold text-text-primary">{task.name}</span>
            </p>

            {/* Member selector (for unassigned tasks or override) */}
            {!task.assignedTo && (
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold text-text-muted uppercase">
                  Para quem?
                </label>
                <div className="flex gap-2">
                  {nudgeTargets.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMember(m.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        selectedMember === m.id
                          ? 'ring-2 ring-offset-1 shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      style={selectedMember === m.id ? { backgroundColor: m.color + '20', outlineColor: m.color } : undefined}
                    >
                      <Emoji name={m.emoji} width={18} />
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional message */}
            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold text-text-muted uppercase">
                Mensagem (opcional)
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Precisa fazer antes do almoço!"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                maxLength={120}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-text-muted"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSend(); }}
                disabled={!selectedMember || sending}
                className="flex-1 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NudgeButton;
