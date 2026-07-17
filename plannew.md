# Plan d'implémentation — Refactor du module "Livres de coloriage"

> Contexte : Petit Baobab (`petit-baobab/`). Module `features/coloring-book`.
> Objectif : corriger le bug d'impression (première page répétée / contenu perdu) et
> créer une architecture propre séparant **version interactive** (écran) et
> **version impression / PDF** (données seules).

---

## 1. Analyse du code actuel (racine du bug)

### Cause racine — l'impression utilise le composant interactif

- `handlePrintPdf` → `window.print()` imprime toute l'application (sidebar, stepper, etc.) :
  `src/components/coloring-books-page.tsx:301-303`
- Le bouton "Aperçu avant impression" fait `setIsPrintableBookOpen(true)` puis `window.print()` :
  `src/components/coloring-books-page.tsx:1819-1822`.
  Or **`isPrintableBookOpen` est déclaré (l.147) mais jamais utilisé** pour rendre une version
  imprimable. Aucun `<BookPrint />` n'existe.
- Le visualiseur (step 3) ne rend **qu'une seule page** dans le DOM via
  `bookPages[currentBookPage]` encapsulé dans `<AnimatePresence mode="wait">` :
  `src/components/coloring-books-page.tsx:1297-1421`.
  Au print, une seule page est présente dans le DOM → les autres "disparaissent" ou la
  première semble répétée selon le CSS.
- **Aucun `@media print`** dans `src/app/globals.css` (vérifié : 0 résultat).

### PDF (`useBookPdf`)
- Utilise déjà `jspdf` + `svg2pdf.js` et itère correctement sur `pages` :
  `src/lib/pdf/vectorBookPdf.ts:116-129`.
- Fonctionnel mais : dessins de librairie sans SVG → fallback raster (`p.image`) ;
  les SVG persos viennent du `localStorage` via `getDrawingSvg`
  (`src/lib/pdf/drawingSvgCache.ts`).
- Le prompt veut `@react-pdf/renderer` ou `pdf-lib` et un générateur dédié `BookPDF`.

### Modèle de données
- `BookPage` actuel (`src/features/coloring-book/types/BookPage.ts`) =
  `{ type, label, details, image, id?, svg? }`.
  Diffère du modèle du prompt (`id, title, svg, theme, category`).
- `useBookStore` (Zustand) construit `preview` via `buildPreview`
  (`src/features/coloring-book/utils/book.utils.ts:19-49`).

### Détails problématiques
- `BookPreviewCanvas.tsx` abonde en **styles inline** (`style={{ ... }}`) → viole "Aucun style inline".
- `useBookPrinting.ts` ne fait qu'exposer le store, inutile actuellement.
- Dépendances : `jspdf` présent, **pas** `@react-pdf/renderer` ni `pdf-lib`.
- Code dupliqué : la cover est rendue 3 fois dans `coloring-books-page.tsx`
  (step1, step2 mobile, step3 colonne droite).

---

## 2. Analyse du prompt (écarts / contradictions à trancher)

| Point | Recommandation |
|---|---|
| `components/books/*` (flat) vs architecture existante `features/coloring-book` | Garder le **feature-sliced** existant (`features/coloring-book/components`), plus propre et idiomatique. Créer un dossier `print/` et `pdf/` dedans. |
| `@react-pdf/renderer` OU `pdf-lib` | `jspdf` + `svg2pdf` est déjà en place et gère le **SVG vectoriel** (idéal pour coloriage). `@react-pdf/renderer` a un support SVG limité ; `pdf-lib` rasterise. **Reco : garder jsPDF** pour le PDF vectoriel, ou migrer vers `@react-pdf/renderer` si besoin de layout React. Proposition : conserver jsPDF (moins de rupture). |
| `BookContext` (Context API) vs Zustand | Le projet utilise Zustand. **Reco : garder Zustand** (`useBookStore`) et ajouter un `BookProvider` léger (facade Context) si le prompt l'exige formellement. Éviter un 2e système d'état. |
| "300 dpi" | Le SVG est vectoriel (indépendant de la résolution). Ne s'applique qu'au fallback raster. À documenter. |
| "Aucun style inline" + `BookPreviewCanvas` | Nécessite réécriture complète de la cover en classes Tailwind (gradients/palette via variables CSS). |
| Pages `belongs_to` / `cover` | Le prompt liste `BookPage { svg }` mais cover & garde sont des pages spéciales. Modèle à unifier : `BookPage` discriminé par `type`. |

---

## 3. Plan d'implémentation

### Phase 0 — Modèle de domaine (canonique)
- `types/ColoringBook.ts` :
  `ColoringBook { id, title, subtitle, cover, pages: BookPage[], settings, format, orientation }`
- `types/BookPage.ts` (révisé) :
  `BookPage { id: string; title: string; svgPath?: string; svg?: string; theme: string; category: string; type: "cover" | "belongs_to" | "drawing" }`
- Mapping `settings` conservant **toutes** les options :
  titre, sous-titre, couverture, format, orientation, nb dessins, page de garde,
  numérotation, cadre, style, optimiser encre, recto, repères de coupe, marge reliure, bleed.
