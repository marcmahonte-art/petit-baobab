// src/features/baobab/services/__tests__/animal-service.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getAnimals, addAnimal } from '@/features/baobab/services/animal-service';

vi.mock('@supabase/supabase-js', () => {
  const actual = vi.importActual('@supabase/supabase-js');
  return {
    ...actual,
    createClient: vi.fn(() => {
      const mockFrom = (table: string) => {
        const mock = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
          upsert: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
        };
        if (table === 'baobab_animals') {
          mock.select.mockReturnThis();
          mock.eq.mockReturnThis();
          mock.single.mockResolvedValue({ data: [{ id: 'a1', animal_type: 'lion', level: 1, unlocked: true, equipped: false }], error: null });
          mock.insert.mockResolvedValue({ data: { id: 'a2', animal_type: 'giraffe', level: 1, unlocked: true, equipped: false }, error: null });
        }
        return mock;
      };
      return { from: mockFrom } as any;
    })
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
