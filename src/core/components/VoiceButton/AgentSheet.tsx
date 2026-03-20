import { useState, useEffect, useMemo } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mic01Icon, Cancel01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { useVoiceAgentStore, buildConfirmationItems } from '../../store/voiceAgentStore';
import { useToastStore } from '../../store/toastStore';
import { useActiveMember } from '../../hooks/useActiveMember';
import { formatDateISO } from '../../utils/dates';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { processVoiceCommand } from '../../services/voiceService';
import { executeVoiceAction } from '../../services/voiceActionExecutor';
import { AGENTS, getAgentById } from './constants';
import ConfirmationCard from './ConfirmationCard';
import type { AgentId } from './constants';
import type { MemberId } from '../../constants/members';

function AgentSheet() {
  // === ALL HOOKS MUST BE BEFORE ANY RETURN ===
  const isSheetOpen = useVoiceAgentStore((s) => s.isSheetOpen);
  const phase = useVoiceAgentStore((s) => s.phase);
  const activeAgent = useVoiceAgentStore((s) => s.activeAgent);
  const transcript = useVoiceAgentStore((s) => s.transcript);
  const confirmations = useVoiceAgentStore((s) => s.confirmations);
  const agentReply = useVoiceAgentStore((s) => s.agentReply);
  const error = useVoiceAgentStore((s) => s.error);
  const storeDuration = useVoiceAgentStore((s) => s.duration);

  const setActiveAgent = useVoiceAgentStore((s) => s.setActiveAgent);
  const closeSheet = useVoiceAgentStore((s) => s.closeSheet);
  const setPhase = useVoiceAgentStore((s) => s.setPhase);
  const setDuration = useVoiceAgentStore((s) => s.setDuration);
  const setResults = useVoiceAgentStore((s) => s.setResults);
  const confirmAction = useVoiceAgentStore((s) => s.confirmAction);
  const rejectAction = useVoiceAgentStore((s) => s.rejectAction);
  const confirmAll = useVoiceAgentStore((s) => s.confirmAll);
  const clearResults = useVoiceAgentStore((s) => s.clearResults);
  const setError = useVoiceAgentStore((s) => s.setError);

  const showToast = useToastStore((s) => s.showToast);
  const member = useActiveMember();
  const { startRecording, stopRecording, duration: recorderDuration } = useAudioRecorder();

  const [visible, setVisible] = useState(false);

  const agent = useMemo(() => getAgentById(activeAgent), [activeAgent]);
  const pendingCount = useMemo(() => confirmations.filter((c) => c.status === 'pending').length, [confirmations]);
  const allResolved = confirmations.length > 0 && pendingCount === 0;

  // Sync recorder duration to store
  useEffect(() => {
    if (phase === 'recording') {
      setDuration(recorderDuration);
    }
  }, [recorderDuration, phase, setDuration]);

  // Show animation when sheet opens
  useEffect(() => {
    if (isSheetOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isSheetOpen]);

  // Auto-close after all resolved
  useEffect(() => {
    if (allResolved) {
      const timer = setTimeout(() => clearResults(), 1500);
      return () => clearTimeout(timer);
    }
  }, [allResolved, clearResults]);

  // === NOW SAFE TO RETURN ===
  if (!isSheetOpen && !visible) return null;

  function handleClose() {
    setVisible(false);
    setTimeout(closeSheet, 200);
  }

  async function handleMicTap() {
    if (phase === 'recording') {
      try {
        const audio = await stopRecording();
        setPhase('processing');

        const response = await processVoiceCommand({
          audio,
          agentId: activeAgent,
          activeMemberId: (member?.id ?? 'felipe') as MemberId,
          todayISO: formatDateISO(new Date()),
        });

        if (response.actions.length === 0) {
          setError('Não identifiquei nenhuma ação. Tente ser mais específico.');
          return;
        }

        const items = buildConfirmationItems(response.actions);
        setResults(response.transcript, items, response.agentReply);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao processar';
        setError(msg === 'Áudio muito curto' ? 'Áudio muito curto, tente novamente' : msg);
      }
    } else if (phase === 'idle') {
      try {
        await startRecording();
        setPhase('recording');
      } catch {
        // error set in hook
      }
    }
  }

  function handleConfirm(id: string) {
    const item = confirmations.find((c) => c.id === id);
    if (!item || item.status !== 'pending') return;
    executeVoiceAction(item.action);
    confirmAction(id);
    showToast('Ação confirmada!');
  }

  function handleReject(id: string) {
    rejectAction(id);
  }

  function handleConfirmAll() {
    for (const c of confirmations) {
      if (c.status === 'pending') executeVoiceAction(c.action);
    }
    confirmAll();
    showToast(`${pendingCount} ${pendingCount > 1 ? 'ações confirmadas' : 'ação confirmada'}!`);
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end justify-center transition-colors duration-200 ${
        visible ? 'bg-black/40' : 'bg-black/0'
      }`}
      onClick={(e) => e.target === e.currentTarget && phase !== 'processing' && handleClose()}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-2xl transition-transform duration-200 ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle + close */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
          {phase !== 'processing' && (
            <button onClick={handleClose} className="rounded-lg p-1.5 hover:bg-gray-100">
              <HugeiconsIcon icon={Cancel01Icon} size={20} color="#6B7280" />
            </button>
          )}
        </div>

        {/* ===== IDLE ===== */}
        {phase === 'idle' && (
          <>
            <div className="mb-5 flex gap-2">
              {AGENTS.map((a) => {
                const isActive = a.id === activeAgent;
                return (
                  <button
                    key={a.id}
                    onClick={() => setActiveAgent(a.id as AgentId)}
                    className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 py-3 transition-all ${
                      isActive ? 'shadow-sm' : 'border-gray-100 hover:border-gray-200'
                    }`}
                    style={isActive ? { borderColor: a.color, backgroundColor: `${a.color}12` } : undefined}
                  >
                    <Emoji name={a.emoji} width={28} />
                    <span className="text-xs font-bold" style={{ color: isActive ? a.color : '#6B7280' }}>
                      {a.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-6 text-center">
              <p className="text-sm font-semibold text-text-primary">{agent.greeting}</p>
              <p className="mt-1 text-xs text-text-muted">{agent.description}</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleMicTap}
                className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: agent.color }}
                aria-label="Iniciar gravação"
              >
                <HugeiconsIcon icon={Mic01Icon} size={28} color="#fff" />
              </button>
              <p className="text-xs font-semibold text-text-muted">Toque para falar</p>
            </div>
          </>
        )}

        {/* ===== RECORDING ===== */}
        {phase === 'recording' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative">
              <span className="absolute inset-0 animate-pulse-ring rounded-full" style={{ backgroundColor: `${agent.color}30` }} />
              <span className="absolute inset-0 animate-pulse-ring rounded-full" style={{ backgroundColor: `${agent.color}20`, animationDelay: '0.5s' }} />
              <button
                onClick={handleMicTap}
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
                style={{ backgroundColor: agent.color }}
                aria-label="Parar gravação"
              >
                <HugeiconsIcon icon={Mic01Icon} size={32} color="#fff" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color: agent.color }}>Ouvindo...</p>
              <p className="mt-1 text-xs text-text-muted">{storeDuration}s / 30s</p>
            </div>
          </div>
        )}

        {/* ===== PROCESSING ===== */}
        {phase === 'processing' && (
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-gray-200" style={{ borderTopColor: agent.color }} />
            <p className="text-sm font-semibold text-text-muted">{agent.name} está pensando...</p>
          </div>
        )}

        {/* ===== CONFIRMATION ===== */}
        {phase === 'confirmation' && (
          <div className="flex flex-col gap-4">
            {transcript && (
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-text-muted">Você disse:</p>
                <p className="mt-1 text-sm text-text-primary">"{transcript}"</p>
              </div>
            )}

            {agentReply && (
              <div className="flex items-start gap-2">
                <Emoji name={agent.emoji} width={20} />
                <p className="text-sm font-semibold" style={{ color: agent.color }}>{agentReply}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {confirmations.map((item) => (
                <ConfirmationCard key={item.id} item={item} onConfirm={handleConfirm} onReject={handleReject} />
              ))}
            </div>

            <div className="flex gap-2">
              {pendingCount >= 2 && (
                <button
                  onClick={handleConfirmAll}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: '#22C55E' }}
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="#fff" />
                  Confirmar todos ({pendingCount})
                </button>
              )}
              {pendingCount > 0 && (
                <button onClick={handleClose} className="flex-1 rounded-xl py-3 text-sm font-semibold text-text-muted hover:bg-gray-50">
                  Cancelar
                </button>
              )}
            </div>

            {allResolved && (
              <p className="text-center text-xs font-semibold text-green-600">Tudo pronto! Fechando...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentSheet;
