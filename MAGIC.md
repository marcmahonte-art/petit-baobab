# Product Design Audit — Page Dessin Magique

**Mode:** Review | **Surface:** `/magic-drawing` | **Fichier:** `src/app/magic-drawing/page.tsx` (795 lignes), `src/lib/credit-store.ts`, `src/app/api/magic-drawing/route.ts` | **Date:** 03/07/2026

---

## Résumé

La page Dessin Magique est un outil de génération d'images par IA en 3 étapes, avec un système de crédits/étoiles. L'UI est propre et bien structurée, mais souffre de **boutons décoratifs sans action**, d'un **défaut de sélection verrouillé pour les utilisateurs gratuits**, et de **quelques incohérences fonctionnelles**.

---

## P0 — Bloque la tâche principale

### 1. Style par défaut verrouillé pour les utilisateurs gratuits
- **Fichier :** `page.tsx:99` + `credit-store.ts:77`
- **Problème :** Le style sélectionné par défaut est `"noir_blanc"` (ligne 99). Mais la logique free plan (ligne 77 de credit-store.ts) autorise uniquement `"contour_simple"`. Donc **un utilisateur gratuit qui clique sur "Créer mon dessin magique" sans changer de style reçoit une erreur "Réservé aux abonnés"**.
- **Conséquence :** 100% des utilisateurs gratuits (la majorité) échouent au premier essai. Abandon immédiat.
- **Fix :** Soit changer le défaut à `"contour_simple"`, soit débloquer `"noir_blanc"` pour le plan free.

### 2. Bouton "Télécharger PDF" télécharge un PNG
- **Fichier :** `page.tsx:714-724`
- **Problème :** Le bouton "Télécharger PDF" appelle `handleDownload` (ligne 243) qui télécharge un PNG (ligne 248 : `link.download = "dessin-magique-petit-baobab.png"`). Aucune conversion PDF n'est effectuée.
- **Conséquence :** L'utilisateur clique sur "PDF" et reçoit un fichier `.png`. Trompeur.
- **Fix :** Soit générer un vrai PDF (jsPDF + image), soit remplacer l'étiquette par "Télécharger PNG" et supprimer le bouton en double. Actuellement il y a DEUX boutons "Télécharger PNG" (lignes 702 et 714).

### 3. Boutons décoratifs sans `onClick`
- **Fichier :** `page.tsx:399-404` (Historique), `488-490` (ChevronRight suggestions), `766-768` (Voir tout variantes)
- **Problème :** Trois boutons ont une apparence cliquable mais aucun `onClick`. "Historique" (ligne 399), le chevron des suggestions (ligne 488), et "Voir tout" des variantes (ligne 766) ne font rien.
- **Conséquence :** L'utilisateur clique et rien ne se passe. Friction et perte de confiance.
- **Fix :** Ajouter les `onClick` manquants ou masquer/rendre inactifs les boutons non implémentés.

### 4. Avatar du header statique (pas de profil store)
- **Fichier :** `page.tsx:407-413`
- **Problème :** L'avatar utilise un seed fixe `"child"` (ligne 409) et un fallback `"AW"` en dur (ligne 410). Ne lit pas `useProfileStore` pour afficher le vrai profil actif.
- **Conséquence :** L'enfant ne voit pas son avatar ni son nom, contrairement au reste de l'app.
- **Fix :** Lire `useProfileStore.getState().activeProfileId` et afficher le profil correspondant.

### 5. Section "Variantes" avec images statiques
- **Fichier :** `page.tsx:87-92`, `760-785`
- **Problème :** Les 4 variantes sont des images mock statiques (`girafe.svg`, `elephant.svg`, etc.) qui ne changent JAMAIS, quel que soit le prompt ou le style. Pas de génération réelle de variantes.
- **Conséquence :** L'utilisateur voit les mêmes images à chaque génération. Fonctionnalité factice.
- **Fix :** Soit implémenter la génération de variantes réelles (via plusieurs appels API avec des variations de prompt), soit masquer la section tant que ce n'est pas fonctionnel.

---

## P1 — Risque d'échec de la tâche

### 6. Crédits affichés sous "Étoiles" (label incohérent)
- **Fichier :** `page.tsx:386-396`
- **Problème :** La carte des crédits affiche "Étoiles" en label (ligne 394), mais la carte des stars affiche aussi "Mes étoiles" (ligne 380). L'utilisateur confond les deux.
- **Conséquence :** L'utilisateur ne comprend pas la différence entre les étoiles (monnaie) et les crédits (quotidiens).
- **Fix :** Renommer le label en "Crédits aujourd'hui" ou "Gratuits restants".

### 7. Pas d'état vide pour l'historique
- **Fichier :** Pas de page `/magic-drawing/history`
- **Problème :** Le bouton "Historique" n'a pas de page de destination. Aucune page n'existe pour voir les dessins magiques précédents.
- **Conséquence :** Les dessins sont sauvegardés automatiquement (ligne 200-226) mais l'utilisateur ne peut pas y accéder.
- **Fix :** Créer une page ou un modal d'historique listant les dessins IA sauvegardés (via `drawingService.list({ origin: "ia" })`).

