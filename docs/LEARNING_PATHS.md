# Parcours pédagogiques (Learning Paths)

## Objectif

Des parcours éducatifs complets et 100 % configurables (modules, leçons, récompenses, certificat) qui guident l'enfant activité par activité : coloriages, dessins magiques, livres, jeux, quiz, histoires, vidéos, défis, missions et collections. Le parcours s'auto-valide à chaque activité de l'enfant et délivre un **certificat PDF** en fin de parcours.

Le module s'appuie sur les moteurs existants :
- **Gamification** (`src/features/gamification`) — XP, étoiles, badges via `emitGameEvent()`
- **Progression** (`src/features/progression`) — niveaux, titres, déblocages
- **Défis** (`src/features/challenges`) — missions quotidiennes / hebdo / mensuelles
- **Baobab World** (`src/features/baobab-world`) — collections d'objets/animaux

**Toute validation passe par le bus d'événements.** Le service de parcours écoute `eventBus.onAny()` et valide automatiquement la leçon en cours. Aucune logique métier dupliquée.

## Architecture

```
src/features/learning-paths/
├── types/
│   └── index.ts              # LearningPath, LearningModule, LearningLesson, ChildLearningProgress,
│                              # LearningCertificate, ModuleProgress, PathProgress, Recommendation…
├── constants/
│   └── index.ts              # 16 parcours canoniques, LESSON_TYPES, LESSON_EVENT_MAP, difficultés,
│                              # thèmes, récompenses, MASCOT_IMAGES, CERTIFICATE_*
├── engine/
│   └── path-engine.ts        # PathEngine (pur, sans I/O) : statuts, progression, recommandations
├── services/
│   ├── seed.ts               # Seed idempotent du contenu canonique (client + serveur)
│   ├── learning-service.ts   # Abonnement eventBus, auto-validation, récompenses, certificats
│   └── certificate-service.ts# Génération PDF (jsPDF) + QR code (qrcode.react)
├── store/
│   └── learning-store.ts     # Zustand persisté (progression, XP, étoiles, temps d'apprentissage)
├── hooks/
│   ├── use-learning-paths.ts # Hook principal
│   └── index.ts
├── animations/
│   └── index.ts              # Variants Framer Motion (timeline, confettis, récompenses)
└── components/
    ├── LearningCard.tsx          # Carte d'un parcours (liste)
    ├── LearningHero.tsx          # En-tête : objectif du jour + stats (XP, temps, collections, badges)
    ├── LearningProgress.tsx      # Barre de progression globale
    ├── LearningTimeline.tsx      # Timeline animée Module 1 → … → Certification
    ├── LessonCard.tsx            # Leçon (icône, type, XP, statut)
    ├── ModuleCard.tsx            # Module avec ses leçons
    ├── CertificateCard.tsx       # Certificat + QR + téléchargement PDF
    ├── RewardPopup.tsx           # Popup de récompense
    ├── PathCompletedModal.tsx    # Modal de fin de parcours
    └── index.ts
```

## Flux (auto-validation)

```
Activité de l'enfant (coloriage, livre, jeu, quiz…)
        │
        ▼
emitGameEvent("COLORING_COMPLETED", { childId, … })
        │
        ▼
eventBus.onAny()  →  learningService.handleEvent()
        │
        ▼
pathEngine.getNextLesson() → la leçon en cours correspond à l'événement ?
        │                          (LESSON_EVENT_MAP)
        ├──► oui : completeLesson() → XP + étoiles (+ bonus module) → progression mise à jour
        │         ├──► module terminé ? bonus MODULE_COMPLETION_XP (30)
        │         └──► parcours terminé ? PATH_COMPLETION_XP (100) + 5 étoiles + certificat
        └──► non : ignoré (la leçon n'est pas la bonne étape)
```

| Type de leçon | Événement de validation |
|---|---|
| COLORING | `COLORING_COMPLETED` |
| MAGIC_DRAWING | `MAGIC_DRAWING_CREATED` |
| BOOK | `BOOK_CREATED` |
| GAME | `GAME_COMPLETED` |
| QUIZ | `QUIZ_COMPLETED` |
| STORY | `STORY_CREATED` |
| CHALLENGE / MISSION | `CHALLENGE_COMPLETED` |
| COLLECTION | `WORLD_OBJECT_UNLOCKED` |
| VIDEO | Validation manuelle ("J'ai terminé") |

## Les 16 parcours

| Slug | Titre | Thème |
|---|---|---|
| petit-artiste | Petit Artiste | Créativité |
| explorateur-afrique | Explorateur d'Afrique | Aventure |
| alphabet | L'Alphabet | Lecture |
| chiffres | Les Chiffres | Maths |
| couleurs | Les Couleurs | Créativité |
| animaux | Les Animaux | Nature |
| nature | La Nature | Nature |
| lecture | La Lecture | Lecture |
| creativite | La Créativité | Créativité |
| metiers | Les Métiers | Découverte |
| musique | La Musique | Créativité |
| sciences | Les Sciences | Sciences |
| planete-terre | Planète Terre | Aventure |
| emotions | Les Émotions | Découverte |
| hygiene | L'Hygiène | Découverte |
| securite | La Sécurité | Découverte |

Chaque parcours : 4 modules × ~3 leçons, âge conseillé, difficulté, illustration, couleurs, mascotte, badge, certificat et récompenses.

## Difficultés

| Niveau | Slug |
|---|---|
| Débutant | `beginner` |
| Intermédiaire | `intermediate` |
| Avancé | `advanced` |
| Expert | `expert` |

## Moteur de progression (PathEngine)

