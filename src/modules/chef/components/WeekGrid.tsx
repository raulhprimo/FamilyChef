import { Fragment, useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useMealsStore } from '../store/mealsStore';
import {
  getWeekId,
  getWeekDays,
  getMonday,
  formatDateISO,
  formatDayHeader,
  getWeekLabel,
} from '../../../core/utils/dates';
import type { Meal, MealType } from '../../../core/types';
import MealCell from './MealCell';

const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: 'lunch', label: 'Almoço' },
  { type: 'dinner', label: 'Janta' },
];

type WeekGridProps = {
  onAddMeal: (date: string, type: MealType) => void;
  onEditMeal: (meal: Meal) => void;
  onAddPhoto: (meal: Meal) => void;
  onToggleDone: (id: string) => void;
};

function WeekGrid({ onAddMeal, onEditMeal, onAddPhoto, onToggleDone }: WeekGridProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [mobileType, setMobileType] = useState<MealType>('lunch');

  const today = useMemo(() => new Date(), []);
  const todayISO = formatDateISO(today);

  const referenceDate = useMemo(() => {
    const d = getMonday(today);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [today, weekOffset]);

  const weekDays = useMemo(() => getWeekDays(referenceDate), [referenceDate]);
  const weekId = getWeekId(referenceDate);

  const meals = useMealsStore((s) => s.meals);

  const weekMeals = useMemo(
    () => meals.filter((m) => m.weekId === weekId),
    [meals, weekId],
  );

  function findMeal(date: string, type: MealType) {
    return weekMeals.find((m) => m.date === date && m.type === type);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Navegação de semana */}
      <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          aria-label="Semana anterior"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
        </button>

        <div className="text-center">
          <span className="font-display text-base font-bold text-text-primary">
            {getWeekLabel(weekId, referenceDate)}
          </span>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="ml-2 text-xs font-semibold text-accent hover:underline"
            >
              Hoje
            </button>
          )}
        </div>

        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          aria-label="Próxima semana"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
        </button>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {MEAL_TYPES.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setMobileType(type)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                mobileType === type
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {weekDays.map((day) => {
            const iso = formatDateISO(day);
            const isToday = iso === todayISO;
            const meal = findMeal(iso, mobileType);

            return (
              <div
                key={iso}
                className={`flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm ${
                  isToday ? 'border-accent/30 ring-1 ring-accent/20' : 'border-gray-100'
                }`}
              >
                <div
                  className={`flex w-14 shrink-0 flex-col items-center rounded-xl py-1.5 ${
                    isToday ? 'bg-accent/10' : 'bg-gray-50'
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold uppercase ${
                      isToday ? 'text-accent' : 'text-text-muted'
                    }`}
                  >
                    {formatDayHeader(day).split(' ')[0]}
                  </span>
                  <span
                    className={`text-lg font-extrabold leading-tight ${
                      isToday ? 'text-accent' : 'text-text-primary'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="flex-1">
                  <MealCell
                    meal={meal}
                    mealType={mobileType}
                    onAdd={() => onAddMeal(iso, mobileType)}
                    onToggleDone={onToggleDone}
                    onEdit={onEditMeal}
                    onAddPhoto={onAddPhoto}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block">
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[700px] grid-cols-[auto_repeat(7,1fr)] gap-x-1.5 gap-y-1">
            <div />
            {weekDays.map((day) => {
              const iso = formatDateISO(day);
              const isToday = iso === todayISO;
              return (
                <div
                  key={iso}
                  className={`rounded-xl px-2 py-2 text-center text-xs font-semibold ${
                    isToday ? 'bg-accent/10 text-accent' : 'text-text-muted'
                  }`}
                >
                  {formatDayHeader(day)}
                </div>
              );
            })}

            {MEAL_TYPES.map(({ type, label }) => (
              <Fragment key={type}>
                <div className="flex items-center pr-2 text-xs font-semibold text-text-muted">
                  {label}
                </div>
                {weekDays.map((day) => {
                  const iso = formatDateISO(day);
                  const isToday = iso === todayISO;
                  const meal = findMeal(iso, type);
                  return (
                    <div
                      key={`${iso}-${type}`}
                      className={`rounded-xl ${isToday ? 'ring-2 ring-accent/30' : ''}`}
                    >
                      <MealCell
                        meal={meal}
                        mealType={type}
                        onAdd={() => onAddMeal(iso, type)}
                        onToggleDone={onToggleDone}
                        onEdit={onEditMeal}
                        onAddPhoto={onAddPhoto}
                      />
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeekGrid;
