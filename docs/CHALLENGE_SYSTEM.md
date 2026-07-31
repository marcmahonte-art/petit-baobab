# Système de Rétention — Défis & Missions

## Objectif

Système de rétention complet branché sur le Game Engine existant : missions quotidiennes / hebdomadaires / mensuelles, défis saisonniers, calendrier de connexion avec coffres, multiplicateurs XP, Battle Pass et APIs.

## Architecture

```
src/features/challenges/
├── types/
│   └── index.ts              # Tous les types du module
├── constants/
│   └── index.ts              # Templates, coffres, saisons, multiplicateurs, battle pass
├── calendar/
│   └── calendar-engine.ts    # Construction du calendrier (31 jours, coffres LMMJVSD)
├── rewards/
│   └── rewards-engine.ts     # Calcul des récompenses + émission via gamification
├── services/
│   ├── mission-service.ts    # Génération + persistance missions quotidiennes/hebdo/mensuelles
│   ├── season-service.ts     # Saisons + progression + récompenses de palier
│   ├── events-service.ts     # Multiplicateurs week-end / vacances / événements
│   ├── multiplier-service.ts # Multiplicateurs actifs + application
│   ├── calendar-service.ts   # État calendrier + claim des jours
│   ├── battle-pass-service.ts# Battle Pass gratuit + premium
│   ├── scheduler-service.ts  # Reset quotidien / hebdo / mensuel
│   └── index.ts              # ChallengesService (orchestrateur)
├── hooks/
│   ├── use-challenges.ts     # Hook principal
│   ├── use-calendar.ts       # Calendrier + coffres
│   └── use-battle-pass.ts    # Battle Pass
├── store/
│   └── challenges-store.ts   # Zustand persisté
└── components/
    ├── MissionCard.tsx       # Carte mission quotidienne/hebdo/mensuelle
    ├── ChallengeCard.tsx     # Carte défi saisonnier
    ├── SeasonBanner.tsx      # Bannière saison en cours
    ├── DailyCalendar.tsx     # Grille calendrier 31 jours
    ├── RewardChest.tsx       # Coffre avec contenu
    └── MissionProgress.tsx   # Barres de progression + Battle Pass
```

## Principe

Toute récompense passe obligatoirement par `emitGameEvent()` du Game Engine.

```
// Dans les services de récompenses :
import { emitGameEvent } from "@/features/gamification/event-bus"

await emitGameEvent("STARS_EARNED", {
  childId,
  amount: 30,
  reason: "mission_reward",
})
```

### Branchement au Game Engine

Les missions sont enregistrées comme `Challenge` dans `challengeEngine`. Quand un événement se produit (coloriage terminé, livre créé, etc.), le moteur incrémente automatiquement la progression et crédite XP/étoiles au moment de la complétion.

```ts
import { challengeEngine } from "@/features/gamification/challenge-engine"

challengeEngine.register({
  id: "daily_2026-07-31_0",
  title: "Colorier un animal",
  requirement: { event: "COLORING_COMPLETED", count: 1 },
  reward: { xp: 20, stars: 0 },
  target: 1,
  progress: 0,
  completed: false,
  claimed: false,
})
```

## Événements utilisés

| Événement | Mission type |
|---|---|
| `DRAWING_CREATED` | Créer N coloriages |
| `COLORING_COMPLETED` | Colorier N dessins |
| `BOOK_CREATED` | Créer N livres |
| `MAGIC_DRAWING_CREATED` | Créer N dessins IA |
| `GAME_COMPLETED` | Jouer à N jeux |
| `QUIZ_COMPLETED` | Réussir N quiz |
| `STORY_CREATED` | Créer N histoires |
| `STARS_EARNED` | Récompenses du calendrier / missions |

## Génération des missions

Les missions sont générées de façon **déterministe** (seed = date) puis persistées dans `child_missions`.

- **Quotidiennes** : 3 missions par jour (`active_date = CURRENT_DATE`)
- **Hebdomadaires** : 3 missions par semaine (`active_week` = lundi)
- **Mensuelles** : 1 défi par mois (`active_month`)
- **Saison** : définies par la saison active (voir `season-service.ts`)

Le scheduler (`scheduler-service.ts`) détecte les changements de seed et régénère automatiquement :
- Quotidien à minuit
- Hebdo le lundi à 00:00
- Mensuel le 1er du mois à 00:00

## Calendrier de connexion

