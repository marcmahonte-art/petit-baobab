-- ============================================================
-- Petit Baobab - Coach Pedagogique Adaptatif (IA) - PHASE 10
-- Profil d'apprentissage, recommandations, predictions,
-- sessions, dialogue, plans journalier/hebdomadaire/mensuel.
-- Le contenu canonique (themes, activites) est seede par
-- l'application (seedLearningCoach) de facon idempotente.
-- ============================================================

-- 1. learning_profiles (profil IA de l'enfant)
CREATE TABLE IF NOT EXISTS public.learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  preferred_topics TEXT[] NOT NULL DEFAULT '{}',
  preferred_activity TEXT NOT NULL DEFAULT 'COLORING',
  average_session INTEGER NOT NULL DEFAULT 0,
  favorite_animals TEXT[] NOT NULL DEFAULT '{}',
  favorite_colors TEXT[] NOT NULL DEFAULT '{}',
  favorite_styles TEXT[] NOT NULL DEFAULT '{}',
  favorite_books TEXT[] NOT NULL DEFAULT '{}',
  motivation_score INTEGER NOT NULL DEFAULT 50 CHECK (motivation_score >= 0 AND motivation_score <= 100),
  attention_score INTEGER NOT NULL DEFAULT 50 CHECK (attention_score >= 0 AND attention_score <= 100),
  creativity_score INTEGER NOT NULL DEFAULT 50 CHECK (creativity_score >= 0 AND creativity_score <= 100),
  logic_score INTEGER NOT NULL DEFAULT 50 CHECK (logic_score >= 0 AND logic_score <= 100),
  reading_score INTEGER NOT NULL DEFAULT 50 CHECK (reading_score >= 0 AND reading_score <= 100),
  drawing_score INTEGER NOT NULL DEFAULT 50 CHECK (drawing_score >= 0 AND drawing_score <= 100),
  last_analysis TIMESTAMPTZ,
  confidence_score INTEGER NOT NULL DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id)
);
CREATE INDEX IF NOT EXISTS idx_learning_profiles_child ON public.learning_profiles(child_id);

-- 2. learning_preferences (preferences detaillees par categorie)
CREATE TABLE IF NOT EXISTS public.learning_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('animals','colors','styles','books','topics','activities')),
  items TEXT[] NOT NULL DEFAULT '{}',
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 1 AND weight <= 10),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, category)
);
CREATE INDEX IF NOT EXISTS idx_learning_preferences_child ON public.learning_preferences(child_id, category);

-- 3. learning_recommendations (recommandations IA)
CREATE TABLE IF NOT EXISTS public.learning_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'COLORING',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  duration INTEGER NOT NULL DEFAULT 10,
  reward_xp INTEGER NOT NULL DEFAULT 10,
  reward_stars INTEGER NOT NULL DEFAULT 1,
  resource_type TEXT,
  resource_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','ignored','completed','succeeded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_child ON public.learning_recommendations(child_id, status);

-- 4. learning_predictions (predictions de progression)
CREATE TABLE IF NOT EXISTS public.learning_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  next_level INTEGER NOT NULL DEFAULT 1,
  next_skill TEXT NOT NULL DEFAULT 'reading',
  predicted_xp INTEGER NOT NULL DEFAULT 0,
  predicted_week_xp INTEGER NOT NULL DEFAULT 0,
  estimated_hours_to_next_level INTEGER NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  model TEXT NOT NULL DEFAULT 'rule-based',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id)
);
CREATE INDEX IF NOT EXISTS idx_learning_predictions_child ON public.learning_predictions(child_id);

