# Le Baobab Vivant

## Objectif

Chaque enfant possède son propre univers persistant qui évolue automatiquement avec ses activités. Le joueur revient pour faire évoluer SON monde, pas seulement pour colorier.

Le module s'appuie sur les moteurs existants :
- **Gamification** (`src/features/gamification`) — XP, étoiles, badges, streak
- **Progression** (`src/features/progression`) — niveaux, titres, déblocages
- **Défis** (`src/features/challenges`) — missions quotidiennes / hebdo / mensuelles

**Toutes les évolutions passent par `emitGameEvent()`.** Le World Engine ne duplique aucune logique métier : il écoute le bus d'événements et réagit.

## Architecture

```
src/features/baobab-world/
├── types/
│   └── index.ts              # ChildWorld, WorldObject, WorldHistoryEntry, étapes
├── constants/
│   └── index.ts              # Étapes du baobab, objets, animaux, décorations, saisons, météo, temps
├── world/
│   └── engine.ts             # WorldEngine : croissance, déblocages, saisons, météo + persistance
├── services/
│   └── world-service.ts      # Abonnement eventBus, orchestration, écriture Supabase
├── store/
│   └── world-store.ts        # Zustand persisté
├── hooks/
│   ├── use-world.ts          # Hook principal
│   ├── use-world-objects.ts  # Classification objets/animaux/décorations
│   └── use-world-timeline.ts # Timeline souvenirs (Aujourd'hui → Depuis le début)
├── animations/
│   └── index.ts              # Variants Framer Motion
└── components/
    ├── WorldScene.tsx        # Scène composite
    ├── BaobabTree.tsx        # Arbre (7 étapes, feuilles, fleurs)
    ├── WorldObject.tsx       # Objet interactif
    ├── AnimalSprite.tsx      # Animal animé
    ├── DecorationLayer.tsx   # Papillons, nuages, étoiles, lucioles…
    ├── SkyLayer.tsx          # Ciel + soleil/lune + étoiles selon heure
    ├── WeatherLayer.tsx      # Pluie, vent, arc-en-ciel
    ├── SeasonOverlay.tsx     # Teinte + particules saisonnières + obscurité nuit
    ├── WorldHUD.tsx          # Niveaux, étoiles, badges, prochain objectif
    ├── GrowthAnimation.tsx   # Overlay de croissance
    └── UnlockAnimation.tsx   # Overlay de déblocage
```

## Flux

```
Acte du joueur (coloriage, livre, jeu, quiz, connexion…)
        │
        ▼
emitGameEvent("DRAWING_COMPLETED", { childId, … })
        │
        ▼
eventBus.onAny()  →  worldService.handleEvent()
        │
        ├──► calculateGrowth(event)   → pool de croissance
        ├──► growTree()               → niveau d'arbre + éventuel changement d'étape
        ├──► unlockObject()           → objets du monde
        ├──► unlockAnimal()           → animaux
        ├──► unlockDecoration()       → décorations
        ├──► createMemory()           → souvenirs (world_history)
        └──► Supabase (upsert child_world, world_objects, world_history)
```

## Étapes du baobab

| Niveau | Étape | Icône | Hauteur |
|---|---|---|---|
| 1 | Graine | 🌱 | 25% |
| 2 | Jeune pousse | 🌿 | 40% |
| 3 | Petit arbre | 🌳 | 55% |
| 4 | Arbre mature | 🌳 | 70% |
| 5 | Grand Baobab | 🌳✨ | 82% |
| 6 | Baobab Sacré | 🌳🏡 | 92% |
| 7 | Arbre Légendaire | 🌳👑 | 100% |

Seuils de niveau d'arbre : `[1, 3, 6, 10, 15, 20, 30]`. Les illustrations sont interchangeables : chaque étape possède une définition (hauteur, nom, icône) et le composant `BaobabTree` rend une silhouette composée (tronc + feuilles + fleurs) prête à être remplacée par des assets.

## Croissance par activité

| Événement | Croissance |
|---|---|
| `DRAWING_CREATED` | 1 |
| `DRAWING_COMPLETED` | 2 |
| `COLORING_COMPLETED` | 2 |
| `MAGIC_DRAWING_CREATED` | 3 |
| `BOOK_CREATED` | 3 |
| `BOOK_PRINTED` | 1 |
| `STORY_CREATED` | 1 |
| `GAME_COMPLETED` | 1.5 |
| `QUIZ_COMPLETED` | 2 |
| `LOGIN` | 0.5 |
| `DAILY_LOGIN` | 1 |
| `STREAK_DAY` | 2 |
| `CHALLENGE_COMPLETED` | 4 |

Le service accumule la croissance dans un pool (`growth × 10`). Chaque tranche de `TREE_LEVEL_STEP` (=100) augmente le niveau d'arbre. Le niveau est plafonné à 30.

## Objets du monde (déblocage progressif)

| Objet | Icône | Niveau |
|---|---|---|
| Fleurs, Pierre | 🌸 🪨 | 1 |
| Maison, Champignon | 🏠 🍄 | 2 |
| Banc, Pont | 🪑 🌉 | 3 |
| Rivière, Lac | 🏞️ 💧 | 4 |
| Tambour, Totem | 🥁 🗿 | 5 |
| Feu de camp, Terrain de jeux | 🔥 🎠 | 6 |
| École, Bibliothèque | 🏫 📚 | 7 |
| Village | 🏘️ | 8 |

## Animaux (niveau + badges + événements)

