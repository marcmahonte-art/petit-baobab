import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { getServerUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');
    if (!childId) return NextResponse.json({ error: 'Paramètre childId manquant' }, { status: 400 });

    const supabase = await getSupabaseServer();
    const [{ data: events }, { data: albums }, { data: favorites }, { data: capsules }] = await Promise.all([
      supabase.from('portfolio_events').select('event_type').eq('child_id', childId),
      supabase.from('portfolio_albums').select('id').eq('child_id', childId),
      supabase.from('portfolio_favorites').select('id').eq('child_id', childId),
      supabase.from('portfolio_time_capsules').select('id, opened').eq('child_id', childId),
    ]);

    const counts: Record<string, number> = {};
    (events ?? []).forEach((e: any) => {
      counts[e.event_type] = (counts[e.event_type] ?? 0) + 1;
    });

    const stats = {
      totalEvents: events?.length ?? 0,
      albums: albums?.length ?? 0,
      favorites: favorites?.length ?? 0,
      capsules: capsules?.length ?? 0,
      byEventType: counts,
    };

    return NextResponse.json({ stats });
  } catch (err) {
    console.error('Portfolio stats error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur inconnue' }, { status: 500 });
  }
}
