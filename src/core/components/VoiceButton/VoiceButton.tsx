import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mic01Icon } from '@hugeicons/core-free-icons';
import { useVoiceAgentStore } from '../../store/voiceAgentStore';
import { getAgentById, getAgentByPath } from './constants';
import AgentSheet from './AgentSheet';

const HIDDEN_PATHS = ['/', '/login', '/select-module', '/profile', '/ranking'];

function VoiceButton() {
  const { pathname } = useLocation();
  const activeAgent = useVoiceAgentStore((s) => s.activeAgent);
  const isSheetOpen = useVoiceAgentStore((s) => s.isSheetOpen);
  const phase = useVoiceAgentStore((s) => s.phase);
  const setActiveAgent = useVoiceAgentStore((s) => s.setActiveAgent);
  const openSheet = useVoiceAgentStore((s) => s.openSheet);

  useEffect(() => {
    if (pathname.startsWith('/chef') || pathname.startsWith('/home-tasks') || pathname.startsWith('/fin')) {
      setActiveAgent(getAgentByPath(pathname));
    }
  }, [pathname, setActiveAgent]);

  if (HIDDEN_PATHS.includes(pathname)) return null;

  const agent = getAgentById(activeAgent);
  const isRecording = phase === 'recording';

  return (
    <>
      {!isSheetOpen && (
        <button
          onClick={openSheet}
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 lg:bottom-6 lg:right-6"
          style={{ backgroundColor: agent.color }}
          aria-label="Assistente de voz"
        >
          <HugeiconsIcon icon={Mic01Icon} size={24} color="#fff" />
          <span className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
            <Emoji name={agent.emoji} width={14} />
          </span>
          {isRecording && (
            <span className="absolute inset-0 animate-pulse-ring rounded-full" style={{ backgroundColor: `${agent.color}40` }} />
          )}
        </button>
      )}
      <AgentSheet />
    </>
  );
}

export default VoiceButton;
