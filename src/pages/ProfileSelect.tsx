import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockIcon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../constants/members';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'familychef_active_member';

function ProfileSelect() {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [familyPassword, setFamilyPassword] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'family_password')
      .single()
      .then(({ data }) => {
        if (data) setFamilyPassword(data.value);
      });
  }, []);

  function handleSelect(memberId: string, memberName: string) {
    setSelectedMember({ id: memberId, name: memberName });
    setPassword('');
    setError(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMember || familyPassword === null) return;

    if (password === familyPassword) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ memberId: selectedMember.id, memberName: selectedMember.name }),
      );
      navigate('/home');
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  function handleBack() {
    setSelectedMember(null);
    setPassword('');
    setError(false);
  }

  const activeMember = selectedMember
    ? FAMILY_MEMBERS.find((m) => m.id === selectedMember.id)
    : null;

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-bg-primary px-4 py-12">
      <div className="mb-2">
        <Emoji name="woman-cook" width={56} aria-hidden="true" />
      </div>
      <h1 className="mb-1 font-display text-3xl font-extrabold text-text-primary">
        FamilyChef
      </h1>
      <p className="mb-10 text-sm text-text-muted">
        {selectedMember ? 'Digite a senha para entrar' : 'Quem vai cozinhar hoje?'}
      </p>

      {!selectedMember ? (
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
      ) : (
        <div className={`w-full max-w-sm ${shaking ? 'animate-shake' : ''}`}>
          {/* Selected member card */}
          <div className="mb-6 flex flex-col items-center">
            <div
              className="mb-3 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: `${activeMember?.color}20` }}
            >
              {activeMember && <Emoji name={activeMember.emoji} width={48} />}
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: activeMember?.color }}
            >
              {activeMember?.name}
            </span>
          </div>

          {/* Password form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <HugeiconsIcon icon={LockIcon} size={18} color={error ? '#EF4444' : '#9CA3AF'} aria-hidden="true" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Senha da família"
                autoFocus
                className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-gray-400 ${
                  error
                    ? 'border-red-300 ring-1 ring-red-200'
                    : 'border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent/30'
                }`}
              />
            </div>

            {error && (
              <p className="text-center text-xs font-semibold text-red-500">
                Senha incorreta, tente novamente
              </p>
            )}

            <button
              type="submit"
              disabled={password.length === 0 || familyPassword === null}
              className="w-full rounded-xl bg-accent px-4 py-3.5 font-semibold text-white transition-opacity disabled:opacity-40"
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:bg-gray-100"
            >
              Voltar
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default ProfileSelect;
