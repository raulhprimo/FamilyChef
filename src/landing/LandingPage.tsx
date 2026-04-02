import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mic01Icon,
  CheckmarkCircle02Icon,
  FireIcon,
  Award02Icon,
  RankingIcon,
  Home01Icon,
  Target01Icon,
  RepeatIcon,
  Clock01Icon,
  Add01Icon,
  ArrowRight01Icon,
  Camera01Icon,
} from '@hugeicons/core-free-icons';

/* ═══════════════════════════════════════════════════════════
   Logo Component
   ═══════════════════════════════════════════════════════════ */

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className="shrink-0">
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="50%" stopColor="#F9A825" />
          <stop offset="100%" stopColor="#4ECDC4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#logo-bg)" />
      <text x="16" y="21.5" textAnchor="middle" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="900" fontSize="14" fill="white" letterSpacing="-0.5">4F</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   Phone Frame – iPhone 15 proportions (393×852 → scaled to w=260)
   Fixed width 260px, aspect ratio 393:852 ≈ 1:2.17
   ═══════════════════════════════════════════════════════════ */

const PHONE_W = 260;
const PHONE_H = Math.round(PHONE_W * 2.17); // 564px

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: PHONE_W }} className="mx-auto shrink-0">
      <div
        className="rounded-[2.5rem] bg-[#1A1A1A] p-[5px] shadow-2xl shadow-black/20"
        style={{ width: PHONE_W, height: PHONE_H }}
      >
        {/* Dynamic Island */}
        <div className="relative rounded-[2.2rem] overflow-hidden bg-[#FAFAF8] h-full flex flex-col">
          <div className="flex justify-center pt-2.5 pb-1 relative z-10">
            <div className="w-[90px] h-[26px] bg-[#1A1A1A] rounded-full" />
          </div>
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 -mt-[22px] pt-[6px] pb-1 text-[10px] font-semibold text-gray-800 relative z-0">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><rect x="0.5" y="1.5" width="4" height="7" rx="0.5" stroke="#1A1A1A" strokeWidth="0.8" fill="#1A1A1A"/><rect x="5.5" y="0.5" width="4" height="9" rx="0.5" stroke="#1A1A1A" strokeWidth="0.8" fill="#1A1A1A" fillOpacity="0.4"/><rect x="10.5" y="2.5" width="2.5" height="5" rx="0.5" stroke="#1A1A1A" strokeWidth="0.8" fill="#1A1A1A" fillOpacity="0.2"/></svg>
            </div>
          </div>
          {/* Screen content */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {children}
          </div>
          {/* Home indicator */}
          <div className="flex justify-center pb-2 pt-1">
            <div className="w-[100px] h-[4px] bg-gray-800 rounded-full opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Module Preview Components
   ═══════════════════════════════════════════════════════════ */

function ChefPreview() {
  const meals = [
    { day: 'Seg', type: 'Almoço', dish: 'Frango grelhado', who: 'Elaine', color: '#FF6B9D', done: true },
    { day: 'Seg', type: 'Janta', dish: 'Sopa de legumes', who: 'Felipe', color: '#4ECDC4', done: true },
    { day: 'Ter', type: 'Almoço', dish: 'Strogonoff', who: 'Raul', color: '#7C83FD', done: true },
    { day: 'Ter', type: 'Janta', dish: 'Omelete', who: 'Letícia', color: '#FFE66D', done: false },
    { day: 'Qua', type: 'Almoço', dish: 'Feijoada', who: 'Felipe', color: '#4ECDC4', done: false },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Emoji name="fork-and-knife-with-plate" width={16} />
          <span className="font-display font-bold text-xs text-[#FF6B6B]">Cardápio da Semana</span>
        </div>
        <span className="text-[10px] text-gray-400">Sem 14</span>
      </div>

      {/* Meal list */}
      <div className="space-y-1.5">
        {meals.map((m, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 border border-gray-50">
            <div className="w-1 h-7 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-gray-400">{m.day}</span>
                <span className="text-[9px] text-gray-300">·</span>
                <span className="text-[10px] text-gray-400">{m.type}</span>
              </div>
              <span className="text-[12px] font-medium text-gray-800 truncate block leading-tight">{m.dish}</span>
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">{m.who}</span>
            {m.done ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color="#22C55E" />
            ) : (
              <span className="h-3.5 w-3.5 rounded-full border-[1.5px] border-gray-200 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Gallery section */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 mb-2">
          <HugeiconsIcon icon={Camera01Icon} size={14} color="#FF6B6B" />
          <span className="text-[11px] font-bold text-gray-600">Galeria da Família</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { bg: 'from-orange-200 to-orange-300', label: 'Strogonoff' },
            { bg: 'from-yellow-200 to-amber-300', label: 'Feijoada' },
            { bg: 'from-green-200 to-emerald-300', label: 'Salada' },
          ].map((photo, i) => (
            <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${photo.bg} flex flex-col items-center justify-center relative overflow-hidden`}>
              <Emoji name="fork-and-knife-with-plate" width={20} />
              <span className="text-[8px] font-bold text-white/90 mt-0.5 drop-shadow-sm">{photo.label}</span>
              {i === 0 && (
                <div className="absolute top-1 right-1">
                  <Emoji name="heart-suit" width={10} />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[9px] text-gray-400 text-center mt-1.5">Fotos das refeições da família</p>
      </div>
    </div>
  );
}

function HomePreview() {
  const tasks = [
    { name: 'Lavar louça', who: 'Letícia', color: '#FFE66D', done: true, cat: 'Limpeza' },
    { name: 'Compras do mês', who: 'Elaine', color: '#FF6B9D', done: false, cat: 'Compras', late: true },
    { name: 'Aspirar sala', who: 'Raul', color: '#7C83FD', done: false, cat: 'Limpeza' },
    { name: 'Trocar lâmpada', who: 'Felipe', color: '#4ECDC4', done: false, cat: 'Manutenção', urgent: true },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Emoji name="house" width={16} />
          <span className="font-display font-bold text-xs text-[#F9A825]">Tarefas de Hoje</span>
        </div>
        <div className="flex items-center gap-1">
          <Emoji name="fire" width={12} />
          <span className="text-[10px] font-bold text-orange-500">5 dias</span>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-1.5">
        {tasks.map((t, i) => (
          <div key={i} className={`flex items-center gap-2 rounded-xl px-2.5 py-2 border ${
            t.done ? 'bg-green-50/60 border-green-100' : (t as { late?: boolean }).late ? 'bg-red-50/60 border-red-100' : 'bg-white border-gray-50'
          }`}>
            {t.done ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="#22C55E" />
            ) : (
              <span className="h-4 w-4 rounded-full border-2 shrink-0" style={{ borderColor: t.color }} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className={`text-[12px] font-medium leading-tight ${t.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.name}</span>
                {(t as { urgent?: boolean }).urgent && (
                  <span className="rounded bg-orange-100 px-1 py-0.5 text-[8px] font-bold text-orange-600">!</span>
                )}
                {(t as { late?: boolean }).late && (
                  <span className="rounded bg-red-100 px-1 py-0.5 text-[8px] font-bold text-red-600">2d</span>
                )}
              </div>
              <span className="text-[10px] text-gray-400">{t.cat} · {t.who}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-center pt-1">
        <div className="w-10 h-10 rounded-full bg-[#F9A825] flex items-center justify-center shadow-lg shadow-amber-200">
          <HugeiconsIcon icon={Add01Icon} size={20} color="#fff" />
        </div>
      </div>
    </div>
  );
}

function FinPreview() {
  const cats = [
    { name: 'Mercado', pct: 45, color: '#4ECDC4' },
    { name: 'Contas', pct: 30, color: '#7C83FD' },
    { name: 'Lazer', pct: 15, color: '#FF6B6B' },
    { name: 'Outros', pct: 10, color: '#F9A825' },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Emoji name="money-bag" width={16} />
          <span className="font-display font-bold text-xs text-[#4ECDC4]">Resumo do Mês</span>
        </div>
        <span className="text-[10px] text-gray-400">Abril 2026</span>
      </div>

      {/* Total */}
      <div className="rounded-xl bg-gradient-to-br from-[#4ECDC4] to-[#3AB8B0] p-3 text-white text-center">
        <span className="text-[10px] opacity-80">Total de gastos</span>
        <div className="text-xl font-extrabold">R$ 3.450,00</div>
      </div>

      {/* Category bars */}
      <div>
        <div className="flex rounded-full h-2.5 overflow-hidden">
          {cats.map((c) => (
            <div key={c.name} style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
          {cats.map((c) => (
            <div key={c.name} className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name} {c.pct}%
            </div>
          ))}
        </div>
      </div>

      {/* Goal */}
      <div className="rounded-xl bg-white p-2.5 border border-gray-50">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Emoji name="direct-hit" width={12} />
            <span className="text-[10px] font-semibold text-gray-700">Viagem em família</span>
          </div>
          <span className="text-[10px] font-bold text-[#7C83FD]">56%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-[#7C83FD]" style={{ width: '56%' }} />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-gray-400">
          <span>R$ 2.800</span>
          <span>R$ 5.000</span>
        </div>
      </div>

      {/* Debts */}
      <div className="rounded-xl bg-white p-2.5 border border-gray-50">
        <span className="text-[10px] font-semibold text-gray-600 block mb-1.5">Quem deve quem</span>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-[#FF6B9D]/20 flex items-center justify-center">
              <span className="text-[8px]">E</span>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} size={10} color="#9CA3AF" />
            <div className="w-5 h-5 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center">
              <span className="text-[8px]">F</span>
            </div>
          </div>
          <span className="font-bold text-gray-700">R$ 85,00</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════════ */

const MODULES = [
  {
    id: 'chef',
    title: 'FamilyChef',
    subtitle: 'Planejamento de Refeições',
    description: 'Organize o cardápio semanal, marque quem cozinhou, tire fotos para a galeria da família e ganhe pontos.',
    color: '#FF6B6B',
    emojiName: 'woman-cook',
    highlights: ['Cardápio semanal', 'Galeria de fotos', 'Pontos por cozinhar'],
  },
  {
    id: 'home',
    title: 'FamilyHome',
    subtitle: 'Tarefas Domésticas',
    description: 'Distribua tarefas, configure recorrências, acompanhe streaks e nudge quem esqueceu.',
    color: '#F9A825',
    emojiName: 'house',
    highlights: ['Tarefas recorrentes', 'Nudge para lembrar', 'Streaks por consistência'],
  },
  {
    id: 'fin',
    title: 'FamilyFin',
    subtitle: 'Finanças Compartilhadas',
    description: 'Registre gastos, divida contas, defina metas de economia e orçamentos por categoria.',
    color: '#4ECDC4',
    emojiName: 'money-bag',
    highlights: ['Divisão inteligente', 'Metas de economia', 'Orçamento por categoria'],
  },
];

const PLANS = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '',
    description: 'Para famílias começando',
    features: ['Até 3 membros', 'Módulo de Tarefas completo', '30 tarefas por mês', 'Ranking básico'],
    notIncluded: ['FamilyChef', 'FamilyFin', 'Assistente de voz', 'Push notifications'],
    cta: 'Começar grátis',
    popular: false,
  },
  {
    name: 'Família',
    price: 'R$ 14,90',
    yearlyPrice: 'R$ 9,99',
    yearlyTotal: 'R$ 119,90/ano',
    period: '/mês',
    description: 'Tudo que sua família precisa',
    features: ['Até 6 membros', 'Todos os 3 módulos', 'Tarefas ilimitadas', 'Ranking + badges + streaks', 'Push notifications + nudges', 'Assistente de voz (50/mês)', 'Histórico de 6 meses'],
    notIncluded: [],
    cta: 'Assinar agora',
    popular: true,
  },
  {
    name: 'Família+',
    price: 'R$ 24,90',
    yearlyPrice: 'R$ 16,66',
    yearlyTotal: 'R$ 199,90/ano',
    period: '/mês',
    description: 'Para famílias grandes',
    features: ['Até 10 membros', 'Tudo do plano Família +', 'Voz ilimitada', 'Histórico ilimitado', 'Relatórios em PDF', 'Metas ilimitadas', 'Orçamentos personalizados', 'Suporte prioritário'],
    notIncluded: [],
    cta: 'Assinar agora',
    popular: false,
  },
];

const TESTIMONIALS = [
  { name: 'Ana M.', role: 'Mãe de 3 filhos', text: 'Meus filhos agora disputam quem faz mais tarefas! O ranking virou a diversão da família.', emojiName: 'woman' },
  { name: 'Carlos R.', role: 'Pai e cozinheiro', text: 'O planejamento de refeições salvou nossas noites. Sem mais estresse decidindo o jantar.', emojiName: 'man-cook' },
  { name: 'Juliana S.', role: 'Mãe organizada', text: 'Finalmente as finanças da casa estão transparentes. Todo mundo sabe quem deve o quê.', emojiName: 'woman-office-worker' },
];

/* ═══════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<'chef' | 'home' | 'fin'>('chef');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A]">
      {/* ══════ Nav ══════ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="font-display font-bold text-xl tracking-tight">4Family</span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-[#1A1A1A] transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-[#1A1A1A] transition-colors">Preços</a>
            <a href="#how-it-works" className="hover:text-[#1A1A1A] transition-colors">Como funciona</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#1A1A1A] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#333] transition-colors"
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* ══════ Hero ══════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-yellow-50 to-teal-50 opacity-60" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 text-sm text-gray-600 shadow-sm mb-8 border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <HugeiconsIcon icon={Mic01Icon} size={14} color="#6B7280" />
              Novo: Assistente de voz com IA
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Organize sua casa
              <br />
              <span className="bg-gradient-to-r from-[#FF6B6B] via-[#F9A825] to-[#4ECDC4] bg-clip-text text-transparent">
                como um time
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Refeições, tarefas e finanças — tudo gamificado. Pontos, streaks, rankings e assistente de voz para transformar a rotina familiar em diversão.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-[#1A1A1A] text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-[#333] transition-all hover:scale-105 shadow-lg shadow-black/10"
              >
                Começar grátis
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto border border-gray-300 text-gray-700 px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Ver funcionalidades
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">Sem cartão de crédito. Cancele quando quiser.</p>
          </div>

          {/* Floating Apple Emojis */}
          <div className="hidden sm:block absolute top-20 left-10 animate-bounce" style={{ animationDuration: '3s' }}>
            <Emoji name="woman-cook" width={40} />
          </div>
          <div className="hidden sm:block absolute top-40 right-16 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
            <Emoji name="trophy" width={40} />
          </div>
          <div className="hidden sm:block absolute bottom-20 left-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
            <Emoji name="money-with-wings" width={40} />
          </div>
          <div className="hidden sm:block absolute bottom-32 right-10 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}>
            <Emoji name="house" width={40} />
          </div>
        </div>
      </section>

      {/* ══════ Social Proof Bar ══════ */}
      <section className="bg-white border-y border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-center">
            {[
              { label: '3-em-1', sub: 'Plataforma única', icon: Target01Icon },
              { label: 'PWA', sub: 'Qualquer dispositivo', icon: Home01Icon },
              { label: 'Real-time', sub: 'Atualizações instantâneas', icon: RepeatIcon },
              { label: 'IA', sub: 'Assistente de voz', icon: Mic01Icon },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <HugeiconsIcon icon={item.icon} size={20} color="#1A1A1A" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#1A1A1A]">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Features with Interactive Preview ══════ */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              3 módulos, 1 família organizada
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada módulo resolve um aspecto da vida em família — clique para ver como funciona.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Module tabs */}
            <div className="space-y-4 order-2 lg:order-1">
              {MODULES.map((m) => {
                const isActive = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id as 'chef' | 'home' | 'fin')}
                    className={`w-full text-left rounded-2xl p-5 border-2 transition-all duration-300 ${
                      isActive
                        ? 'bg-white shadow-lg scale-[1.02]'
                        : 'bg-white/50 border-transparent hover:bg-white hover:shadow-sm'
                    }`}
                    style={{ borderColor: isActive ? m.color : 'transparent' }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${m.color}15` }}
                      >
                        <Emoji name={m.emojiName} width={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-bold text-lg" style={{ color: isActive ? m.color : '#1A1A1A' }}>
                            {m.title}
                          </h3>
                          {isActive && <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={m.color} />}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{m.subtitle}</p>
                        {isActive && (
                          <div className="animate-slide-up">
                            <p className="text-sm text-gray-600 mb-3">{m.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {m.highlights.map((h) => (
                                <span key={h} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${m.color}12`, color: m.color }}>
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Phone preview */}
            <div className="flex justify-center order-1 lg:order-2">
              <PhoneFrame>
                {activeModule === 'chef' && <ChefPreview />}
                {activeModule === 'home' && <HomePreview />}
                {activeModule === 'fin' && <FinPreview />}
              </PhoneFrame>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ Gamification ══════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Phone with ranking */}
            <div className="flex justify-center">
              <PhoneFrame>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Emoji name="trophy" width={16} />
                    <span className="font-display font-bold text-xs text-[#1A1A1A]">Ranking Semanal</span>
                  </div>

                  {/* Podium */}
                  <div className="flex items-end justify-center gap-3 py-2">
                    {/* 2nd */}
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ backgroundColor: '#FF6B9D20' }}>
                        <Emoji name="woman" width={22} />
                      </div>
                      <div className="w-14 rounded-t-lg bg-gray-100 flex flex-col items-center justify-center" style={{ height: 48 }}>
                        <span className="text-xs font-bold text-gray-400">2</span>
                        <span className="text-[10px] font-bold text-gray-600">380</span>
                      </div>
                    </div>
                    {/* 1st */}
                    <div className="text-center -mt-2">
                      <div className="flex justify-center mb-1"><Emoji name="crown" width={14} /></div>
                      <div className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ backgroundColor: '#4ECDC420' }}>
                        <Emoji name="man" width={22} />
                      </div>
                      <div className="w-14 rounded-t-lg bg-gradient-to-t from-amber-100 to-amber-50 flex flex-col items-center justify-center" style={{ height: 64 }}>
                        <span className="text-xs font-bold text-amber-500">1</span>
                        <span className="text-[10px] font-bold text-gray-700">520</span>
                      </div>
                    </div>
                    {/* 3rd */}
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ backgroundColor: '#7C83FD20' }}>
                        <Emoji name="man" width={22} />
                      </div>
                      <div className="w-14 rounded-t-lg bg-gray-50 flex flex-col items-center justify-center" style={{ height: 36 }}>
                        <span className="text-xs font-bold text-gray-400">3</span>
                        <span className="text-[10px] font-bold text-gray-600">290</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-orange-50 p-2.5 text-center">
                      <Emoji name="fire" width={20} />
                      <div className="text-sm font-extrabold text-gray-800 mt-1">7 dias</div>
                      <span className="text-[9px] text-gray-400">Streak</span>
                    </div>
                    <div className="rounded-xl bg-purple-50 p-2.5 text-center">
                      <Emoji name="star" width={20} />
                      <div className="text-sm font-extrabold text-gray-800 mt-1">520</div>
                      <span className="text-[9px] text-gray-400">Pontos</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 block mb-1.5">Badges conquistadas</span>
                    <div className="flex gap-2">
                      {[
                        { emoji: 'crown', bg: 'bg-amber-50' },
                        { emoji: 'fire', bg: 'bg-orange-50' },
                        { emoji: 'star', bg: 'bg-purple-50' },
                        { emoji: 'check-mark-button', bg: 'bg-green-50' },
                      ].map((b, i) => (
                        <div key={i} className={`w-9 h-9 ${b.bg} rounded-xl flex items-center justify-center`}>
                          <Emoji name={b.emoji} width={18} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PhoneFrame>
            </div>

            {/* Text content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <HugeiconsIcon icon={Award02Icon} size={14} color="#C2410C" />
                Sistema de gamificação
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Gamificação que
                <br />
                <span className="bg-gradient-to-r from-[#FF6B6B] to-[#F9A825] bg-clip-text text-transparent">
                  engaja toda a família
                </span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Pontos por cada tarefa completada, streaks por consistência, badges por conquistas e rankings semanais. Seus filhos vão querer ajudar em casa.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Award02Icon, title: 'Pontos', desc: 'Ganhe pontos por cada ação', color: '#FF6B6B' },
                  { icon: FireIcon, title: 'Streaks', desc: 'Mantenha a consistência', color: '#F9A825' },
                  { icon: RankingIcon, title: 'Rankings', desc: 'Compita com a família', color: '#7C83FD' },
                  { icon: Target01Icon, title: 'Badges', desc: 'Desbloqueie conquistas', color: '#4ECDC4' },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl bg-gray-50 p-4">
                    <HugeiconsIcon icon={item.icon} size={20} color={item.color} />
                    <h4 className="font-bold text-sm mt-2">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ PWA Section ══════ */}
      <section className="py-20 sm:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Emoji name="mobile-phone" width={16} />
                Progressive Web App
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Controle na
                <br />
                <span className="bg-gradient-to-r from-[#7C83FD] to-[#4ECDC4] bg-clip-text text-transparent">
                  palma da mão
                </span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                4Family é um PWA — funciona como app nativo direto do navegador. Instale na tela inicial do celular, tablet ou use no computador. Sem app store, sem downloads pesados.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Home01Icon, title: 'Instale como app', desc: 'Adicione à tela inicial e use como app nativo', color: '#7C83FD' },
                  { icon: RepeatIcon, title: 'Sincronização real-time', desc: 'Toda a família vê mudanças instantaneamente', color: '#4ECDC4' },
                  { icon: Clock01Icon, title: 'Push notifications', desc: 'Receba lembretes de tarefas e nudges no celular', color: '#FF6B6B' },
                  { icon: Target01Icon, title: 'Funciona em qualquer tela', desc: 'Celular, tablet, desktop — mesma experiência', color: '#F9A825' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}12` }}>
                      <HugeiconsIcon icon={item.icon} size={20} color={item.color} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone showing install prompt */}
            <div className="flex justify-center">
              <div className="relative">
                <PhoneFrame>
                  <div className="text-center py-6 space-y-4">
                    <div className="flex justify-center">
                      <Logo size={64} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm">4Family</h3>
                      <p className="text-[10px] text-gray-400">Adicionar à tela inicial?</p>
                    </div>
                    <div className="space-y-2 px-4">
                      <div className="w-full py-2.5 rounded-xl bg-[#7C83FD] text-white text-xs font-semibold text-center">
                        Instalar
                      </div>
                      <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-xs text-center">
                        Agora não
                      </div>
                    </div>
                    {/* Home screen mockup */}
                    <div className="pt-4">
                      <span className="text-[9px] text-gray-400 block mb-2">Na sua tela inicial:</span>
                      <div className="grid grid-cols-4 gap-3 px-4">
                        {[
                          { bg: 'from-[#FF6B6B] to-[#FF6B9D]', emoji: 'woman-cook', label: 'Chef' },
                          { bg: 'from-[#F9A825] to-[#FFE66D]', emoji: 'house', label: 'Home' },
                          { bg: 'from-[#4ECDC4] to-[#7C83FD]', emoji: 'money-bag', label: 'Fin' },
                          { bg: 'from-[#7C83FD] to-[#4ECDC4]', emoji: 'trophy', label: 'Rank' },
                        ].map((icon, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${icon.bg} flex items-center justify-center shadow-sm`}>
                              <Emoji name={icon.emoji} width={22} />
                            </div>
                            <span className="text-[8px] text-gray-500">{icon.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PhoneFrame>

                {/* Notification popup */}
                <div className="absolute -right-2 top-28 sm:-right-16 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-48 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Logo size={18} />
                    <span className="text-[10px] font-bold text-gray-800">4Family</span>
                    <span className="text-[9px] text-gray-400 ml-auto">agora</span>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-snug">
                    Felipe completou "Lavar louça" e ganhou 10 pontos!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ Voice Assistant ══════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <HugeiconsIcon icon={Mic01Icon} size={14} color="#0D9488" />
                Powered by IA
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Fale e pronto.
                <br />
                <span className="text-gray-400">3 assistentes de voz.</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Cada módulo tem seu próprio assistente de voz com personalidade. Basta falar o que precisa e a IA transcreve, entende e executa.
              </p>
              <div className="space-y-4">
                {[
                  { name: 'Dona Sabor', desc: 'Adiciona refeições por voz', color: '#FF6B6B', emoji: 'woman-cook' },
                  { name: 'Seu Capricho', desc: 'Cria tarefas falando', color: '#F9A825', emoji: 'broom' },
                  { name: 'Tio Cofrinho', desc: 'Registra gastos por voz', color: '#4ECDC4', emoji: 'money-bag' },
                ].map((agent) => (
                  <div key={agent.name} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${agent.color}20` }}>
                      <Emoji name={agent.emoji} width={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: agent.color }}>{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <PhoneFrame>
                <div className="text-center py-4 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] flex items-center justify-center mx-auto shadow-lg relative">
                    <HugeiconsIcon icon={Mic01Icon} size={28} color="#fff" />
                    <span className="absolute inset-0 rounded-full border-2 border-[#4ECDC4] animate-pulse-ring" />
                    <span className="absolute inset-0 rounded-full border-2 border-[#4ECDC4] animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-[10px] text-gray-400">Ouvindo...</p>
                  <div className="bg-gray-50 rounded-xl p-2.5 mx-2 text-left">
                    <p className="text-[10px] text-gray-400 mb-0.5">Você disse:</p>
                    <p className="text-[12px] font-medium text-gray-800">"Adiciona frango grelhado pro almoço de quarta"</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2.5 mx-2 border border-green-100">
                    <div className="flex items-center gap-1.5 justify-center mb-0.5">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} color="#22C55E" />
                      <span className="text-[11px] font-bold text-green-700">Refeição adicionada!</span>
                    </div>
                    <p className="text-[10px] text-green-600">Frango grelhado · Quarta · Almoço</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 mx-2 text-left">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Emoji name="woman-cook" width={14} />
                      <span className="text-[10px] font-bold text-[#FF6B6B]">Dona Sabor</span>
                    </div>
                    <p className="text-[10px] text-gray-600">"Pronto! Frango grelhado adicionado para quarta no almoço."</p>
                  </div>
                </div>
              </PhoneFrame>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ How it works ══════ */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Simples de começar</h2>
            <p className="text-gray-600">Em menos de 2 minutos sua família já está jogando.</p>
          </div>
          <div className="grid sm:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Crie sua família', desc: 'Cadastre-se e adicione os membros em segundos.', emoji: 'family' },
              { step: '2', title: 'Escolha os módulos', desc: 'Ative Chef, Home ou Fin — ou todos de uma vez.', emoji: 'direct-hit' },
              { step: '3', title: 'Gamifique a rotina', desc: 'Ganhe pontos, construa streaks e suba no ranking.', emoji: 'trophy' },
              { step: '4', title: 'Veja a mágica', desc: 'Família mais organizada, engajada e conectada.', emoji: 'sparkles' },
            ].map((step) => (
              <div key={step.step} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Emoji name={step.emoji} width={32} />
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Passo {step.step}</div>
                <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Pricing ══════ */}
      <section id="pricing" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Planos para cada família</h2>
            <p className="text-gray-600 mb-8">Comece grátis. Evolua quando estiver pronto.</p>
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500'}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500'}`}
              >
                Anual <span className="ml-1 text-xs text-green-600 font-bold">-33%</span>
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border-2 transition-all ${
                  plan.popular ? 'border-[#FF6B6B] shadow-xl scale-105 bg-white' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6B6B] text-white text-xs font-bold px-4 py-1 rounded-full">Mais popular</div>
                )}
                <div className="mb-6">
                  <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {plan.price === 'R$ 0' ? 'R$ 0' : billingCycle === 'yearly' ? plan.yearlyPrice : plan.price}
                    </span>
                    {plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}
                  </div>
                  {plan.yearlyTotal && billingCycle === 'yearly' && (
                    <p className="text-xs text-green-600 mt-1">{plan.yearlyTotal}</p>
                  )}
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-6 ${
                    plan.popular ? 'bg-[#FF6B6B] text-white hover:bg-[#e55a5a]' : 'bg-gray-100 text-[#1A1A1A] hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="#22C55E" className="shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                  {plan.notIncluded.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-gray-400">
                      <HugeiconsIcon icon={Add01Icon} size={18} color="#D1D5DB" className="shrink-0 mt-0.5 rotate-45" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Testimonials ══════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Famílias que já jogam juntas</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Emoji name={t.emojiName} width={28} />
                  </div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">"{t.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i}><Emoji name="star" width={16} /></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333] rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-6 left-8 opacity-20"><Emoji name="fire" width={32} /></div>
            <div className="absolute bottom-8 right-10 opacity-20"><Emoji name="trophy" width={32} /></div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 relative">
              Pronto para organizar sua família?
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto relative">
              Comece grátis hoje e descubra como a gamificação pode transformar a rotina da sua casa.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="relative bg-white text-[#1A1A1A] px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
            >
              Criar minha família grátis
            </button>
            <p className="text-xs text-gray-400 mt-4 relative">Sem cartão de crédito necessário</p>
          </div>
        </div>
      </section>

      {/* ══════ Footer ══════ */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Logo size={24} />
                <span className="font-display font-bold">4Family</span>
              </div>
              <p className="text-sm text-gray-500">Organize sua casa como um time. Gamifique a rotina. Una a família.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-[#1A1A1A]">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-[#1A1A1A]">Preços</a></li>
                <li><a href="#how-it-works" className="hover:text-[#1A1A1A]">Como funciona</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="/termos" className="hover:text-[#1A1A1A]">Termos de Uso</a></li>
                <li><a href="/privacidade" className="hover:text-[#1A1A1A]">Privacidade</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Contato</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="mailto:contato@4family.app" className="hover:text-[#1A1A1A]">contato@4family.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} 4Family. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
