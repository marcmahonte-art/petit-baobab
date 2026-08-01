// src/features/baobab/services/animal-service.ts
import { supabase } from '@/lib/supabaseClient';
import { BaobabAnimal } from '@/features/baobab/types';

export const getAnimals = async (childId: string): Promise<BaobabAnimal[]> => {
  const { data, error } = await supabase
    .from('baobab_animals')
    .select('*')
    .eq('profile_id', (await getProfileId(childId)))
    .order('animal_type');
  if (error) throw error;
  return data as BaobabAnimal[];
};

export const addAnimal = async (
  childId: string,
  payload: { animal_type: string; level?: number }
): Promise<BaobabAnimal> => {
  const profileId = await getProfileId(childId);
  const { data, error } = await supabase
    .from('baobab_animals')
    .insert({
      profile_id: profileId,
      animal_type: payload.animal_type,
      level: payload.level ?? 1,
      unlocked: true,
    })
    .single();
  if (error) throw error;
  return data as BaobabAnimal;
};

// Helper to fetch the baobab profile id for a child
const getProfileId = async (childId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('baobab_profiles')
    .select('id')
    .eq('child_profile_id', childId)
    .single();
  if (error) throw error;
  return data.id as string;
};