-- 5. learning_statistics (stats + radar de competences - PHASE 9)
-- Reutilisee pour le radar pedagogique 8 axes de PHASE 10.
CREATE TABLE IF NOT EXISTS public.learning_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  creativity INTEGER NOT NULL DEFAULT 0 CHECK (creativity >= 0 AND creativity <= 100),
  reading INTEGER NOT NULL DEFAULT 0 CHECK (reading >= 0 AND reading <= 100),
  observation INTEGER NOT NULL DEFAULT 0 CHECK (observation >= 0 AND observation <= 100),
  logic INTEGER NOT NULL DEFAULT 0 CHECK (logic >= 0 AND logic <= 100),
  perseverance INTEGER NOT NULL DEFAULT 0 CHECK (perseverance >= 0 AND perseverance <= 100),
  imagination INTEGER NOT NULL DEFAULT 0 CHECK (imagination >= 0 AND imagination <= 100),
  concentration INTEGER NOT NULL DEFAULT 0 CHECK (concentration >= 0 AND concentration <= 100),
  communication INTEGER NOT NULL DEFAULT 0 CHECK (communication >= 0 AND communication <= 100),
  motor_skills INTEGER NOT NULL DEFAULT 0 CHECK (motor_skills >= 0 AND motor_skills <= 100),
  total_xp INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  missions_completed INTEGER NOT NULL DEFAULT 0,
  regions_unlocked INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id)
);
CREATE INDEX IF NOT EXISTS idx_learning_statistics_child ON public.learning_statistics(child_id);

-- 6. learning_strengths (forces detectees)
CREATE TABLE IF NOT EXISTS public.learning_strengths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  evidence TEXT NOT NULL DEFAULT '',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_strengths_child ON public.learning_strengths(child_id, skill);

-- 7. learning_weaknesses (points de vigilance)
CREATE TABLE IF NOT EXISTS public.learning_weaknesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  suggestion TEXT NOT NULL DEFAULT '',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_weaknesses_child ON public.learning_weaknesses(child_id, skill);

-- 8. learning_sessions (sessions d'apprentissage)
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'COLORING',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  stars_earned INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_child ON public.learning_sessions(child_id, started_at);

-- 9. coach_messages (dialogue avec le coach)
CREATE TABLE IF NOT EXISTS public.coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('child','coach')),
  content TEXT NOT NULL,
  intent TEXT NOT NULL DEFAULT 'general',
  filtered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coach_messages_child ON public.coach_messages(child_id, created_at);

-- 10. coach_history (historique IA)
CREATE TABLE IF NOT EXISTS public.coach_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'done',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coach_history_child ON public.coach_history(child_id, created_at);

-- 11. daily_learning_plan (plan du jour)
CREATE TABLE IF NOT EXISTS public.daily_learning_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activities TEXT[] NOT NULL DEFAULT '{}',
  completed_activities TEXT[] NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, plan_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_learning_plan_child ON public.daily_learning_plan(child_id, plan_date);

-- 12. weekly_learning_plan (plan de la semaine)
CREATE TABLE IF NOT EXISTS public.weekly_learning_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL DEFAULT CURRENT_DATE,
  goals TEXT[] NOT NULL DEFAULT '{}',
  activities TEXT[] NOT NULL DEFAULT '{}',
  completed_goals TEXT[] NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, week_start)
);
CREATE INDEX IF NOT EXISTS idx_weekly_learning_plan_child ON public.weekly_learning_plan(child_id, week_start);

-- 13. monthly_learning_report (rapport mensuel)
CREATE TABLE IF NOT EXISTS public.monthly_learning_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  report_month TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  progress_delta JSONB NOT NULL DEFAULT '{}',
  strengths TEXT[] NOT NULL DEFAULT '{}',
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, report_month)
);
CREATE INDEX IF NOT EXISTS idx_monthly_learning_report_child ON public.monthly_learning_report(child_id, report_month);

-- Trigger updated_at generique
CREATE OR REPLACE FUNCTION public.coach_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE public.learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_strengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_weaknesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_learning_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_learning_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_learning_report ENABLE ROW LEVEL SECURITY;

