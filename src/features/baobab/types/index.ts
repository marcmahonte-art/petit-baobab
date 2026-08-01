// Types for Baobab feature
export interface BaobabProfile {
  id: string;
  child_profile_id: string;
  current_level: number;
  xp: number;
  current_stage?: string;
  current_region?: string;
  tree_skin?: string;
  house_skin?: string;
  bridge_skin?: string;
  music?: string;
  background?: string;
  updated_at: string;
}

export interface BaobabAnimal {
  id: string;
  profile_id: string;
  animal_type: string;
  level: number;
  unlocked: boolean;
  equipped: boolean;
  obtained_at: string;
}

export interface BaobabRegion {
  id: string;
  profile_id: string;
  region_name: string;
  unlocked: boolean;
  progress: number;
  completed: boolean;
  updated_at: string;
}

export interface BaobabDecoration {
  id: string;
  profile_id: string;
  item_type: string;
  equipped: boolean;
  obtained_at: string;
}

export interface BaobabHistoryEvent {
  id: string;
  profile_id: string;
  event_type: string;
  title: string;
  description?: string;
  xp?: number;
  created_at: string;
}

export interface BaobabRecommendation {
  type: string;
  prompt: string;
  urgency?: string;
}
