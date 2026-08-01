// src/features/baobab/services/__tests__/animal-service.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getAnimals, addAnimal } from '@/features/baobab/services/animal-service';

vi.mock('@/lib/supabaseClient', () => {
  const makeQuery = (defaultResult: { data: any; error: any }, insertResult: { data: any; error: any }) => {
    const query: any = {};
    for (const m of ['select', 'eq', 'order', 'ilike', 'limit', 'maybeSingle']) {
      query[m] = () => query;
    }
    query.insert = () => {
      query.single = () => insertResult;
      return query;
    };
    query.single = () => defaultResult;
    query.then = (resolve: (value: any) => void) => Promise.resolve(defaultResult).then(resolve);
    return query;
  };

  return {
    supabase: {
      from: (table: string) =>
        table === 'baobab_profiles'
          ? makeQuery({ data: { id: 'prof-1' }, error: null }, { data: { id: 'prof-1' }, error: null })
          : makeQuery(
              { data: [{ id: 'a1', animal_type: 'lion', level: 1, unlocked: true, equipped: false }], error: null },
              { data: { id: 'a2', animal_type: 'giraffe', level: 1, unlocked: true, equipped: false }, error: null }
            ),
    },
  };
});

describe('animal-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch animals for a child', async () => {
    const animals = await getAnimals('child-1');
    expect(animals).toBeInstanceOf(Array);
    expect(animals[0].animal_type).toBe('lion');
  });

  it('should add a new animal', async () => {
    const newAnimal = await addAnimal('child-1', { animal_type: 'giraffe' });
    expect(newAnimal).toBeDefined();
    expect(newAnimal.animal_type).toBe('giraffe');
  });
});
