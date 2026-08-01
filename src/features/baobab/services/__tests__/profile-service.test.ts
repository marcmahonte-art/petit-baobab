// src/features/baobab/services/__tests__/profile-service.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getProfile, upsertProfile } from '@/features/baobab/services/profile-service';

// Mock Supabase client
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
        };
        if (table === 'baobab_profiles') {
          mock.single.mockResolvedValue({ data: { id: 'uuid-1', child_profile_id: 'child-1', current_level: 2, xp: 150, updated_at: new Date().toISOString() }, error: null });
          mock.upsert.mockResolvedValue({ data: { id: 'uuid-1', child_profile_id: 'child-1', current_level: 3, xp: 300, updated_at: new Date().toISOString() }, error: null });
        } else {
          mock.single.mockResolvedValue({ data: null, error: new Error('Table not mocked') });
        }
        return mock;
      };
      return { from: mockFrom } as any;
    })
  };
});

describe('profile-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve a profile based on childId', async () => {
    const profile = await getProfile('child-1');
    expect(profile).toBeDefined();
    expect(profile.child_profile_id).toBe('child-1');
    expect(profile.current_level).toBe(2);
    expect(profile.xp).toBe(150);
  });

  it('should upsert a profile and return updated data', async () => {
    const updates = { current_level: 3, xp: 300 };
    const profile = await upsertProfile('child-1', updates);
    expect(profile).toBeDefined();
    expect(profile.current_level).toBe(3);
    expect(profile.xp).toBe(300);
  });
});
