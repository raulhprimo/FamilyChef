import { useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { FAMILY_MEMBERS } from '../constants/members';

const STORAGE_KEY = 'familychef_active_member';

function ProfileSelect() {
  const navigate = useNavigate();

  function handleSelect(memberId: string, memberName: string) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ memberId, memberName }),
    );
    navigate('/home');
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-bg-primary px-4 py-12">
      <div className="mb-2">
        <Emoji name="woman-cook" width={56} aria-hidden="true" />
      </div>
      <h1 className="mb-1 font-display text-3xl font-extrabold text-text-primary">
        FamilyChef
      </h1>
      <p className="mb-10 text-sm text-text-muted">Quem vai cozinhar hoje?</p>

      <div className="flex w-full max-w-sm flex-col gap-4">
        {FAMILY_MEMBERS.map((member) => (
          <button
            key={member.id}
            onClick={() => handleSelect(member.id, member.name)}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-bg-card p-5 shadow-sm transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
            aria-label={`Entrar como ${member.name}`}
          >
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${member.color}20` }}
            >
              <Emoji name={member.emoji} width={36} />
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: member.color }}
            >
              {member.name}
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}

export default ProfileSelect;