### 8. Pas de confirmation avant génération (coût non nul)
- **Fichier :** `page.tsx:575-613`
- **Problème :** Le bouton "Créer mon dessin magique" consomme des étoiles/ crédits immédiatement sans demande de confirmation. Si l'utilisateur clique par erreur, il perd ses ressources.
- **Conséquence :** Frustration si clic accidentel.
- **Fix :** Ajouter un dialog de confirmation pour les styles coûteux (≥ 3 étoiles) ou un bouton undo undo.

### 9. Variantes : pas de chargement d'image
- **Fichier :** `page.tsx:770-783`
- **Problème :** Les images des variantes n'ont pas de `loading` ou d'état de chargement. Si une image est lente à charger, un trou blanc apparaît.
- **Conséquence :** Flash de contenu manquant.
- **Fix :** Ajouter un placeholder de chargement ou `loading="lazy"`.

---

## P2 — Friction significative

### 10. Pas de zoom/lightbox sur l'image générée
- **Fichier :** `page.tsx:675-696`
- **Problème :** L'aperçu de l'image générée est fixe dans un carré 4:3. L'utilisateur ne peut pas voir l'image en grand ou zoomer sur les détails.
- **Fix :** Ajouter un lightbox au clic sur l'image (overlay plein écran).

### 11. "Ajouter à mon livre" sans feedback de navigation
- **Fichier :** `page.tsx:304-340`
- **Problème :** Après avoir ajouté au livre, seul un message texte apparaît. L'utilisateur ne peut pas naviguer vers son livre.
- **Fix :** Ajouter un lien "Voir mon livre" après l'ajout réussi.

### 12. Suggestions hors écran sans défilement visible
- **Fichier :** `page.tsx:467-491`
- **Problème :** Les chips de suggestion défilent horizontalement (`overflow-x-auto`) mais il n'y a pas d'indicateur visuel de défilement. Le bouton chevron est censé indiquer "plus" mais ne fait rien.
- **Fix :** Rendre le chevron fonctionnel (scroll de 200px vers la droite) ou le remplacer par des points de pagination.

### 13. Icône de verrouillage incohérente
- **Fichier :** `page.tsx:529-533`
- **Problème :** L'icône de verrouillage utilise `Lock` de lucide sur fond gris, mais le message en bas dit "Réservé aux abonnés". Le style verrouillé n'est pas expliqué (coût vs abonnement).
- **Fix :** Clarifier dans l'UI : soit "Premium" avec un badge doré, soit expliquer que le coût (3 étoiles) nécessite un abonnement pour débloquer plus de crédits.

### 14. Pas de meta-description / SEO pour la page
- **Fichier :** Pas de `metadata` export dans `page.tsx`
- **Problème :** La page n'a pas d'export `metadata` pour le référencement ou le partage social.
- **Conséquence :** Mauvais partage sur les réseaux sociaux, pas de description dans les search results.
- **Fix :** Ajouter `export const metadata = { title, description }`.

---

## P3 — Améliorations mineures

### 15. Cooldown manquant après génération
- **Fichier :** `page.tsx:126-237`
- **Problème :** L'utilisateur peut cliquer plusieurs fois sur "Créer" pendant la génération sans blocage supplémentaire (le bouton est désactivé via `isGenerating` mais des appels concurrents pourraient passer si l'état n'est pas à jour).
- **Fix :** Ajouter un debounce ou un vérrouillage côté client.

### 16. Pas de message de bienvenue pour les nouveaux utilisateurs
- **Fichier :** `page.tsx`
- **Problème :** La page s'affiche directement sans onboarding. Un enfant de 3-7 ans ne comprend pas forcément le concept de "prompt" ou "style du dessin".
- **Fix :** Ajouter un tooltip ou une première visite guidée simple.

### 17. Compteur de caractères redondant avec `maxLength`
- **Fichier :** `page.tsx:457,461-463`
- **Problème :** Le `maxLength={maxChars}` (200) combiné au `slice(0, maxChars)` dans `onChange` est redondant. Le `slice` n'est jamais atteint car `maxLength` bloque déjà.
- **Fix :** Supprimer le `slice` dans `onChange`, garder uniquement `maxLength`.

### 18. Image de suggestion sans attribut `alt` pertinent
- **Fichier :** `page.tsx:477`
- **Problème :** L'`alt` des images de suggestion est `s.label` mais ces images sont purement décoratives. Le label est déjà affiché textuellement à côté.
- **Fix :** Mettre `alt=""` (décoratif) pour éviter la duplication.

---

## Recommandations prioritaires

1. **Changer le style par défaut** de `"noir_blanc"` à `"contour_simple"` pour les utilisateurs gratuits.
2. **Corriger le doublon "Télécharger PNG"** — un des deux boutons doit être retiré ou transformé en vrai PDF.
3. **Ajouter les `onClick` manquants** — Historique, ChevronRight suggestions, Voir tout variantes.
4. **Rendre l'avatar dynamique** — lire depuis `useProfileStore`.
5. **Masquer les variantes statiques** ou les rendre fonctionnelles.
6. **Créer une page d'historique** pour les dessins magiques sauvegardés.
7. **Renommer "Étoiles" en "Crédits"** dans le badge des crédits.
8. **Ajouter une confirmation** pour les générations coûteuses (≥ 3 étoiles).
