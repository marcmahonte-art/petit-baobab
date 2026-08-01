// src/features/baobab/services/region-service.ts
import { supabase } from '@/lib/supabaseClient';
import { BaobabRegion } from '@/features/baobab/types';

export const getRegions = async (childId: string): Promise<BaobabRegion[]> => {
  const { data, error } = await supabase
    .from('baobab_regions')
    .select('*')
    .eq('profile_id', (await getProfileId(childId)));
  if (error) throw error;
  return data as BaobabRegion[];
};

export const unlockRegion = async (childId: string, regionName: string): Promise<BaobabRegion> => {
  const profileId = await getProfileId(childId);
  const { data, error } = await supabase
    .from('baobab_regions')
    .upsert({ profile_id: profileId, region_name: regionName, unlocked: true }, { onConflict: 'profile_id,region_name' })
    .single();
  if (error) throw error;
  return data as BaobabRegion;
};

// Helper – fetch profile id
const getProfileId = async (childId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('baobab_profiles')
    .select('id')
    .eq('child_profile_id', childId)
    .single();
  if (error) throw error;
  return data.id as string;
};
