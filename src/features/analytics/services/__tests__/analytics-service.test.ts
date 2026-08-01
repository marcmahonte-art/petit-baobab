// src/features/analytics/services/__tests__/analytics-service.test.ts
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { analyticsService } from '@/features/analytics/services/analytics-service';
import { getSupabaseServer } from '@/lib/supabaseServer';

vi.mock('@/lib/supabaseServer', () => ({
  getSupabaseServer: vi.fn()
}));

describe('analyticsService', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (onFulfilled: (value: unknown) => unknown) =>
        Promise.resolve({ data: [{ id: 1 }], error: null }).then(onFulfilled)
    }))
  } as any;

  beforeAll(() => {
    (getSupabaseServer as any).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getKPIs should apply filters and return data', async () => {
    const filters = { startDate: '2023-01-01', endDate: '2023-01-31' };
    const data = await analyticsService.getKPIs(filters);
    expect(mockSupabase.from).toHaveBeenCalledWith('analytics_daily');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('generateReport returns a URL placeholder', async () => {
    const report = await analyticsService.generateReport('weekly', '2023-01-01', '2023-01-07');
    expect(report).toHaveProperty('url');
    expect(report.url).toContain('/api/analytics/reports/weekly');
  });
});
