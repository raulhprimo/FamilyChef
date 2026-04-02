import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowRight01Icon, ArrowLeft01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { useFamilyStore } from '../core/store/familyStore';

const EMOJI_OPTIONS = ['man', 'woman', 'girl', 'boy', 'older-man', 'older-woman'];
const COLOR_OPTIONS = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#7C83FD', '#FF6B6B', '#F9A825', '#9333EA', '#EC4899'];

type MemberDraft = {
  name: string;
  emoji: string;
  color: string;
  excludeFin: boolean;
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { createFamily, addMember, setActiveSession } = useFamilyStore();

  const [step, setStep] = useState<'name' | 'password' | 'members' | 'done'>('name');
  const [familyName, setFamilyName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState<MemberDraft[]>([]);
  const [currentMember, setCurrentMember] = useState<MemberDraft>({ name: '', emoji: 'man', color: '#4ECDC4', excludeFin: false });
  const [createdFamilyId, setCreatedFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateFamily() {
    if (!familyName.trim() || !password.trim()) return;
    setLoading(true);
    const id = await createFamily(familyName.trim(), password.trim());
    if (id) {
      setCreatedFamilyId(id);
      setStep('members');
    }
    setLoading(false);
  }

  function handleAddMember() {
    if (!currentMember.name.trim()) return;
    setMembers([...members, { ...currentMember, name: currentMember.name.trim() }]);
    setCurrentMember({ name: '', emoji: 'man', color: COLOR_OPTIONS[(members.length + 1) % COLOR_OPTIONS.length], excludeFin: false });
  }

  function handleRemoveMember(index: number) {
    setMembers(members.filter((_, i) => i !== index));
  }

  async function handleFinish() {
    if (!createdFamilyId || members.length === 0) return;
    setLoading(true);

    // Add all members to DB
    let firstMemberId: string | null = null;
    for (const m of members) {
      const created = await addMember(m);
      if (created && !firstMemberId) firstMemberId = created.id;
    }

    // Set first member as active
    if (firstMemberId) {
      setActiveSession(createdFamilyId, firstMemberId);
    }

    setStep('done');
    setLoading(false);

    // Navigate to module select after brief animation
    setTimeout(() => navigate('/select-module'), 1500);
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-bg-primary px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Step: Family Name */}
        {step === 'name' && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <Emoji name="family" width={48} />
              <h1 className="font-display text-2xl font-extrabold text-text-primary mt-3">Crie sua família</h1>
              <p className="text-sm text-text-muted mt-1">Escolha um nome para o grupo</p>
            </div>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Ex: Família Silva"
              autoFocus
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 px-4 text-sm font-medium text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-gray-400 mb-4"
            />
            <button
              onClick={() => familyName.trim() && setStep('password')}
              disabled={!familyName.trim()}
              className="w-full rounded-xl bg-accent px-4 py-3.5 font-semibold text-white transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Próximo <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#fff" />
            </button>
          </div>
        )}

        {/* Step: Password */}
        {step === 'password' && (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <Emoji name="locked" width={48} />
              <h1 className="font-display text-2xl font-extrabold text-text-primary mt-3">Defina uma senha</h1>
              <p className="text-sm text-text-muted mt-1">Todos os membros usam a mesma senha</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha da família"
              autoFocus
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 px-4 text-sm font-medium text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-gray-400 mb-4"
            />
            <button
              onClick={handleCreateFamily}
              disabled={!password.trim() || loading}
              className="w-full rounded-xl bg-accent px-4 py-3.5 font-semibold text-white transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? 'Criando...' : 'Criar família'}
            </button>
            <button
              onClick={() => setStep('name')}
              className="w-full mt-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-text-muted hover:bg-gray-100 flex items-center justify-center gap-1"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} color="#6B7280" /> Voltar
            </button>
          </div>
        )}

        {/* Step: Add Members */}
        {step === 'members' && (
          <div className="animate-slide-up">
            <div className="text-center mb-6">
              <Emoji name="waving-hand" width={40} />
              <h1 className="font-display text-2xl font-extrabold text-text-primary mt-3">Adicione os membros</h1>
              <p className="text-sm text-text-muted mt-1">Quem faz parte da {familyName}?</p>
            </div>

            {/* Members added */}
            {members.length > 0 && (
              <div className="space-y-2 mb-4">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${m.color}20` }}>
                      <Emoji name={m.emoji} width={24} />
                    </div>
                    <span className="flex-1 font-semibold text-sm" style={{ color: m.color }}>{m.name}</span>
                    {m.excludeFin && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Sem Fin</span>}
                    <button onClick={() => handleRemoveMember(i)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add member form */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
              <input
                type="text"
                value={currentMember.name}
                onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                placeholder="Nome do membro"
                className="w-full rounded-lg border border-gray-100 bg-gray-50 py-2.5 px-3 text-sm outline-none focus:border-accent mb-3 placeholder:text-gray-400"
              />
              {/* Emoji picker */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avatar</span>
                <div className="flex gap-2 mt-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setCurrentMember({ ...currentMember, emoji: e })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        currentMember.emoji === e ? 'bg-gray-100 ring-2 ring-accent scale-110' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Emoji name={e} width={24} />
                    </button>
                  ))}
                </div>
              </div>
              {/* Color picker */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cor</span>
                <div className="flex gap-2 mt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrentMember({ ...currentMember, color: c })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        currentMember.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              {/* Exclude from Fin */}
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <input
                  type="checkbox"
                  checked={currentMember.excludeFin}
                  onChange={(e) => setCurrentMember({ ...currentMember, excludeFin: e.target.checked })}
                  className="rounded"
                />
                Excluir do FamilyFin (ex: criança)
              </label>
              <button
                onClick={handleAddMember}
                disabled={!currentMember.name.trim()}
                className="w-full rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} color="#1A1A1A" />
                Adicionar membro
              </button>
            </div>

            <button
              onClick={handleFinish}
              disabled={members.length === 0 || loading}
              className="w-full rounded-xl bg-accent px-4 py-3.5 font-semibold text-white transition-opacity disabled:opacity-40"
            >
              {loading ? 'Salvando...' : `Começar com ${members.length} membro${members.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="animate-slide-up text-center">
            <div className="mb-4">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={64} color="#22C55E" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-text-primary">Família criada!</h1>
            <p className="text-sm text-text-muted mt-2">Redirecionando...</p>
          </div>
        )}
      </div>
    </main>
  );
}
