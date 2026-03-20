import { getWeekId } from './dates';

// TODO: remover em Maio 2026 após período de compatibilidade
// As chaves antigas ("familychef_*") são mantidas intactas no localStorage.

const MIGRATION_FLAG = '4family_migrated_v1';

/**
 * Migra dados do FamilyChef (localStorage) para o formato 4Family.
 * Retorna true se migração foi executada, false se já foi feita ou sem dados.
 */
export function runMigrationIfNeeded(): boolean {
  // a. Já migrou?
  if (localStorage.getItem(MIGRATION_FLAG)) {
    return false;
  }

  // b. Tem dados antigos?
  const rawMeals = localStorage.getItem('familychef_meals');
  if (!rawMeals) {
    return false;
  }

  try {
    // c/d. Parsear e transformar meals
    const oldMeals = JSON.parse(rawMeals) as Record<string, unknown>[];
    const migratedMeals = oldMeals.map((meal) => {
      const date = meal.date as string;
      let weekId = meal.weekId as string | undefined;

      // Calcular weekId se ausente
      if (!weekId && date) {
        const parsed = new Date(date + 'T12:00:00');
        weekId = getWeekId(parsed);
      }

      return {
        id: meal.id ?? `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        weekId: weekId ?? '',
        date: date ?? '',
        type: meal.type ?? 'lunch',
        dish: meal.dish ?? '',
        responsibleIds: meal.responsibleIds ?? [],
        done: meal.done ?? false,
        doneAt: meal.doneAt ?? undefined,
        imageUrl: meal.imageUrl ?? undefined,
      };
    });

    // e. Salvar meals migrados
    localStorage.setItem('4family_chef_meals', JSON.stringify(migratedMeals));

    // f. Migrar stats
    const rawStats = localStorage.getItem('familychef_stats');
    if (rawStats) {
      const oldStats = JSON.parse(rawStats);
      localStorage.setItem('4family_chef_stats', JSON.stringify(oldStats));
    }

    // g. Marcar migração como feita
    localStorage.setItem(MIGRATION_FLAG, 'true');

    // h. Sucesso
    return true;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[migration] Erro na migração:', err);
    }
    return false;
  }
}

/**
 * Diagnóstico de migração — loga estado das chaves no console.
 * Só disponível em desenvolvimento.
 */
export function diagnoseMigration(): void {
  if (!import.meta.env.DEV) return;

  console.group('[migration] Diagnóstico de chaves localStorage');

  const keys = Object.keys(localStorage);

  const familychefKeys = keys.filter((k) => k.startsWith('familychef_'));
  const fourFamilyKeys = keys.filter((k) => k.startsWith('4family_'));

  console.log('--- Chaves antigas (familychef_*) ---');
  for (const key of familychefKeys) {
    const raw = localStorage.getItem(key);
    const size = raw ? raw.length : 0;
    console.log(`  ${key}: ${size} chars`);
  }

  console.log('--- Chaves novas (4family_*) ---');
  for (const key of fourFamilyKeys) {
    const raw = localStorage.getItem(key);
    const size = raw ? raw.length : 0;
    console.log(`  ${key}: ${size} chars`);
  }

  console.log(`--- Flag de migração ---`);
  console.log(`  ${MIGRATION_FLAG}: ${localStorage.getItem(MIGRATION_FLAG) ?? '(não existe)'}`);

  console.groupEnd();
}
