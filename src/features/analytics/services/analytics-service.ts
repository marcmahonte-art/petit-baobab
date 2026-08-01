import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { AnalyticsEvent } from '@/features/analytics/events/types';
import { EventName } from '@/features/analytics/events/types';

/**
 * Service layer exposing analytics helpers.
 * All functions return raw data from Supabase – callers are responsible for handling errors.
 */
export const analyticsService = {
  async track(event: AnalyticsEvent) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from('analytics_events').insert([event]);
    if (error) console.error('Analytics track error', error);
    return data;
  },

  async getKPIs(filters: { startDate?: string; endDate?: string; schoolId?: string }) {
    const supabase = createServerSupabaseClient();
    const query = supabase
      .from('analytics_daily')
      .select('*');
    if (filters.startDate) query.gte('date', filters.startDate);
    if (filters.endDate) query.lte('date', filters.endDate);
    if (filters.schoolId) query.eq('school_id', filters.schoolId);
    const { data, error } = await query;
    if (error) console.error('getKPIs error', error);
    return data;
  },

  async getDailyStats(dateFrom: string, dateTo: string) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('analytics_daily')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo);
    if (error) console.error('getDailyStats error', error);
    return data;
  },

  async getSchoolStats(schoolId: string, dateFrom: string, dateTo: string) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('analytics_school')
      .select('*')
      .eq('school_id', schoolId)
      .gte('date', dateFrom)
      .lte('date', dateTo);
    if (error) console.error('getSchoolStats error', error);
    return data;
  },

  async getProductStats(productId: string, dateFrom: string, dateTo: string) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('analytics_products')
      .select('*')
      .eq('product_id', productId);
    if (error) console.error('getProductStats error', error);
    return data;
  },

  async generateReport(type: 'weekly' | 'monthly' | 'annual', dateFrom: string, dateTo: string) {
    // Placeholder – real implementation would generate PDF/CSV using a library.
    return { url: `/api/analytics/reports/${type}?from=${dateFrom}&to=${dateTo}` };
  },

  async exportData(format: 'csv' | 'excel', filters: Record<string, any>) {
    // Placeholder – would stream file content.
    return { url: `/api/analytics/export?format=${format}` };
  },
};
