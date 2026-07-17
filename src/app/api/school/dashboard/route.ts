import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/school/dashboard
 * Retourne toutes les données nécessaires au tableau de bord enseignant.
 *  - Solde d'étoiles et limite mensuelle
 *  - Liste des classes avec statistiques
 *  - Activité récente (10 dernières actions)
 *  - Résumé global
 */
export async function GET() {
  const supabase = await getSupabaseServer();

  // 1️⃣ Récupérer le compte de l'enseignant (via le token sb-access-token)
  const { data: account, error: accErr } = await supabase
    .from('accounts')
    .select('id, stars_balance, plan, plan_renewed_at')
    .single();

  if (accErr || !account) {
    return NextResponse.json({ error: 'Compte non trouvé' }, { status: 401 });
  }

  const accountId = account.id;

  // 2️⃣ Classes avec statistiques via CTEs (simplifié)
  const { data: classes, error: clsErr } = await supabase.rpc('get_classrooms_with_stats', {
    p_account_id: accountId,
  });

  // 3️⃣ Dernières activités (union des tables) – on utilise une vue simplifiée
  const { data: recentActivities, error: actErr } = await supabase
    .from('student_activities')
    .select(
      `id, profile_id, action, stars_used, points_earned, metadata, created_at, 
       child_profiles!inner(name), classrooms!inner(name)`
    )
    .order('created_at', { ascending: false })
    .limit(10);

  // 4️⃣ Résumé global
  const { data: summary, error: sumErr } = await supabase
    .rpc('get_dashboard_summary', { p_account_id: accountId });

  if (clsErr || actErr || sumErr) {
    return NextResponse.json({ error: 'Erreur lors du calcul du tableau de bord' }, { status: 500 });
  }

  const response = {
    stars: {
      balance: account.stars_balance,
      monthly_limit: account.plan === 'ecole_pro' ? 1000 : 0,
      consumed_this_month: summary?.stars_consumed_this_month ?? 0,
      renewal_date: account.plan_renewed_at
        ? new Date(account.plan_renewed_at).toISOString()
        : null,
    },
    classrooms: classes ?? [],
    recent_activity: recentActivities ?? [],
    summary: {
      total_students: summary?.total_students ?? 0,
      active_today: summary?.active_today ?? 0,
      total_drawings: summary?.total_drawings ?? 0,
      total_books: summary?.total_books ?? 0,
    },
  };

  return NextResponse.json(response);
}
