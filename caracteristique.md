# Caractéristiques des motifs de couverture

Documentation technique des fichiers SVG utilisés pour les modèles de couverture
des livres de coloriage (`/livres-de-coloriage` → onglet **Couverture**).

## Emplacement

Tous les fichiers sont stockés dans :

```
public/illustrations/covers/
```

Ils sont servis statiquement par Next.js (dossier `public/`), donc accessibles via
l'URL `/illustrations/covers/<nom>.svg`.

## Format

| Propriété      | Valeur exigée                                    |
|----------------|--------------------------------------------------|
| Type de fichier| **SVG** (`image/svg+xml`) — vectoriel, net       |
| Extension      | `.svg` (minuscules)                              |
| Fond           | **Transparent** (pas de `<rect>` plein derrière) |
| Couleurs       | **Fixes** (les motifs ne sont PAS teintés par la palette) |
| Taille fichier | < 50 Ko recommandé (idéalement quelques Ko)      |

> Le fond transparent permet au dégradé de la palette (choisie par l'utilisateur)
> de rester visible derrière le motif. Si un fond plein est nécessaire, utiliser
> de préférence des couleurs claires et pastel.

## Dimensions et viewBox

Utiliser **obligatoirement** cette zone de dessin :

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  ...
</svg>
```

| Propriété | Valeur        |
|-----------|---------------|
| viewBox   | `0 0 200 200` |
| Largeur   | 200 (unités)  |
| Hauteur   | 200 (unités)  |

Le motif doit être **centré** et tenir dans un carré pour un rendu harmonieux
(affichage en `object-contain`).

## Nomenclature des fichiers

Le nom de fichier **doit** suivre le modèle `cover-<id>.svg` où `<id>` correspond
exactement à l'identifiant du modèle de couverture utilisé dans le code.

| ID (nom de fichier)          | Modèle affiché      | Libellé (UI)        |
|------------------------------|---------------------|---------------------|
| `.svg`     | `petit-baobab`      | Petit Baobab        |
| `cover-savane.svg`           | `savane`            | Savane              |
| `cover-ecole.svg`            | `ecole`             | École               |
| `cover-afrique.svg`          | `afrique`           | Afrique             |
| `cover-coloree.svg`          | `coloree`           | Colorée             |
| `cover-ia.svg`               | `ia`                | Générée par IA      |

⚠️ **Ne pas renommer** ces fichiers sans mettre à jour en conséquence :
- `src/features/coloring-book/components/BookPreviewCanvas.tsx` (objet `coverArtSrc`)
- `src/components/coloring-books-page.tsx` (vignettes de sélection)

Pour ajouter un nouveau modèle, il faut :
1. créer `cover-<nouvel-id>.svg` ici,
2. ajouter `"<nouvel-id>"` au type `CoverTemplate`,
3. ajouter l'entrée dans `coverArtSrc` et dans la liste des vignettes.

## Où sont-ils affichés

1. **Aperçu de couverture** (`BookPreviewCanvas`) — motif centré, `max-h-[200px]`,
   `object-contain`, avec ombre légère.
2. **Vignettes de sélection** (onglet Couverture) — boîte `100 × 52 px` avec un
   fond pastel par modèle, motif en `object-contain`.
3. **Couverture des livres sauvegardés** — une capture PNG est générée depuis le
   motif au moment de l'enregistrement (`uploadBookCover` dans `coloring-books-page.tsx`).

## Exemple de fichier minimal valide

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <!-- Fond transparent : aucun rect plein -->
  <circle cx="100" cy="100" r="50" fill="#6D4CFF"/>
  <circle cx="100" cy="100" r="28" fill="#FFD95C"/>
</svg>
```
