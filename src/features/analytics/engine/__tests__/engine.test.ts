// src/features/analytics/engine/__tests__/engine.test.ts
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { trackEvent } from '@/features/analytics/engine';
import { getSupabaseServer } from '@/lib/supabaseServer';

vi.mock('@/lib/supabaseServer', () => ({
  getSupabaseServer: vi.fn()
}));

describe('trackEvent', () => {
  const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });
  const mockFrom = vi.fn(() => ({ insert: mockInsert }));
  const mockSupabase = { from: mockFrom } as any;

  beforeAll(() => {
    (getSupabaseServer as any).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should insert an event into analytics_events table', async () => {
    const dummyEvent = {
      id: 'test-id',
      name: 'test_event',
      userId: 'user-1',
      payload: { foo: 'bar' },
      timestamp: new Date().toISOString()
    } as any;
    await trackEvent(dummyEvent);
    expect(mockFrom).toHaveBeenCalledWith('analytics_events');
    expect(mockInsert).toHaveBeenCalledWith([dummyEvent]);
  });

  it('should log error on insert failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockInsert.mockResolvedValueOnce({ data: null, error: new Error('insert failed') });
    const dummyEvent = { id: 'a', name: 'b', userId: 'c', payload: {}, timestamp: '' } as any;
    await trackEvent(dummyEvent);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to track analytics event:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
