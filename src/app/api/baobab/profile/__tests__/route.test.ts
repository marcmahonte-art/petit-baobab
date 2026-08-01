// src/app/api/baobab/profile/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from '@/app/api/baobab/profile/route';
import { createRequest } from 'node-mocks-http';
import { supabase } from '@/lib/supabaseClient';

vi.mock('@/lib/supabaseClient', () => {
  const mockFrom = (table: string) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      upsert: vi.fn().mockReturnThis(),
    };
    if (table === 'baobab_profiles') {
      mock.single.mockResolvedValue({
        data: {
          id: 'prof-1',
          child_profile_id: 'child-1',
          current_level: 2,
          xp: 120,
          updated_at: new Date().toISOString(),
        },
        error: null,
      });
      mock.upsert.mockResolvedValue({
        data: {
          id: 'prof-1',
          child_profile_id: 'child-1',
          current_level: 3,
          xp: 300,
          updated_at: new Date().toISOString(),
        },
        error: null,
      });
    }
    return mock;
  };
  return { supabase: { from: mockFrom } };
});

describe('GET /api/baobab/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the profile for an authenticated child', async () => {
    // Mock supabase.auth.getUser() inside the route file
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: { user: { id: 'child-1' } }, error: null } as any);
    const res = await GET();
    const json = await res.json();
    expect(json.child_profile_id).toBe('child-1');
    expect(json.current_level).toBe(2);
  });
});

describe('PATCH /api/baobab/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the profile and returns the new data', async () => {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: { user: { id: 'child-1' } }, error: null } as any);
    const req = createRequest({ method: 'PATCH', body: JSON.stringify({ current_level: 3, xp: 300 }) });
    const res = await PATCH(req as any);
    const json = await res.json();
    expect(json.current_level).toBe(3);
    expect(json.xp).toBe(300);
  });
});
