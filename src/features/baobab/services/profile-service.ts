import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const getProfile = async (childId: string) => {
  const { data, error } = await supabase
    .from('baobab_profiles')
    .select('*')
    .eq('child_profile_id', childId)
    .single();
  if (error) throw error;
  return data;
};

export const upsertProfile = async (childId: string, updates: Partial<any>) => {
  const { data, error } = await supabase
    .from('baobab_profiles')
    .upsert({ child_profile_id: childId, ...updates }, { onConflict: 'child_profile_id' })
    .single();
  if (error) throw error;
  return data;
};
