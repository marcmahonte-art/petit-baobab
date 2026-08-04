// src/features/learning-paths/engine/__tests__/map-engine.test.ts
import { describe, it, expect } from 'vitest';
import { mapEngine } from '../map-engine';
import { MAP_REGIONS, MAP_MISSIONS } from '../../constants/map-constants';
import type { ChildMissionProgress, MissionType } from '../../types';

const regions = MAP_REGIONS;
const missions = MAP_MISSIONS;
const missionsByRegion: Record<string, typeof missions> = {};
for (const m of missions) {
  if (!missionsByRegion[m.region_id]) missionsByRegion[m.region_id] = [];
  missionsByRegion[m.region_id].push(m);
}

function progress(rows: Array<{ mission_id: string; status: ChildMissionProgress['status']; completed_at?: string }>): ChildMissionProgress[] {
  return rows.map((r) => ({
    child_id: 'c1',
    mission_id: r.mission_id,
    status: r.status,
    progress: r.status === 'completed' ? 100 : 0,
    started_at: null,
    completed_at: r.completed_at ?? null,
  }));
}

describe('mapEngine.getRegionStatus', () => {
  it('verrouille une région tant que le XP requis n’est pas atteint', () => {
    const village = regions.find((r) => r.slug === 'village-des-couleurs')!;
    expect(mapEngine.getRegionStatus(village, 0)).toBe('locked');
    expect(mapEngine.getRegionStatus(village, 119)).toBe('locked');
  });

  it('débloque la région dès que le XP est atteint', () => {
    const village = regions.find((r) => r.slug === 'village-des-couleurs')!;
    expect(mapEngine.getRegionStatus(village, 120)).not.toBe('locked');
  });

  it('la première région est toujours disponible', () => {
    const foret = regions.find((r) => r.slug === 'foret-des-animaux')!;
    expect(mapEngine.getRegionStatus(foret, 0)).not.toBe('locked');
  });
});

describe('mapEngine.getCurrentMission', () => {
  it('retourne la première mission non terminée de la première région disponible', () => {
    const current = mapEngine.getCurrentMission(regions, missionsByRegion, [], 0);
    expect(current).toBeTruthy();
    expect(current!.region_id).toBe('region_foret-des-animaux');
    expect(current!.level).toBe(1);
  });

  it('passe à la mission suivante quand la première est terminée', () => {
    const first = missionsByRegion['region_foret-des-animaux'][0];
    const rows = progress([{ mission_id: first.id, status: 'completed', completed_at: '2026-01-01' }]);
    const current = mapEngine.getCurrentMission(regions, missionsByRegion, rows, 0);
    expect(current!.id).toBe(missionsByRegion['region_foret-des-animaux'][1].id);
  });

  it('ne propose pas de mission dans une région verrouillée', () => {
    const foret = regions.find((r) => r.slug === 'foret-des-animaux')!;
    const village = regions.find((r) => r.slug === 'village-des-couleurs')!;
    const foretDone = missionsByRegion[foret.id].map((m) => ({ mission_id: m.id, status: 'completed' as const, completed_at: '2026-01-01' }));
    const villageFirst = missionsByRegion[village.id][0];
    const rows = progress([...foretDone, { mission_id: villageFirst.id, status: 'completed' }]);
    // Avec 0 XP, la région du village est verrouillée → sa mission ne doit pas être choisie
    const current = mapEngine.getCurrentMission(regions, missionsByRegion, rows, 0);
    expect(current).toBeNull();
  });

  it('retourne null quand toutes les missions sont terminées', () => {
    const allDone = missions.map((m) => ({ mission_id: m.id, status: 'completed' as const, completed_at: '2026-01-01' }));
    const current = mapEngine.getCurrentMission(regions, missionsByRegion, progress(allDone), 99999);
    expect(current).toBeNull();
  });
});

describe('mapEngine.updateRadar', () => {
  it('augmente les axes correspondant au type de mission et clamp à 100', () => {
    const base = {
      creativity: 0, reading: 0, observation: 0, logic: 0, perseverance: 0, imagination: 0,
    };
    const after = mapEngine.updateRadar(base, 'STORY');
    expect(after.reading).toBeGreaterThan(0);
    expect(after.imagination).toBeGreaterThan(0);
    expect(after.logic).toBe(0);

    const maxed = mapEngine.updateRadar({ ...after, reading: 99 }, 'STORY');
    expect(maxed.reading).toBeLessThanOrEqual(100);
  });
});

describe('mapEngine.getNextUnlockableRegion', () => {
  it('retourne la région la plus proche à débloquer', () => {
    const next = mapEngine.getNextUnlockableRegion(regions, 0);
    expect(next).toBeTruthy();
    expect(next!.region.slug).toBe('village-des-couleurs');
    expect(next!.xpNeeded).toBe(120);
  });

  it('retourne null quand tout est débloqué', () => {
    const next = mapEngine.getNextUnlockableRegion(regions, 99999);
    expect(next).toBeNull();
  });
});

describe('mapEngine.getDailyProgress', () => {
  const dailies: Array<{
    id: string; title: string; description: string; type: MissionType; xp: number; stars: number; icon: string; day_key: string; is_active: boolean;
  }> = [
    { id: 'daily_color', title: 'Colorier', description: '', type: 'COLORING', xp: 15, stars: 2, icon: '🎨', day_key: 'monday', is_active: true },
  ];

  it('marque une quête comme complétée quand son id est dans la liste', () => {
    const result = mapEngine.getDailyProgress(dailies, new Set(['daily_color']));
    expect(result[0].completed).toBe(true);
    expect(result[0].status).toBe('completed');
  });

  it('disponible sinon', () => {
    const result = mapEngine.getDailyProgress(dailies, new Set());
    expect(result[0].completed).toBe(false);
    expect(result[0].status).toBe('available');
  });
});