`path-engine.ts` est un moteur **pur** (aucun I/O) :

- `getLessonStatuses(path, rows)` → `locked` / `available` / `in_progress` / `completed` par leçon
- `getNextLesson(path, rows)` → prochaine leçon à valider
- `computePathProgress(path, rows)` → `% global`, modules terminés, leçons terminées
- `applyLessonCompletion(path, rows, lessonId)` → nouvel état (optimistic)
- `buildPreferences(context)` → préférences à partir de l'âge, du niveau, des activités réalisées, du temps et des performances (personnalisation)
- `getRecommendations(context)` → parcours recommandés, score calculé :
  - Âge dans la tranche : **+40**, proche : **+15**, hors tranche : **−50**
  - Difficulté adaptée au niveau : **+15**, légère : **+5**, au-delà : **−20**
  - Correspondance tags / préférences : **+10** par tag
  - Temps passé sur le thème : **+5**

Exemple de personnalisation : un enfant qui aime les animaux reçoit `Animaux`, `Safari`, `Nature`, `Afrique` plutôt que `Alphabet`.

## Récompenses

- **XP** par leçon : `LESSON_BASE_XP` (constantes) + XP de la leçon
- **Étoiles** par leçon : `LESSON_BASE_STARS` + étoiles de la leçon
- **Bonus module** : `MODULE_COMPLETION_XP` (30)
- **Bonus parcours** : `PATH_COMPLETION_XP` (100) + `PATH_COMPLETION_STARS` (5)
- Badges, mascottes, objets, décorations, livres, autocollants et collections

Les récompenses sont octroyées via les moteurs existants (gamification / progression) puis affichées par `RewardPopup`.

## Certificats

À la fin d'un parcours, un certificat est émis (token unique `slug_uuid`) et stocké dans `learning_certificates`. `CertificateCard` affiche un QR code (`qrcode.react`) permettant de vérifier le certificat ; le bouton **Télécharger** génère le PDF via jsPDF :

- A4 paysage, cadre décoratif, couleurs du thème
- Prénom de l'enfant, titre du parcours, date (format français)
- Signature "Petit Baobab", photo de la mascotte
- QR code (URL de vérification `CERTIFICATE_VERIFY_URL`)

## API

| Route | Méthode | Description |
|---|---|---|
| `/api/learning?childId=` | GET | Tous les parcours (modules + leçons) + progression + synthèse par parcours |
| `/api/learning/path?slug=` | GET | Détail d'un parcours (modules + leçons) |
| `/api/learning/progress?childId=` | GET | Progression complète de l'enfant |
| `/api/learning/progress` | POST | Valider une leçon (`{ childId, pathId, lessonId }`) — vérifie l'ordre via le moteur |
| `/api/learning/certificate?childId=` | GET | Certificats de l'enfant |
| `/api/learning/certificate?token=` | GET | Vérification publique d'un certificat |
| `/api/learning/certificate` | POST | Émettre un certificat (`{ childId, pathId }`) — parcours terminé exigé |

Toutes les routes vérifient la session (`getServerUser`) ; l'accès aux données enfant est garanti par la RLS (`child_belongs_to_user`).

## Tables Supabase

| Table | Rôle |
|---|---|
| `learning_paths` | Définitions canoniques des parcours (slug unique, âge, difficulté, thème, tags) |
| `learning_modules` | Modules d'un parcours (ordre, récompenses) |
| `learning_lessons` | Leçons d'un module (type, contenu, récompenses) |
| `child_learning_progress` | Progression d'un enfant — unique `child_id + path_id + module_id + lesson_id` |
| `learning_certificates` | Certificats émis (token unique, nom, mascotte) |

Les tables canoniques sont lisibles par tous ; l'écriture est réservée aux parents authentifiés (seed idempotent côté app). Les tables enfant sont protégées par `child_belongs_to_user()`.

## Migration SQL

Fichier : `supabase/migrations/18_learning_paths.sql`

> ⚠ À exécuter dans le Supabase Dashboard → SQL Editor → New Query

## Page

`/learn/parcours` — le centre d'apprentissage.

Vue liste : **hero** (objectif du jour, XP, temps, collections, badges), **progression globale**, parcours **en cours**, **recommandés**, **certificats** et **tous les parcours**.

Vue détail : en-tête du parcours (illustration, couleurs, mascotte, difficulté), **timeline animée** Module 1 → … → Certification, cartes de modules avec leçons (statut verrouillée / disponible / en cours / terminée), popup de récompense et modal de fin de parcours avec certificat.

## Bonnes pratiques

- **Aucune logique métier dupliquée** : le service réagit aux événements du bus de gamification (comme le World Engine).
- **Optimistic updates** : Zustand est la source de vérité ; Supabase est synchronisé en arrière-plan (try/catch offline).
- **Seed idempotent** : `seedLearningPaths` vérifie le compteur avant d'insérer ; sûr à lancer à chaque init.
- **Composable** : chaque composant est indépendant et réutilisable.
- **Extensibilité** : ajouter un parcours = ajouter une entrée dans le contenu canonique des constantes (aucune autre modification nécessaire).
- **Accessibilité** : `role="img"`, `aria-label`, interactions clavier.

## Roadmap

- [ ] Écrans de jeu dédiés par type de leçon (lecture, quiz intégré, vidéo)
- [ ] Verrouillage/prix des parcours selon le plan (free / découverte / super-baobab / école-pro)
- [ ] Progression synchronisée entre les écrans des moteurs (scores dans le parcours)
- [ ] Téléversement du PDF de certificat dans Supabase Storage (`pdf_url`)
- [ ] Notifications et rappels quotidiens d'apprentissage
