import { useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { useNudgeStore } from '../store/nudgeStore';
import { useActiveMember } from '../../../core/hooks/useActiveMember';

type NudgeBadgeProps = {
  taskId: string;
};

function NudgeBadge({ taskId }: NudgeBadgeProps) {
  const activeMember = useActiveMember();
  const getNudgesForTask = useNudgeStore((s) => s.getNudgesForTask);
  const markAsRead = useNudgeStore((s) => s.markAsRead);
  const [showDetail, setShowDetail] = useState(false);

  const nudges = getNudgesForTask(taskId);
  const myNudges = nudges.filter((n) => n.toMember === activeMember?.id);
  const unreadCount = myNudges.filter((n) => !n.read).length;

  if (myNudges.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDetail(!showDetail);
          // Mark unread nudges as read
          for (const n of myNudges.filter((n) => !n.read)) {
            markAsRead(n.id);
          }
        }}
        className="relative flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        </svg>
        {myNudges.length}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>

      {/* Tooltip with nudge details */}
      {showDetail && (
        <div
          className="absolute left-0 top-full z-40 mt-1 w-56 rounded-xl border border-gray-100 bg-white p-3 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-2 text-xs font-semibold text-text-muted">Lembretes recebidos</p>
          <div className="flex flex-col gap-2">
            {myNudges.slice(0, 5).map((n) => {
              const sender = FAMILY_MEMBERS.find((m) => m.id === n.fromMember);
              return (
                <div key={n.id} className="flex items-start gap-2 text-xs">
                  {sender && <Emoji name={sender.emoji} width={14} />}
                  <div className="flex-1">
                    <span className="font-medium">{sender?.name}</span>
                    <p className="text-text-muted">{n.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default NudgeBadge;
