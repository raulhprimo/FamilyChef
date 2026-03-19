import { create } from 'zustand';
import type { Meal } from '../types';

const STORAGE_KEY = 'familychef_meals';

function loadMeals(): Meal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Meal[]) : [];
  } catch {
    return [];
  }
}

function persistMeals(meals: Meal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type MealsState = {
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, data: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  toggleDone: (id: string) => void;
  getMealsByWeek: (weekId: string) => Meal[];
  getMealsByDate: (date: string) => Meal[];
};

export const useMealsStore = create<MealsState>((set, get) => ({
  meals: loadMeals(),

  addMeal: (meal) => {
    const newMeal: Meal = { ...meal, id: generateId() };
    set((state) => {
      const meals = [...state.meals, newMeal];
      persistMeals(meals);
      return { meals };
    });
  },

  updateMeal: (id, data) => {
    set((state) => {
      const meals = state.meals.map((m) =>
        m.id === id ? { ...m, ...data } : m,
      );
      persistMeals(meals);
      return { meals };
    });
  },

  deleteMeal: (id) => {
    set((state) => {
      const meals = state.meals.filter((m) => m.id !== id);
      persistMeals(meals);
      return { meals };
    });
  },

  toggleDone: (id) => {
    set((state) => {
      const meals = state.meals.map((m) =>
        m.id === id
          ? { ...m, done: !m.done, doneAt: !m.done ? new Date().toISOString() : undefined }
          : m,
      );
      persistMeals(meals);
      return { meals };
    });
  },

  getMealsByWeek: (weekId) => {
    return get().meals.filter((m) => m.weekId === weekId);
  },

  getMealsByDate: (date) => {
    return get().meals.filter((m) => m.date === date);
  },
}));
