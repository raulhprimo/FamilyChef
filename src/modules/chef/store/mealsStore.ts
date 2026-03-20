import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import type { Meal } from '../../../core/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type MealsState = {
  meals: Meal[];
  loading: boolean;
  fetchMeals: () => Promise<void>;
  addMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
  updateMeal: (id: string, data: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  uploadImage: (mealId: string, file: File) => Promise<string | null>;
  getMealsByWeek: (weekId: string) => Meal[];
  getMealsByDate: (date: string) => Meal[];
};

function rowToMeal(row: Record<string, unknown>): Meal {
  return {
    id: row.id as string,
    weekId: row.week_id as string,
    date: row.date as string,
    type: row.type as Meal['type'],
    dish: row.dish as string,
    responsibleIds: row.responsible_ids as string[],
    done: row.done as boolean,
    doneAt: (row.done_at as string) ?? undefined,
    imageUrl: (row.image_url as string) ?? undefined,
  };
}

export const useMealsStore = create<MealsState>((set, get) => ({
  meals: [],
  loading: true,

  fetchMeals: async () => {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data) {
      set({ meals: data.map(rowToMeal), loading: false });
    } else {
      set({ loading: false });
    }
  },

  addMeal: async (meal) => {
    const id = generateId();
    const newMeal: Meal = { ...meal, id };

    set((state) => ({ meals: [...state.meals, newMeal] }));

    await supabase.from('meals').insert({
      id,
      week_id: meal.weekId,
      date: meal.date,
      type: meal.type,
      dish: meal.dish,
      responsible_ids: meal.responsibleIds,
      done: meal.done,
      done_at: meal.doneAt ?? null,
      image_url: meal.imageUrl ?? null,
    });
  },

  updateMeal: async (id, data) => {
    set((state) => ({
      meals: state.meals.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));

    const update: Record<string, unknown> = {};
    if (data.dish !== undefined) update.dish = data.dish;
    if (data.responsibleIds !== undefined) update.responsible_ids = data.responsibleIds;
    if (data.done !== undefined) update.done = data.done;
    if (data.doneAt !== undefined) update.done_at = data.doneAt;
    if (data.imageUrl !== undefined) update.image_url = data.imageUrl;
    if (data.weekId !== undefined) update.week_id = data.weekId;
    if (data.date !== undefined) update.date = data.date;
    if (data.type !== undefined) update.type = data.type;

    await supabase.from('meals').update(update).eq('id', id);
  },

  deleteMeal: async (id) => {
    set((state) => ({
      meals: state.meals.filter((m) => m.id !== id),
    }));

    await supabase.from('meals').delete().eq('id', id);
  },

  toggleDone: async (id) => {
    const meal = get().meals.find((m) => m.id === id);
    if (!meal) return;

    const done = !meal.done;
    const doneAt = done ? new Date().toISOString() : undefined;

    set((state) => ({
      meals: state.meals.map((m) =>
        m.id === id ? { ...m, done, doneAt } : m,
      ),
    }));

    await supabase
      .from('meals')
      .update({ done, done_at: doneAt ?? null })
      .eq('id', id);
  },

  uploadImage: async (mealId, file) => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${mealId}.${ext}`;

    const { error } = await supabase.storage
      .from('meal-photos')
      .upload(path, file, { upsert: true });

    if (error) return null;

    const { data: urlData } = supabase.storage
      .from('meal-photos')
      .getPublicUrl(path);

    const imageUrl = urlData.publicUrl;
    await get().updateMeal(mealId, { imageUrl });
    return imageUrl;
  },

  getMealsByWeek: (weekId) => {
    return get().meals.filter((m) => m.weekId === weekId);
  },

  getMealsByDate: (date) => {
    return get().meals.filter((m) => m.date === date);
  },
}));