- **Jamais d'index comme clé React** — chaque page a `id` unique (`crypto.randomUUID()`).

### Phase 1 — Séparation stricte View / Print / PDF
```
features/coloring-book/
  components/
    BookBuilder.tsx      // orchestrateur (wizard) – remplace la logique de coloring-books-page
    BookViewer.tsx       // VERSION INTERACTIVE (écran): zoom, flipbook, nav, animations Framer
    BookPrint.tsx        // VERSION IMPRESSION – reconstruit le livre, 0 animation
    BookPage.tsx         // page interactive (canvas/zoom/anim)
    BookCover.tsx        // cover Tailwind pure (plus d'inline style)
    BookIndex.tsx        // sommaire / miniatures
    BookFooter.tsx       // footer page (numérotation)
    BookHeader.tsx       // (existant, à nettoyer)
    BookPDF.tsx          // wrapper générateur PDF
    PrintButton.tsx      // ouvre BookPrint -> window.print() -> revient à l'app
    DownloadButton.tsx   // construit BookPDF -> télécharge
  print/
    print.css            // @media print (A4, break-after, masquage UI)
    usePrintBook.ts
  pdf/
    generateBookPdf.ts   // refactor de vectorBookPdf.ts (svg centré, marges 10mm)
    useBookPdf.ts        // (existant, à adapter)
  context/
    BookContext.tsx      // facade sur useBookStore
```

Mapping avec la liste du prompt :
| Composant prompt | Implémentation |
|---|---|
| BookBuilder | `components/BookBuilder.tsx` |
| BookViewer | `components/BookViewer.tsx` (interactif) |
| BookPrint | `components/BookPrint.tsx` (impression) |
| BookPage | `components/BookPage.tsx` |
| BookCover | `components/BookCover.tsx` |
| BookIndex | `components/BookIndex.tsx` |
| BookFooter | `components/BookFooter.tsx` |
| BookHeader | `components/BookHeader.tsx` |
| BookPDF | `pdf/generateBookPdf.ts` + `components/BookPDF.tsx` |
| PrintButton | `components/PrintButton.tsx` |
| DownloadButton | `components/DownloadButton.tsx` |

### Phase 2 — `BookPrint` (supprime le bug)
- Reçoit **uniquement les données** (`ColoringBook`).
- Rend chaque page dans `<section className="print-page">…</section>` →
  **toutes les pages présentes dans le DOM** (pas de `currentBookPage` unique).
- `print.css` :
  - `@page { size: A4 portrait; margin: 10mm }`
  - `.print-page { break-after: page; page-break-after: always; width: 210mm; height: 297mm }`
  - masque `.no-print` (sidebar, navbar, boutons, zoom, palette, animations).
- `BookViewer` porte la classe `.no-print` → jamais imprimé.

### Phase 3 — Boutons
- `DownloadButton` : `buildBookPdf(data)` → blob → `downloadBlob`.
  (jsPDF, SVG centré, marges 10mm, cover + pages + fin de livre).
- `PrintButton` : rendre `BookPrint` dans un overlay, `window.print()`,
  puis fermer l'overlay → retour application.

### Phase 4 — Performances & qualité
- `React.memo` sur `BookPage`, `BookCover`, sections de `BookPrint`.
- `useMemo` / `useCallback` pour construction des pages et handlers.
- `next/dynamic` (Suspense + code splitting) pour `BookPDF` et `svg2pdf`/`jspdf`
  (lazy import déjà présent, à conserver).
- Suppression : `isPrintableBookOpen` mort, `useBookPrinting` inutile,
  styles inline de `BookPreviewCanvas`, code dupliqué de la cover (3 occurrences).

### Phase 5 — Vérifications (checklist prompt)
- Test : PDF = même nb de pages que `book.pages`.
- Test : impression = PDF (mêmes sections).
- Test : chaque SVG unique (pas de réutilisation de composant SVG).
- Test : aucune page dupliquée (itération sur `pages`, clé = `page.id`).
- Test : `window.print()` n'est plus appelé sur le composant interactif.

---

## 4. Ordre d'exécution recommandé

1. Phase 0 (modèle) + Phase 2 (`BookPrint` + `print.css`) → éradique le bug d'impression en premier.
2. Phase 3 (boutons) → branche les nouveaux chemins.
3. Phase 1 (BookViewer / BookBuilder) → nettoie `coloring-books-page.tsx`.
4. Phase 4 (perf / suppression code mort).
5. Phase 5 (vérifications).

---

## 5. Risques / notes
- Migration du modèle `BookPage` : `buildPreview` et `useBookStore.preview` doivent produire
  le nouveau type (ajout `id` stable, `theme`, `category`).
- SVG des dessins de librairie : s'assurer qu'un SVG source existe (et non seulement un PNG)
  pour respecter "chaque dessin possède son propre SVG".
- Shadcn UI déjà disponible : `card`, `button`, `tabs`, `dialog`, `alert`, `tooltip`,
  `dropdown-menu`, `badge`, `progress`, `slider`, `popover`, `scroll-area` → tous utilisables.
- Framer Motion déjà en dépendance (`^12.40.0`) → animations version interactive uniquement.