-- Helper RLS : enfant du compte connecte
-- (deja cree par 16_child_challenges.sql, IF NOT EXISTS pour idempotence)
CREATE OR REPLACE FUNCTION public.child_belongs_to_user(p_child_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_profiles cp
    JOIN public.accounts a ON a.id = cp.account_id
    WHERE cp.id = p_child_id AND a.user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE;

-- learning_profiles
DROP POLICY IF EXISTS "learning_profiles_select_own" ON public.learning_profiles;
CREATE POLICY "learning_profiles_select_own" ON public.learning_profiles FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_profiles_insert_own" ON public.learning_profiles;
CREATE POLICY "learning_profiles_insert_own" ON public.learning_profiles FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_profiles_update_own" ON public.learning_profiles;
CREATE POLICY "learning_profiles_update_own" ON public.learning_profiles FOR UPDATE USING (public.child_belongs_to_user(child_id));

-- learning_preferences
DROP POLICY IF EXISTS "learning_preferences_select_own" ON public.learning_preferences;
CREATE POLICY "learning_preferences_select_own" ON public.learning_preferences FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_preferences_insert_own" ON public.learning_preferences;
CREATE POLICY "learning_preferences_insert_own" ON public.learning_preferences FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_preferences_update_own" ON public.learning_preferences;
CREATE POLICY "learning_preferences_update_own" ON public.learning_preferences FOR UPDATE USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_preferences_delete_own" ON public.learning_preferences;
CREATE POLICY "learning_preferences_delete_own" ON public.learning_preferences FOR DELETE USING (public.child_belongs_to_user(child_id));

-- learning_recommendations
DROP POLICY IF EXISTS "learning_recommendations_select_own" ON public.learning_recommendations;
CREATE POLICY "learning_recommendations_select_own" ON public.learning_recommendations FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_recommendations_insert_own" ON public.learning_recommendations;
CREATE POLICY "learning_recommendations_insert_own" ON public.learning_recommendations FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_recommendations_update_own" ON public.learning_recommendations;
CREATE POLICY "learning_recommendations_update_own" ON public.learning_recommendations FOR UPDATE USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_recommendations_delete_own" ON public.learning_recommendations;
CREATE POLICY "learning_recommendations_delete_own" ON public.learning_recommendations FOR DELETE USING (public.child_belongs_to_user(child_id));

-- learning_predictions
DROP POLICY IF EXISTS "learning_predictions_select_own" ON public.learning_predictions;
CREATE POLICY "learning_predictions_select_own" ON public.learning_predictions FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_predictions_insert_own" ON public.learning_predictions;
CREATE POLICY "learning_predictions_insert_own" ON public.learning_predictions FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_predictions_update_own" ON public.learning_predictions;
CREATE POLICY "learning_predictions_update_own" ON public.learning_predictions FOR UPDATE USING (public.child_belongs_to_user(child_id));

-- learning_statistics (retrocompat PHASE 9 : colonnes manquantes si table existante)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.learning_statistics ADD COLUMN IF NOT EXISTS concentration INTEGER NOT NULL DEFAULT 0 CHECK (concentration >= 0 AND concentration <= 100);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TABLE public.learning_statistics ADD COLUMN IF NOT EXISTS communication INTEGER NOT NULL DEFAULT 0 CHECK (communication >= 0 AND communication <= 100);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER TABLE public.learning_statistics ADD COLUMN IF NOT EXISTS motor_skills INTEGER NOT NULL DEFAULT 0 CHECK (motor_skills >= 0 AND motor_skills <= 100);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

DROP POLICY IF EXISTS "learning_statistics_select_own" ON public.learning_statistics;
CREATE POLICY "learning_statistics_select_own" ON public.learning_statistics FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_statistics_insert_own" ON public.learning_statistics;
CREATE POLICY "learning_statistics_insert_own" ON public.learning_statistics FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_statistics_update_own" ON public.learning_statistics;
CREATE POLICY "learning_statistics_update_own" ON public.learning_statistics FOR UPDATE USING (public.child_belongs_to_user(child_id));

-- learning_strengths
DROP POLICY IF EXISTS "learning_strengths_select_own" ON public.learning_strengths;
CREATE POLICY "learning_strengths_select_own" ON public.learning_strengths FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_strengths_insert_own" ON public.learning_strengths;
CREATE POLICY "learning_strengths_insert_own" ON public.learning_strengths FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_strengths_update_own" ON public.learning_strengths;
CREATE POLICY "learning_strengths_update_own" ON public.learning_strengths FOR UPDATE USING (public.child_belongs_to_user(child_id));

-- learning_weaknesses
DROP POLICY IF EXISTS "learning_weaknesses_select_own" ON public.learning_weaknesses;
CREATE POLICY "learning_weaknesses_select_own" ON public.learning_weaknesses FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_weaknesses_insert_own" ON public.learning_weaknesses;
CREATE POLICY "learning_weaknesses_insert_own" ON public.learning_weaknesses FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_weaknesses_update_own" ON public.learning_weaknesses;
CREATE POLICY "learning_weaknesses_update_own" ON public.learning_weaknesses FOR UPDATE USING (public.child_belongs_to_user(child_id));

-- learning_sessions
DROP POLICY IF EXISTS "learning_sessions_select_own" ON public.learning_sessions;
CREATE POLICY "learning_sessions_select_own" ON public.learning_sessions FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_sessions_insert_own" ON public.learning_sessions;
CREATE POLICY "learning_sessions_insert_own" ON public.learning_sessions FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "learning_sessions_update_own" ON public.learning_sessions;
CREATE POLICY "learning_sessions_update_own" ON public.learning_sessions FOR UPDATE USING (public.child_belongs_to_user(child_id));

-- coach_messages
DROP POLICY IF EXISTS "coach_messages_select_own" ON public.coach_messages;
CREATE POLICY "coach_messages_select_own" ON public.coach_messages FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "coach_messages_insert_own" ON public.coach_messages;
CREATE POLICY "coach_messages_insert_own" ON public.coach_messages FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "coach_messages_update_own" ON public.coach_messages;
CREATE POLICY "coach_messages_update_own" ON public.coach_messages FOR UPDATE USING (public.child_belongs_to_user(child_id));

-- coach_history
DROP POLICY IF EXISTS "coach_history_select_own" ON public.coach_history;
CREATE POLICY "coach_history_select_own" ON public.coach_history FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "coach_history_insert_own" ON public.coach_history;
CREATE POLICY "coach_history_insert_own" ON public.coach_history FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "coach_history_delete_own" ON public.coach_history;
CREATE POLICY "coach_history_delete_own" ON public.coach_history FOR DELETE USING (public.child_belongs_to_user(child_id));

-- daily_learning_plan
DROP POLICY IF EXISTS "daily_learning_plan_select_own" ON public.daily_learning_plan;
CREATE POLICY "daily_learning_plan_select_own" ON public.daily_learning_plan FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "daily_learning_plan_insert_own" ON public.daily_learning_plan;
CREATE POLICY "daily_learning_plan_insert_own" ON public.daily_learning_plan FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "daily_learning_plan_update_own" ON public.daily_learning_plan;
CREATE POLICY "daily_learning_plan_update_own" ON public.daily_learning_plan FOR UPDATE USING (public.child_belongs_to_user(child_id));

-- weekly_learning_plan
DROP POLICY IF EXISTS "weekly_learning_plan_select_own" ON public.weekly_learning_plan;
CREATE POLICY "weekly_learning_plan_select_own" ON public.weekly_learning_plan FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "weekly_learning_plan_insert_own" ON public.weekly_learning_plan;
CREATE POLICY "weekly_learning_plan_insert_own" ON public.weekly_learning_plan FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "weekly_learning_plan_update_own" ON public.weekly_learning_plan;
CREATE POLICY "weekly_learning_plan_update_own" ON public.weekly_learning_plan FOR UPDATE USING (public.child_belongs_to_user(child_id));

-- monthly_learning_report
DROP POLICY IF EXISTS "monthly_learning_report_select_own" ON public.monthly_learning_report;
CREATE POLICY "monthly_learning_report_select_own" ON public.monthly_learning_report FOR SELECT USING (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "monthly_learning_report_insert_own" ON public.monthly_learning_report;
CREATE POLICY "monthly_learning_report_insert_own" ON public.monthly_learning_report FOR INSERT WITH CHECK (public.child_belongs_to_user(child_id));
DROP POLICY IF EXISTS "monthly_learning_report_update_own" ON public.monthly_learning_report;
CREATE POLICY "monthly_learning_report_update_own" ON public.monthly_learning_report FOR UPDATE USING (public.child_belongs_to_user(child_id));
