import { useState, useRef } from 'react';
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
   Logo Component (inline SVG)
   ═══════════════════════════════════════════════════════════ */

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className="shrink-0">
      <defs>
        <linearGradient id="logo-bg-m" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="50%" stopColor="#F9A825" />
          <stop offset="100%" stopColor="#4ECDC4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#logo-bg-m)" />
      <text
        x="16"
        y="21.5"
        textAnchor="middle"
        fontFamily="system-ui,-apple-system,sans-serif"
        fontWeight="900"
        fontSize="14"
        fill="white"
        letterSpacing="-0.5"
      >
        4F
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════════ */

const MODULES = [
  {
    id: 'chef' as const,
    title: 'FamilyChef',
    subtitle: 'Planejamento de Refeições',
    description:
      'Organize o cardápio semanal, marque quem cozinhou, tire fotos para a galeria e ganhe pontos.',
    color: '#FF6B6B',
    emojiName: 'woman-cook',
    highlights: ['Cardápio semanal', 'Galeria de fotos', 'Pontos por cozinhar'],
  },
  {
    id: 'home' as const,
    title: 'FamilyHome',
    subtitle: 'Tarefas Domésticas',
    description:
      'Distribua tarefas, configure recorrências, acompanhe streaks e nudge quem esqueceu.',
    color: '#F9A825',
    emojiName: 'house',
    highlights: ['Tarefas recorrentes', 'Nudge para lembrar', 'Streaks por consistência'],
  },
  {
    id: 'fin' as const,
    title: 'FamilyFin',
    subtitle: 'Finanças Compartilhadas',
    description:
      'Registre gastos, divida contas, defina metas de economia e orçamentos por categoria.',
    color: '#4ECDC4',
    emojiName: 'money-bag',
    highlights: ['Divisão inteligente', 'Metas de economia', 'Orçamento por categoria'],
  },
];

const PLANS = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    yearlyPrice: 'R$ 0',
    period: '',
    description: 'Para famílias começando',
    features: [
      'Até 3 membros',
      'Módulo de Tarefas completo',
      '30 tarefas por mês',
      'Ranking básico',
    ],
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
    features: [
      'Até 6 membros',
      'Todos os 3 módulos',
      'Tarefas ilimitadas',
      'Ranking + badges + streaks',
      'Push notifications + nudges',
      'Assistente de voz (50/mês)',
      'Histórico de 6 meses',
    ],
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
    features: [
      'Até 10 membros',
      'Tudo do plano Família +',
      'Voz ilimitada',
      'Histórico ilimitado',
      'Relatórios em PDF',
      'Metas ilimitadas',
      'Orçamentos personalizados',
      'Suporte prioritário',
    ],
    notIncluded: [],
    cta: 'Assinar agora',
    popular: false,
  },
];

/* ═══════════════════════════════════════════════════════════
   Module Preview Cards (shown directly, no phone frame)
   ═══════════════════════════════════════════════════════════ */