| Animal | Icône | Niveau | Débloqué par |
|---|---|---|---|
| Lion | 🦁 | 2 | Coloriage terminé |
| Girafe | 🦒 | 2 | Livre créé |
| Zèbre | 🦓 | 3 | Jeu terminé |
| Singe | 🐒 | 3 | Quiz réussi |
| Éléphant | 🐘 | 4 | Coloriage terminé |
| Gazelle | 🦌 | 4 | Histoire découverte |
| Perroquet | 🦜 | 5 | Dessin IA |
| Hippopotame | 🦛 | 6 | Connexion quotidienne |
| Autruche | 🪶 | 6 | Série de jours |
| Crocodile | 🐊 | 7 | Défi réussi |

## Décorations

| Décoration | Icône | Niveau | Note |
|---|---|---|---|
| Nuages, Étoiles | ☁️ ⭐ | 1 | Étoiles la nuit |
| Papillons | 🦋 | 2 | |
| Arc-en-ciel, Lucioles | 🌈 ✨ | 3 | Lucioles la nuit |
| Fleurs rares | 🌺 | 4 | |
| Ballons | 🎈 | 5 | |
| Lanternes | 🏮 | 6 | |
| Confettis | 🎊 | 8 | |

## Saisons dynamiques

| Saison | Icône | Mois | Effet |
|---|---|---|---|
| Saison sèche | 🌞 | nov-fév | Teinte chaude |
| Saison des pluies | 🌧️ | mar-avr | Particules 💧 |
| Printemps | 🌷 | mai | Particules 🌸 |
| Automne | 🍂 | juin-juil | Particules 🍁 |
| Rentrée scolaire | 🎒 | août | Particules 🎒 |
| Halloween | 🎃 | sept | Particules 🎃 + ciel sombre |
| Noël | 🎄 | oct | Particules ❄️ |
| Vacances | 🏖️ | jan | Teinte estivale |

Chaque saison change couleurs (`SeasonOverlay`), illustrations (`banner`), musique (`music`), animations et objets débloquables (`unlocks`).

## Météo automatique

`generateWeather()` choisit selon des probabilités (Soleil 40%, Nuages 25%, Pluie 15%, Vent 10%, Arc-en-ciel 6%, Étoiles 4%). La météo est stockée dans `child_world.weather` et rendue par `WeatherLayer`.

## Jour / Nuit

`getTimeOfDay()` calcule la période selon l'heure locale : Matin (6-11), Après-midi (12-17), Soir (18-20), Nuit (21-5). Le ciel, le soleil, la lune, les étoiles et l'obscurité s'adaptent automatiquement. Les décorations de nuit (étoiles, lucioles) n'apparaissent que la nuit.

## Souvenirs (world_history)

Chaque grande étape est enregistrée : `world_created`, `first_coloring`, `first_book`, `first_badge`, `first_animal`, `tree_mature`, `tree_level_5`, `tree_sacred`, `tree_legendary`, `season_change`. Le parent peut revoir l'histoire via la Timeline.

## Timeline

`useWorldTimeline()` regroupe les souvenirs : Aujourd'hui → Hier → Cette semaine → Ce mois → Depuis le début.

## Captures (album annuel)

Chaque évolution importante peut générer une capture (image + légende) stockée dans `world_captures`. Ces images alimenteront un futur album annuel. Le store garde la dernière capture (`capture`).

## API

| Route | Méthode | Description |
|---|---|---|
| `/api/world?childId=` | GET | Monde complet (arbre, objets, histoire, saison, météo, heure) |
| `/api/world/history?childId=` | GET | Souvenirs + définitions |
| `/api/world/history` | POST | Créer un souvenir (`{ childId, event, metadata }`) |
| `/api/world/unlocks?childId=` | GET | Objets / animaux / décorations débloqués |
| `/api/world/growth?childId=` | GET | Progression de croissance + étapes |

Toutes les routes vérifient la session (`getServerUser`) et l'appartenance du `childId`.

## Tables Supabase

| Table | Rôle |
|---|---|
| `child_world` | État du monde (niveau arbre, météo, saison…) — unique `child_id` |
| `world_objects` | Objets / animaux / décorations — unique `child_id + object_type` |
| `world_history` | Souvenirs (JSONB metadata) |
| `world_captures` | Images souvenirs pour l'album annuel |

RLS activée partout, via `child_belongs_to_user()`.

## Migration SQL

Fichier : `supabase/migrations/17_baobab_world.sql`

> ⚠ À exécuter dans le Supabase Dashboard → SQL Editor → New Query

## Page

`/learn/world` — "Mon Baobab" — le cœur émotionnel de Petit Baobab.

Affiche : le baobab, le monde, les animaux, les décorations, les récompenses, les collections, le niveau, les étoiles, les badges, le prochain objectif, les défis actifs et l'histoire.

## Bonnes pratiques

- **Aucune logique métier dupliquée** : le World Engine ne fait que réagir aux événements du bus de gamification.
- **Optimistic updates** : Zustand est la source de vérité ; Supabase est synchronisé en arrière-plan (try/catch offline).
- **Composable** : chaque composant est indépendant et réutilisable.
- **Performance** : animations GPU-friendly (transform/opacity), `motion` memoïsé par clé.
- **Extensibilité** : ajouter un objet = ajouter une entrée dans `WORLD_OBJECTS` (aucune autre modification nécessaire).
- **Accessibilité** : `role="img"`, `aria-label`, interactions clavier sur les boutons.

## Roadmap

- [ ] Assets illustration par étape (remplacer les silhouettes composées)
- [ ] Musique par saison (champ `music` déjà prévu)
- [ ] Interactions au clic sur les objets / animaux (mini-jeux)
- [ ] Système de captures automatiques + album annuel
- [ ] Cartes des collections avec liens vers les défis
- [ ] Badges saisonniers liés aux événements du monde
