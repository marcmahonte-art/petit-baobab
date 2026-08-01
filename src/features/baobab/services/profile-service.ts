import { createClient } from '@supabase/supabase-js';
import type { BaobabProfile } from '@/features/baobab/types';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const getProfile = async (childId: string): Promise<BaobabProfile> => {
  const { data, error } = await supabase
    .from('baobab_profiles')
    .select('*')
    .eq('child_profile_id', childId)
    .single();
  if (error) throw error;
  return data as BaobabProfile;
};

export const upsertProfile = async (childId: string, updates: Partial<BaobabProfile>): Promise<BaobabProfile> => {
  const { data, error } = await supabase
    .from('baobab_profiles')
    .upsert({ child_profile_id: childId, ...updates }, { onConflict: 'child_profile_id' })
    .single();
  if (error) throw error;
  return data as BaobabProfile;
};
