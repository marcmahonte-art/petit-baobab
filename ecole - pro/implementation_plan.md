# Plan d'Implémentation : Automatisation Complète du Dashboard École

Ce plan vise à rendre le **Dashboard École de Petit Baobab 100% dynamique**, alimenté par la base de données Supabase. Toutes les données mockées du store et des composants seront supprimées.

---

## 1. Audit & Réutilisation du Backend

Pour maximiser les performances et la sécurité, nous allons refondre la route API existante [route.ts (API Dashboard)](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/app/api/school/dashboard/route.ts). 

Elle effectuera une requête consolidée via `Promise.all` côté serveur pour récupérer et calculer toutes les métriques demandées en un minimum de requêtes :
1. **Compte parent/enseignant** (depuis `accounts` -> `stars_balance`).
2. **Classes** (depuis `classrooms` filtrées par le compte).
3. **Élèves** (depuis `school_students` liés aux classes actives).
4. **Profils de jeu enfants** (depuis `child_profiles` liés aux élèves).
5. **Dessins magiques** (depuis `saved_drawings` avec état terminé).
6. **Livres** (depuis `books` finalisés).
7. **Activités récentes** (depuis `student_activities` ordonnées par date décroissante).
8. **Transactions d'étoiles** (depuis `stars_transactions` pour le calcul de l'utilisation).

---

## 2. KPIs Automatisés (DashboardStats)

Les KPIs du haut seront calculés dynamiquement sur le serveur :
* **Classes actives** : `COUNT(classrooms)`
* **Élèves inscrits** : `COUNT(school_students)`
* **Coloriages réalisés** : `COUNT(saved_drawings)`
* **Livres créés** : `COUNT(books)`
* **Étoiles restantes** : `accounts.stars_balance`

---

## 3. "Mes classes" (ClassesGrid)

- Affichage des classes réelles sous forme de grille.
- Pour chaque classe, calcul dynamique de :
  - Nombre d'élèves inscrits.
  - Taux de progression (activités terminées / activités disponibles).
  - Horodatage de la dernière activité.
  - Image de garde (choisie selon un index déterministe).
- Bouton de partage qui met à jour le QR Code à la volée.

---

## 4. Activités Récentes (RecentActivities)

- Fusion des tables pour créer un flux en temps réel ordonné par date décroissante.
- Affichage du prénom de l'élève, de sa mascotte (avatar), de son action ("a terminé un coloriage"), de l'heure et des étoiles gagnées (`+5`, `+20`…).

---

## 5. Utilisation des étoiles (StarsUsage)

Calcul automatique à partir de la table `stars_transactions` pour le compte :
- **Coloriages** : somme des étoiles consommées avec la raison `generation`.
- **Livres** : somme des étoiles consommées pour la raison `book_created` (ou `generation` associée à un livre).
- **Activités** : somme pour la raison `activity_completed`.
- **Bonus** : somme des gains avec la raison `signup_bonus` / `admin_grant`.
- **Autres** : autre raison ou ajustements.

---

## 6. Progression Globale (ProgressChart)

- Un graphique de progression montrant le taux de complétion par classe.
- Moyenne générale de la progression de toutes les classes.
- Si la progression moyenne est > 80% : affiche la carte "Bravo !", sinon "Continue !".

---

## 7. Composants Indépendants à implémenter

Nous allons créer ou refondre les composants sous `src/components/school/` :
1. **[NEW] `DashboardHeader`** : Informations réelles de l'enseignant, ses étoiles, notifications et nombre de classes.
2. **[NEW] `DashboardStats`** : Les 5 cards de KPIs du haut.
3. **[NEW] `ClassesGrid`** : La grille des classes actives.
4. **[NEW] `StarsUsage`** : Graphique circulaire / liste de répartition de consommation des étoiles.
5. **[NEW] `ProgressChart`** : Visualisation de progression des classes avec carte d'encouragement dynamique ("Bravo !").
6. **[MODIFY] `RecentActivities`** : Version autonome branchée sur le store.

---

## 8. Gestion des états (États vides / Loading)

Chaque composant prendra en charge les états :
- **Loading / Skeleton** : Affichage d'un squelette animé pendant la récupération.
- **Empty State** : Message d'accueil et illustration sympa si aucun élément (ex: aucune classe créée).
- **Error State** : Message clair avec bouton "Réessayer".

---

## Proposed Changes

### Backend API & Store

---

#### [MODIFY] [route.ts (Dashboard API)](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/app/api/school/dashboard/route.ts)
- Refondre entièrement le point d'accès pour retourner toutes les agrégations de données (classes, élèves, dessins, livres, transactions d'étoiles, progression).
- Éliminer le besoin de fonctions SQL RPC complexes sur Supabase en effectuant des requêtes de table performantes indexées par `account_id` et filtrées en JS.

---

#### [MODIFY] [school-store.ts](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/stores/school-store.ts)
- Passer `useMockData` à `false` par défaut.
- Mettre à jour `fetchDashboard` pour interroger `/api/school/dashboard` et stocker la réponse.
- Supprimer `MOCK_DASHBOARD` définitivement.

---

### Composants

---

#### [NEW] [DashboardHeader.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/school/DashboardHeader.tsx)
- Remplace `SchoolHeader.tsx` en se branchant dynamiquement sur les données du compte et de la session Supabase.

#### [NEW] [DashboardStats.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/school/DashboardStats.tsx)
- Reçoit les compteurs dynamiques depuis le store et gère l'état Skeleton.

#### [NEW] [ClassesGrid.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/school/ClassesGrid.tsx)
- Grille de classes avec état vide (Empty state avec bouton d'ajout de classe si 0 classe).

#### [NEW] [StarsUsage.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/school/StarsUsage.tsx)
- Nouveau widget de décomposition des étoiles consommées (Coloriages, Livres, Activités, Bonus, Autres).

#### [NEW] [ProgressChart.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/components/school/ProgressChart.tsx)
- Graphique linéaire/barre de progression par classe et carte "Bravo / Continue".

#### [MODIFY] [DashboardClient.tsx](file:///c:/Users/Lenovo/Desktop/Petit%20%20Baobab/petit-baobab/src/app/school/dashboard/DashboardClient.tsx)
- Assembler les nouveaux composants autonomes dans le layout.
- Gérer l'état de chargement global de la page.

---

## Verification Plan

### Automated Tests
- `npm run build` : S'assurer de la conformité des types TypeScript et de la compilation Next.js.

### Manual Verification
- Lancer `npm run dev` et inspecter le Dashboard École localement.
- Valider que l'interface affiche les données du compte de test (CE1 Test, Awa, Kofi...) créées par `seed_school.sql`.
- Tester l'import bulk ou la création d'une nouvelle classe et vérifier l'impact immédiat sur les KPIs du tableau de bord.