function ChefCard() {
  const meals = [
    { day: 'Seg', type: 'Almoço', dish: 'Frango grelhado', who: 'Elaine', color: '#FF6B9D', done: true },
    { day: 'Seg', type: 'Janta', dish: 'Sopa de legumes', who: 'Felipe', color: '#4ECDC4', done: true },
    { day: 'Ter', type: 'Almoço', dish: 'Strogonoff', who: 'Raul', color: '#7C83FD', done: true },
    { day: 'Ter', type: 'Janta', dish: 'Omelete', who: 'Letícia', color: '#FFE66D', done: false },
  ];

  return (
    <div className="w-[300px] shrink-0 snap-center rounded-2xl bg-white border border-red-100 shadow-lg shadow-red-100/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Emoji name="fork-and-knife-with-plate" width={18} />
        <span className="font-display font-bold text-sm text-[#FF6B6B]">Cardápio da Semana</span>
        <span className="ml-auto text-[10px] text-gray-400">Sem 14</span>
      </div>
      <div className="space-y-1.5">
        {meals.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl bg-gray-50/80 px-3 py-2"
          >
            <div className="w-1 h-7 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-gray-400">{m.day}</span>
                <span className="text-[9px] text-gray-300">·</span>
                <span className="text-[10px] text-gray-400">{m.type}</span>
              </div>
              <span className="text-xs font-medium text-gray-800 truncate block leading-tight">
                {m.dish}
              </span>
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
      <div className="flex items-center gap-1.5">
        <HugeiconsIcon icon={Camera01Icon} size={14} color="#FF6B6B" />
        <span className="text-[11px] font-bold text-gray-500">Galeria de Fotos</span>
      </div>
      <div className="flex gap-2">
        {[
          { bg: 'from-orange-200 to-orange-300', label: 'Strogonoff' },
          { bg: 'from-yellow-200 to-amber-300', label: 'Feijoada' },
          { bg: 'from-green-200 to-emerald-300', label: 'Salada' },
        ].map((photo, i) => (
          <div
            key={i}
            className={`flex-1 aspect-square rounded-xl bg-gradient-to-br ${photo.bg} flex flex-col items-center justify-center`}
          >
            <Emoji name="fork-and-knife-with-plate" width={18} />
            <span className="text-[8px] font-bold text-white/90 mt-0.5 drop-shadow-sm">
              {photo.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeCard() {
  const tasks = [
    { name: 'Lavar louça', who: 'Letícia', color: '#FFE66D', done: true, cat: 'Limpeza' },
    { name: 'Compras do mês', who: 'Elaine', color: '#FF6B9D', done: false, cat: 'Compras', late: true },
    { name: 'Aspirar sala', who: 'Raul', color: '#7C83FD', done: false, cat: 'Limpeza' },
    { name: 'Trocar lâmpada', who: 'Felipe', color: '#4ECDC4', done: false, cat: 'Manutenção', urgent: true },
  ];

  return (
    <div className="w-[300px] shrink-0 snap-center rounded-2xl bg-white border border-amber-100 shadow-lg shadow-amber-100/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Emoji name="house" width={18} />
        <span className="font-display font-bold text-sm text-[#F9A825]">Tarefas de Hoje</span>
        <div className="ml-auto flex items-center gap-1">
          <Emoji name="fire" width={14} />
          <span className="text-[11px] font-bold text-orange-500">5 dias</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {tasks.map((t, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${
              t.done
                ? 'bg-green-50/60 border-green-100'
                : t.late
                  ? 'bg-red-50/60 border-red-100'
                  : 'bg-gray-50/80 border-gray-50'
            }`}
          >
            {t.done ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="#22C55E" />
            ) : (
              <span
                className="h-4 w-4 rounded-full border-2 shrink-0"
                style={{ borderColor: t.color }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-medium leading-tight ${
                    t.done ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {t.name}
                </span>
                {t.urgent && (
                  <span className="rounded bg-orange-100 px-1 py-0.5 text-[8px] font-bold text-orange-600">
                    !
                  </span>
                )}
                {t.late && (
                  <span className="rounded bg-red-100 px-1 py-0.5 text-[8px] font-bold text-red-600">
                    2d
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400">
                {t.cat} · {t.who}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <div className="w-10 h-10 rounded-full bg-[#F9A825] flex items-center justify-center shadow-lg shadow-amber-200">
          <HugeiconsIcon icon={Add01Icon} size={20} color="#fff" />
        </div>
      </div>
    </div>
  );
}

function FinCard() {
  const cats = [
    { name: 'Mercado', pct: 45, color: '#4ECDC4' },
    { name: 'Contas', pct: 30, color: '#7C83FD' },
    { name: 'Lazer', pct: 15, color: '#FF6B6B' },
    { name: 'Outros', pct: 10, color: '#F9A825' },
  ];

  return (
    <div className="w-[300px] shrink-0 snap-center rounded-2xl bg-white border border-teal-100 shadow-lg shadow-teal-100/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Emoji name="money-bag" width={18} />
        <span className="font-display font-bold text-sm text-[#4ECDC4]">Resumo do Mês</span>
        <span className="ml-auto text-[10px] text-gray-400">Abril 2026</span>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-[#4ECDC4] to-[#3AB8B0] p-3 text-white text-center">
        <span className="text-[10px] opacity-80">Total de gastos</span>
        <div className="text-xl font-extrabold">R$ 3.450,00</div>
      </div>
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
      <div className="rounded-xl bg-gray-50 p-2.5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Emoji name="direct-hit" width={12} />
            <span className="text-[10px] font-semibold text-gray-700">Viagem em família</span>
          </div>
          <span className="text-[10px] font-bold text-[#7C83FD]">56%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full bg-[#7C83FD]" style={{ width: '56%' }} />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-gray-400">
          <span>R$ 2.800</span>
          <span>R$ 5.000</span>
        </div>
      </div>
      <div className="rounded-xl bg-gray-50 p-2.5">
        <span className="text-[10px] font-semibold text-gray-600 block mb-1.5">Quem deve quem</span>
        <div className="flex items-center justify-between text-xs">
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
   Main Mobile Landing Page
   ═══════════════════════════════════════════════════════════ */

export default function LandingPageMobile() {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState(1); // 0=Grátis, 1=Família, 2=Família+
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] pb-20">
      {/* ══════ Sticky Nav ══════ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <span className="font-display font-bold text-lg tracking-tight">4Family</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#1A1A1A] text-white px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-transform"
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* ══════ Hero ══════ */}
      <section className="relative overflow-hidden px-5 pt-10 pb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-yellow-50 to-teal-50 opacity-60" />
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm mb-5 border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <HugeiconsIcon icon={Mic01Icon} size={12} color="#6B7280" />
            Novo: Assistente de voz com IA
          </div>
          <h1 className="font-display text-[2rem] leading-[1.15] font-extrabold tracking-tight mb-4">
            Organize sua casa
            <br />
            <span className="bg-gradient-to-r from-[#FF6B6B] via-[#F9A825] to-[#4ECDC4] bg-clip-text text-transparent">
              como um time
            </span>
          </h1>
          <p className="text-base text-gray-600 mb-6 leading-relaxed max-w-sm mx-auto">
            Refeições, tarefas e finanças — tudo gamificado. Pontos, streaks e rankings para
            transformar a rotina em diversão.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#1A1A1A] text-white px-6 py-4 rounded-2xl text-base font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-black/10"
          >
            Começar grátis
          </button>
          <p className="text-xs text-gray-400 mt-3">Sem cartão de crédito. Cancele quando quiser.</p>
        </div>
      </section>

      {/* ══════ Social Proof Bar ══════ */}
      <section className="bg-white border-y border-gray-100 py-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '3-em-1', sub: 'Plataforma única', icon: Target01Icon },
            { label: 'PWA', sub: 'Qualquer dispositivo', icon: Home01Icon },
            { label: 'Real-time', sub: 'Sincronização', icon: RepeatIcon },
            { label: 'IA', sub: 'Assistente de voz', icon: Mic01Icon },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 rounded-xl bg-gray-50 p-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <HugeiconsIcon icon={item.icon} size={16} color="#1A1A1A" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1A1A1A]">{item.label}</div>
                <div className="text-[10px] text-gray-500">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Modules — Horizontal Scroll Cards ══════ */}
      <section className="py-10">
        <div className="px-5 mb-6">
          <h2 className="font-display text-2xl font-bold mb-2">
            3 módulos, 1 família organizada
          </h2>
          <p className="text-sm text-gray-500">
            Deslize para ver cada módulo em ação
          </p>
        </div>

        {/* Module name pills */}
        <div className="flex gap-2 px-5 mb-4">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                const el = document.getElementById(`card-${m.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors"
              style={{
                borderColor: m.color,
                color: m.color,
                backgroundColor: `${m.color}10`,
              }}
            >
              <Emoji name={m.emojiName} width={14} />
              {m.title}
            </button>
          ))}
        </div>

        {/* Horizontal scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 pb-4 scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div id="card-chef">
            <ChefCard />
          </div>
          <div id="card-home">
            <HomeCard />
          </div>
          <div id="card-fin">
            <FinCard />
          </div>
          {/* Spacer so last card can center */}
          <div className="w-1 shrink-0" />
        </div>

        {/* Module descriptions below */}
        <div className="px-5 mt-4 space-y-3">
          {MODULES.map((m) => (
            <div key={m.id} className="rounded-2xl bg-white p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${m.color}15` }}
                >
                  <Emoji name={m.emojiName} width={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm" style={{ color: m.color }}>
                    {m.title}
                  </h3>
                  <p className="text-[10px] text-gray-400">{m.subtitle}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">{m.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {m.highlights.map((h) => (
                  <span
                    key={h}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${m.color}12`, color: m.color }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Gamification Stats ══════ */}
      <section className="py-10 bg-white">
        <div className="px-5">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 rounded-full px-3 py-1.5 text-xs font-medium mb-4">
            <HugeiconsIcon icon={Award02Icon} size={14} color="#C2410C" />
            Gamificação
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Gamificação que{' '}
            <span className="bg-gradient-to-r from-[#FF6B6B] to-[#F9A825] bg-clip-text text-transparent">
              engaja toda a família
            </span>
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Pontos por cada tarefa, streaks por consistência, badges por conquistas e rankings
            semanais. Seus filhos vão querer ajudar em casa.
          </p>

          {/* Ranking preview card */}
          <div className="rounded-2xl bg-gray-50 p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Emoji name="trophy" width={18} />
              <span className="font-display font-bold text-sm">Ranking Semanal</span>
            </div>
            <div className="flex items-end justify-center gap-4 py-2">
              {/* 2nd */}
              <div className="text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center bg-[#FF6B9D]/10">
                  <Emoji name="woman" width={22} />
                </div>
                <div className="w-14 rounded-t-lg bg-gray-200 flex flex-col items-center justify-center h-12">
                  <span className="text-xs font-bold text-gray-400">2</span>
                  <span className="text-[10px] font-bold text-gray-600">380</span>
                </div>
              </div>
              {/* 1st */}
              <div className="text-center -mt-2">
                <div className="flex justify-center mb-1">
                  <Emoji name="crown" width={16} />
                </div>
                <div className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center bg-[#4ECDC4]/10">
                  <Emoji name="man" width={22} />
                </div>
                <div className="w-14 rounded-t-lg bg-gradient-to-t from-amber-200 to-amber-100 flex flex-col items-center justify-center h-16">
                  <span className="text-xs font-bold text-amber-500">1</span>
                  <span className="text-[10px] font-bold text-gray-700">520</span>
                </div>
              </div>
              {/* 3rd */}
              <div className="text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center bg-[#7C83FD]/10">
                  <Emoji name="man" width={22} />
                </div>
                <div className="w-14 rounded-t-lg bg-gray-100 flex flex-col items-center justify-center h-9">
                  <span className="text-xs font-bold text-gray-400">3</span>
                  <span className="text-[10px] font-bold text-gray-600">290</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Award02Icon, title: 'Pontos', desc: 'Ganhe por cada ação', color: '#FF6B6B', bg: 'bg-red-50' },
              { icon: FireIcon, title: 'Streaks', desc: 'Mantenha a consistência', color: '#F9A825', bg: 'bg-amber-50' },
              { icon: RankingIcon, title: 'Rankings', desc: 'Compita em família', color: '#7C83FD', bg: 'bg-purple-50' },
              { icon: Target01Icon, title: 'Badges', desc: 'Desbloqueie conquistas', color: '#4ECDC4', bg: 'bg-teal-50' },
            ].map((item) => (
              <div key={item.title} className={`rounded-2xl ${item.bg} p-4`}>
                <HugeiconsIcon icon={item.icon} size={22} color={item.color} />
                <h4 className="font-bold text-sm mt-2">{item.title}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Badges row */}
          <div className="mt-5">
            <span className="text-xs font-bold text-gray-500 block mb-2">Badges para desbloquear</span>
            <div className="flex gap-2">
              {[
                { emoji: 'crown', bg: 'bg-amber-50' },
                { emoji: 'fire', bg: 'bg-orange-50' },
                { emoji: 'star', bg: 'bg-purple-50' },
                { emoji: 'check-mark-button', bg: 'bg-green-50' },
                { emoji: 'sparkles', bg: 'bg-blue-50' },
              ].map((b, i) => (
                <div key={i} className={`w-11 h-11 ${b.bg} rounded-xl flex items-center justify-center`}>
                  <Emoji name={b.emoji} width={22} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ PWA Install Hint ══════ */}
      <section className="py-10 px-5">
        <div className="rounded-2xl bg-gradient-to-br from-[#7C83FD] to-[#4ECDC4] p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Emoji name="mobile-phone" width={20} />
            <span className="font-display font-bold text-sm">Instale como um App</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed mb-5">
            4Family é um PWA — funciona como app nativo direto do navegador. Sem app store, sem downloads pesados.
          </p>
          <div className="space-y-3">
            {[
              { icon: Home01Icon, text: 'Adicione à tela inicial', desc: 'Use como app nativo' },
              { icon: RepeatIcon, text: 'Sync em tempo real', desc: 'Toda a família conectada' },
              { icon: Clock01Icon, text: 'Push notifications', desc: 'Lembretes e nudges' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={item.icon} size={18} color="#fff" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.text}</div>
                  <div className="text-xs opacity-75">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Voice Assistant ══════ */}
      <section className="py-10 bg-white px-5">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 text-xs font-medium mb-4">
            <HugeiconsIcon icon={Mic01Icon} size={14} color="#1D4ED8" />
            Assistente de voz
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Fale, e o app{' '}
            <span className="bg-gradient-to-r from-[#7C83FD] to-[#4ECDC4] bg-clip-text text-transparent">
              resolve
            </span>
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Use comandos de voz para adicionar tarefas, registrar gastos ou planejar refeições.
            Mãos ocupadas? Sem problema.
          </p>
        </div>

        {/* Voice examples */}
        <div className="space-y-2.5">
          {[
            { text: '"Adiciona comprar leite para segunda"', module: 'FamilyHome', color: '#F9A825' },
            { text: '"Gastei 45 reais no mercado"', module: 'FamilyFin', color: '#4ECDC4' },
            { text: '"Jantar de hoje é macarrão"', module: 'FamilyChef', color: '#FF6B6B' },
          ].map((ex) => (
            <div
              key={ex.text}
              className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${ex.color}20` }}
              >
                <HugeiconsIcon icon={Mic01Icon} size={16} color={ex.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 italic truncate">{ex.text}</p>
                <span className="text-[10px] font-bold" style={{ color: ex.color }}>
                  {ex.module}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Pricing — Tabs ══════ */}
      <section id="pricing" className="py-10 px-5">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-bold mb-2">Planos simples</h2>
          <p className="text-sm text-gray-500">Escolha o melhor para sua família</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Anual
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                billingCycle === 'yearly'
                  ? 'bg-green-400 text-white'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              -33%
            </span>
          </button>
        </div>

        {/* Plan tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {PLANS.map((plan, i) => (
            <button
              key={plan.name}
              onClick={() => setActivePlan(i)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors relative ${
                activePlan === i ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500'
              }`}
            >
              {plan.name}
              {plan.popular && (
                <span className="absolute -top-1.5 right-1 text-[8px] font-bold text-white bg-gradient-to-r from-[#FF6B6B] to-[#F9A825] px-1.5 py-0.5 rounded-full">
                  Popular
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active plan card */}
        {(() => {
          const plan = PLANS[activePlan];
          const displayPrice = billingCycle === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.price;
          const displayPeriod = plan.period ? '/mês' : '';

          return (
            <div
              className={`rounded-2xl p-5 border-2 ${
                plan.popular ? 'border-[#F9A825] bg-white shadow-lg shadow-amber-100/40' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="text-center mb-4">
                <h3 className="font-display font-bold text-lg mb-0.5">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-extrabold">{displayPrice}</span>
                  {displayPeriod && <span className="text-sm text-gray-400">{displayPeriod}</span>}
                </div>
                {billingCycle === 'yearly' && plan.yearlyTotal && (
                  <p className="text-xs text-gray-400 mt-1">{plan.yearlyTotal}</p>
                )}
              </div>

              <div className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="#22C55E" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 opacity-40">
                    <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                    <span className="text-sm text-gray-500 line-through">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/login')}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform ${
                  plan.popular
                    ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/10'
                    : 'bg-gray-100 text-[#1A1A1A]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          );
        })()}
      </section>

      {/* ══════ Testimonials ══════ */}
      <section className="py-10 bg-white px-5">
        <h2 className="font-display text-2xl font-bold text-center mb-6">
          Famílias que{' '}
          <span className="bg-gradient-to-r from-[#FF6B6B] to-[#F9A825] bg-clip-text text-transparent">
            amam o 4Family
          </span>
        </h2>
        <div className="space-y-3">
          {[
            { name: 'Ana M.', role: 'Mãe de 3 filhos', text: 'Meus filhos agora disputam quem faz mais tarefas! O ranking virou a diversão da família.', emojiName: 'woman' },
            { name: 'Carlos R.', role: 'Pai e cozinheiro', text: 'O planejamento de refeições salvou nossas noites. Sem mais estresse decidindo o jantar.', emojiName: 'man-cook' },
            { name: 'Juliana S.', role: 'Mãe organizada', text: 'Finalmente as finanças da casa estão transparentes. Todo mundo sabe quem deve o quê.', emojiName: 'woman-office-worker' },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Emoji name={t.emojiName} width={24} />
                </div>
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-[10px] text-gray-400">{t.role}</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Final CTA ══════ */}
      <section className="py-12 px-5">
        <div className="rounded-3xl bg-gradient-to-br from-[#FF6B6B] via-[#F9A825] to-[#4ECDC4] p-6 text-center text-white">
          <Emoji name="family" width={40} />
          <h2 className="font-display text-2xl font-bold mt-3 mb-2">
            Comece a organizar sua família hoje
          </h2>
          <p className="text-sm opacity-90 mb-5">
            Gratuito para começar. Sem cartão de crédito.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white text-[#1A1A1A] py-4 rounded-2xl text-base font-bold active:scale-[0.98] transition-transform shadow-lg"
          >
            Criar conta grátis
          </button>
        </div>
      </section>

      {/* ══════ Footer ══════ */}
      <footer className="bg-white border-t border-gray-100 py-6 px-5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Logo size={20} />
          <span className="font-display font-bold text-sm">4Family</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-3">
          <a href="/termos" className="hover:text-gray-600">Termos</a>
          <span>·</span>
          <a href="/privacidade" className="hover:text-gray-600">Privacidade</a>
        </div>
        <p className="text-[10px] text-gray-300 text-center">
          &copy; 2026 4Family. Todos os direitos reservados.
        </p>
      </footer>

      {/* ══════ Sticky CTA at Bottom ══════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 safe-bottom">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-gradient-to-r from-[#FF6B6B] via-[#F9A825] to-[#4ECDC4] text-white py-3.5 rounded-2xl text-sm font-bold active:scale-[0.98] transition-transform shadow-lg shadow-orange-200/40"
        >
          Começar grátis
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#fff" className="inline ml-1.5 -mt-0.5" />
        </button>
      </div>
    </div>
  );
}
