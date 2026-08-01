import { getSupabaseServer } from '@/lib/supabaseServer';
import { AnalyticsEvent } from '@/features/analytics/events/types';

/**
 * Enregistre un événement d'analytics dans la table `analytics_events`.
 * Utilisé par le middleware et les appels explicites d'API.
 */
export async function trackEvent(event: AnalyticsEvent) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from('analytics_events').insert([event]);
  if (error) {
    console.error('Failed to track analytics event:', error);
  }
  return data;
}