- Grille de 31 jours (labels `D L M M J V S`)
- Récompense quotidienne : XP ou étoiles en alternance
- **Coffres spéciaux** :
  - Jour 7 → Coffre Bronze (🪙)
  - Jour 15 → Coffre Argent (🥈)
  - Jour 30 → Coffre Or (🥇)
  - Jour 60 → Coffre Diamant (💎)
  - Jour 90 → Coffre Légendaire (👑)
- Un coffre réclamé ne peut pas être re-réclamé (`calendar_chests` unique `child_id + day`)

## Multiplicateurs

Définis dans `DEFAULT_MULTIPLIERS` (constants) :

| Multiplicateur | Effet | Période |
|---|---|---|
| `weekend` | XP ×2 | Samedi / Dimanche |
| `vacances` | Étoiles ×2 | Jours fériés français |
| `event_livres` | Livres ×3 | Événements livres |

`multiplier-service.ts` expose `getActiveMultipliers()` et `applyMultiplier(event, xp, stars)`.

## Saisons

10 saisons sur l'année (Septembre La rentrée → Juin Les vacances), seedées dans `season_events` :

| Mois | Saison | Couleur |
|---|---|---|
| Sept | La rentrée | #FF8A00 |
| Oct | Les animaux d'Afrique | #FF6B35 |
| Nov | Les métiers | #1D9E75 |
| Déc | Noël | #E63946 |
| Jan | Le monde | #1194FF |
| Fév | Les émotions | #FF5E83 |
| Mar | Les plantes | #8BC34A |
| Avr | Les océans | #00B4D8 |
| Mai | Les transports | #FFB300 |
| Juin | Les vacances | #FF8A00 |

Chaque saison possède 5 missions (`SEASON_MISSION_TEMPLATES`) et des récompenses par palier (`season_rewards`).

## Battle Pass

- 20 paliers (`BATTLE_PASS_TIERS`)
- XP requis par palier : `palier × 100`
- **Gratuit** : étoiles et petits bonus à chaque palier
- **Premium** (plan `super-baobab`) : fonds, cadres, masquettes, livres exclusifs aux paliers 1, 3, 5, 8, 10, 12, 15, 20
- Gain d'XP Battle Pass selon l'activité (`computeBattlePassXp`)
- Persistance : `battle_pass_state` (unique `child_id + season_id`)

## APIs

| Route | Méthode | Description |
|---|---|---|
| `/api/game/challenges?childId=` | GET | Missions + saison + multiplicateurs |
| `/api/game/calendar?childId=` | GET | Calendrier + état des coffres |
| `/api/game/calendar` | POST | Réclamer un jour (`{ childId, day }`) |
| `/api/game/rewards?childId=` | GET | Coffres + récompenses réclamées |
| `/api/game/season?childId=&plan=` | GET | Saison + Battle Pass + paliers |

Toutes les routes vérifient la session (`getServerUser`) et l'appartenance du `childId` au compte.

## Tables Supabase

| Table | Rôle |
|---|---|
| `daily_missions` | Définitions canoniques missions quotidiennes |
| `child_daily_progress` | Progression quotidienne par enfant (unique `child_id + mission_id + progress_date`) |
| `weekly_missions` | Définitions canoniques missions hebdomadaires |
| `child_weekly_progress` | Progression hebdomadaire par enfant |
| `child_missions` | Missions générées et attribuées (pivot) |
| `season_events` | Saisons |
| `season_rewards` | Récompenses par palier de saison |
| `calendar_chests` | Coffres réclamés (unique `child_id + day`) |
| `battle_pass_state` | État Battle Pass (unique `child_id + season_id`) |

Toutes les tables ont RLS activée. Les lectures des tables canoniques sont publiques ; les données par enfant passent par le helper `child_belongs_to_user()`.

## Migration SQL

Fichier : `supabase/migrations/16_child_challenges.sql`

> ⚠ À exécuter dans le Supabase Dashboard → SQL Editor → New Query
> Projet : https://supabase.com/dashboard/project/bsepfqpjomrtveavbfib

## Utilisation (composants)

```tsx
import { MissionCard, DailyCalendar, SeasonBanner } from "@/features/challenges/components"
import { useChallenges, useCalendar } from "@/features/challenges/hooks"

const { daily, weeklyProgress } = useChallenges(childId, plan)
const { days, claimDay } = useCalendar(childId)
```
