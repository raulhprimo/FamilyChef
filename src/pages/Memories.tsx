import { useMemo, useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, Calendar03Icon } from '@hugeicons/core-free-icons';
import { useMealsStore } from '../store/mealsStore';
import { FAMILY_MEMBERS } from '../constants/members';
import { getWeekLabel, getMonday } from '../utils/dates';
import type { Meal } from '../types';

function Memories() {
  const meals = useMealsStore((s) => s.meals);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxMeal, setLightboxMeal] = useState<Meal | null>(null);

  const mealsWithImages = useMemo(() => {
    return meals
      .filter((m) => m.imageUrl && m.done)
      .filter((m) => !selectedMember || m.responsibleIds.includes(selectedMember))
      .sort((a, b) => (b.doneAt ?? b.date).localeCompare(a.doneAt ?? a.date));
  }, [meals, selectedMember]);

  const groupedByWeek = useMemo(() => {
    const groups: Record<string, Meal[]> = {};
    for (const meal of mealsWithImages) {
      if (!groups[meal.weekId]) groups[meal.weekId] = [];
      groups[meal.weekId].push(meal);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [mealsWithImages]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Image01Icon} size={22} color="#FF6B6B" aria-hidden="true" />
          <h1 className="font-display text-xl font-extrabold text-text-primary">Memórias</h1>
        </div>
        <p className="mt-1 text-sm text-text-muted">As refeições da família em fotos</p>
      </div>

      {/* Filter by member */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedMember(null)}
          className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
            !selectedMember
              ? 'bg-accent text-white'
              : 'bg-white text-text-muted border border-gray-100 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        {FAMILY_MEMBERS.map((member) => (
          <button
            key={member.id}
            onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
              selectedMember === member.id
                ? 'text-white shadow-sm'
                : 'bg-white text-text-muted border border-gray-100 hover:bg-gray-50'
            }`}
            style={
              selectedMember === member.id
                ? { backgroundColor: member.color }
                : undefined
            }
          >
            <Emoji name={member.emoji} width={16} />
            {member.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {mealsWithImages.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <Emoji name="camera-with-flash" width={36} />
          </div>
          <div className="text-center">
            <p className="font-display text-base font-bold text-text-primary">
              Nenhuma memória ainda
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Marque refeições como feitas e adicione fotos!
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groupedByWeek.map(([weekId, weekMeals]) => {
            const refDate = getMonday(new Date(weekMeals[0].date + 'T12:00:00'));
            return (
              <section key={weekId}>
                <div className="mb-3 flex items-center gap-2">
                  <HugeiconsIcon icon={Calendar03Icon} size={16} color="#6B7280" aria-hidden="true" />
                  <h2 className="text-sm font-bold text-text-muted">
                    {getWeekLabel(weekId, refDate)}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {weekMeals.map((meal) => {
                    const members = FAMILY_MEMBERS.filter((m) => meal.responsibleIds.includes(m.id));
                    return (
                      <button
                        key={meal.id}
                        onClick={() => {
                          setLightboxUrl(meal.imageUrl!);
                          setLightboxMeal(meal);
                        }}
                        className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-transform hover:scale-[1.02]"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={meal.imageUrl}
                            alt={meal.dish}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2.5">
                          <p className="truncate text-sm font-semibold text-text-primary">
                            {meal.dish}
                          </p>
                          <div className="mt-1 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {members.map((m) => (
                                <Emoji key={m.id} name={m.emoji} width={14} />
                              ))}
                            </div>
                            <span className="text-[11px] text-text-muted">
                              {formatDate(meal.date)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && lightboxMeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => {
            setLightboxUrl(null);
            setLightboxMeal(null);
          }}
        >
          <div
            className="relative max-h-[90vh] max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt={lightboxMeal.dish}
              className="max-h-[70vh] w-full object-contain"
            />
            <div className="p-4">
              <p className="font-display text-lg font-bold text-text-primary">
                {lightboxMeal.dish}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {FAMILY_MEMBERS.filter((m) => lightboxMeal.responsibleIds.includes(m.id)).map((m) => (
                  <div key={m.id} className="flex items-center gap-1">
                    <Emoji name={m.emoji} width={18} />
                    <span className="text-sm font-semibold" style={{ color: m.color }}>
                      {m.name}
                    </span>
                  </div>
                ))}
                <span className="text-sm text-text-muted">
                  · {formatDate(lightboxMeal.date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Memories;
