// Placeholder hook for analytics data fetching
import useSWR from 'swr';
import { analyticsService } from '@/features/analytics/services/analytics-service';

export function useKPIs(filters: Record<string, any>) {
  const { data, error, isValidating } = useSWR(['kpis', filters], () => analyticsService.getKPIs(filters));
  return { data, error, loading: isValidating };
}

export function useDailyStats(dateFrom: string, dateTo: string) {
  const { data, error, isValidating } = useSWR(['daily', dateFrom, dateTo], () => analyticsService.getDailyStats(dateFrom, dateTo));
  return { data, error, loading: isValidating };
}

export function useSchoolStats(schoolId: string, dateFrom: string, dateTo: string) {
  const { data, error, isValidating } = useSWR(['school', schoolId, dateFrom, dateTo], () => analyticsService.getSchoolStats(schoolId, dateFrom, dateTo));
  return { data, error, loading: isValidating };
}
