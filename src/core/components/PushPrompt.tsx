import { useState, useEffect } from 'react';
import { isPushSupported, isPWAInstalled, getPushPermission, subscribeToPush } from '../services/pushNotifications';
import { useActiveMember } from '../hooks/useActiveMember';

const DISMISSED_KEY = '4family_push_prompt_dismissed';

function PushPrompt() {
  const activeMember = useActiveMember();
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (!activeMember) return;
    if (!isPushSupported()) return;
    if (getPushPermission() === 'granted') return;
    if (getPushPermission() === 'denied') return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // iOS needs PWA to be installed first
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isPWAInstalled()) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    // Show prompt after 2 seconds
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [activeMember]);

  if (!visible || !activeMember) return null;

  async function handleEnable() {
    if (iosHint) {
      setVisible(false);
      return;
    }
    await subscribeToPush(activeMember!.id);
    setVisible(false);
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-slide-up rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
      {iosHint ? (
        <>
          <p className="mb-1 text-sm font-bold text-text-primary">Receba notificações</p>
          <p className="mb-3 text-xs text-text-muted">
            No iPhone/iPad, primeiro adicione o 4Family na tela inicial:
            toque em <span className="font-semibold">Compartilhar</span> → <span className="font-semibold">Adicionar à Tela de Início</span>.
            Depois abra por lá para ativar notificações.
          </p>
          <button
            onClick={handleDismiss}
            className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-text-muted"
          >
            Entendi
          </button>
        </>
      ) : (
        <>
          <p className="mb-1 text-sm font-bold text-text-primary">Ativar notificações?</p>
          <p className="mb-3 text-xs text-text-muted">
            Receba lembretes de tarefas, refeições e alertas financeiros direto no celular.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-text-muted"
            >
              Agora não
            </button>
            <button
              onClick={handleEnable}
              className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white"
            >
              Ativar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PushPrompt;
