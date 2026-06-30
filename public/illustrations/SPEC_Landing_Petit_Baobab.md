# SPEC — LANDING PAGE PETIT BAOBAB
## Next.js 15 + Tailwind CSS v4 + Shadcn UI

---

# 0. TOKENS TAILWIND (à ajouter dans tailwind.config / globals.css)

```css
:root {
  /* Couleurs de marque */
  --color-bg: #FFF9F2;
  --color-text: #1A1A2E;
  --color-text-muted: #6B6B7B;
  --color-primary: #7D6AF8;      /* violet - CTA principal */
  --color-primary-dark: #6552E8;
  --color-secondary: #20C997;    /* vert africain */
  --color-accent-orange: #FFB300;
  --color-accent-yellow: #FFD95C;
  --color-accent-blue: #1194FF;
  --color-accent-pink: #FF5E83;
  --color-white: #FFFFFF;
  --color-border: #F0E7DA;
  --color-card-bg: #FFFFFF;
  --color-banner-purple: #7D6AF8;

  /* Rayons */
  --radius-sm: 16px;
  --radius-md: 20px;
  --radius-lg: 24px;
  --radius-xl: 28px;
  --radius-hero: 32px;
  --radius-pill: 999px;

  /* Ombres */
  --shadow-card: 0 4px 12px rgba(0,0,0,.06);
  --shadow-hover: 0 10px 30px rgba(0,0,0,.12);

  /* Typographie */
  --font-family: 'Nunito Sans', 'Nunito', sans-serif;
}
```

Tailwind config extend:
```js
fontSize: {
  'display-lg': ['48px', { lineHeight: '1.1', fontWeight: '800' }],
  'display-md': ['32px', { lineHeight: '1.2', fontWeight: '800' }],
  'headline-lg': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
  'body-lg': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
  'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
},
colors: {
  brand: {
    bg: '#FFF9F2', text: '#1A1A2E', primary: '#7D6AF8',
    secondary: '#20C997', orange: '#FFB300', yellow: '#FFD95C',
    blue: '#1194FF', pink: '#FF5E83', border: '#F0E7DA'
  }
}
```

---

# 1. STRUCTURE GLOBALE

- Container max-width : `1280px`, centré, padding horizontal `px-6` (24px) mobile, `px-10` (40px) desktop
- Fond global : `bg-brand-bg` (#FFF9F2)
- Police globale : Nunito Sans, poids 400/600/700/800
- z-index layers : Header `z-50`, Sheet/Modal `z-[100]`, illustrations décoratives de fond `z-0`, contenu `z-10`

---

# 2. HEADER (Navbar)

**Conteneur** : `sticky top-0 z-50`, hauteur `80px`, `bg-white/90 backdrop-blur-sm`, `border-b border-brand-border`, padding horizontal aligné container.

**Layout** : `flex items-center justify-between`

### 2.1 Logo (gauche)
- Icône baobab stylisée (SVG, vert `#20C997` + brun tronc `#8B5A2B`), taille `40x40px`
- Texte "Petit" (gris foncé `#1A1A2E`, `font-bold`, `18px`) + "Baobab" (violet `--color-primary`, `font-extrabold`, `18px`) sur 2 lignes serrées
- Sous-titre "Apprendre, créer, grandir !" en dessous, `11px`, `text-brand-text-muted`, `font-medium`
- Gap entre icône et texte : `12px`

### 2.2 Navigation centrale (desktop ≥1024px uniquement)
`flex gap-8`, items : Accueil, Fonctionnalités, Livres (avec chevron dropdown — composant Shadcn `DropdownMenu`), Tarifs, À propos
- Style lien : `text-[15px] font-semibold text-brand-text`, hover → `text-brand-primary`, transition `200ms`
- "Livres" : `DropdownMenuTrigger` avec icône `ChevronDown` (Lucide, 16px) à droite du label

### 2.3 Actions (droite)
`flex items-center gap-3`
- Bouton "Se connecter" : composant Shadcn `Button variant="outline"`, `rounded-full`, hauteur `44px`, padding `px-6`, bordure `1px solid #E5E0D5`, fond transparent, texte `font-semibold`
- Bouton "Créer un compte" : `Button variant="default"`, fond `bg-brand-primary`, `rounded-full`, hauteur `44px`, padding `px-6`, texte blanc `font-semibold`, `shadow-card`, hover → `bg-[--color-primary-dark]` + `shadow-hover` + `scale-[1.02]` (transition `200ms ease-out`)

### 2.4 Responsive header
- `<1024px` : nav centrale masquée, remplacée par icône `Menu` (Lucide) ouvrant un `Sheet` (Shadcn) latéral droit contenant les mêmes liens empilés verticalement + les 2 boutons CTA en pleine largeur en bas du sheet
- `<640px` : logo réduit à icône seule + "Petit Baobab" sur une ligne, sous-titre masqué

---

# 3. HERO SECTION

**Conteneur** : `grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`, padding vertical `py-16 lg:py-24`, position `relative` (pour les illustrations en fond)

### 3.1 Colonne gauche (texte)
- Titre H1, `text-display-lg` (48px desktop, `36px` mobile), `font-extrabold`, `leading-tight`, 3 lignes exactes :
  - Ligne 1 : "Le coloriage" — couleur `text-brand-text`
  - Ligne 2 : "qui éveille la " (texte normal) + "créativité" (`text-brand-primary`, même poids)
  - Ligne 3 : "et célèbre " (texte normal) + "l'Afrique" (`text-brand-secondary`)
- Paragraphe sous le titre, `text-body-lg`, `text-brand-text-muted`, `max-w-[480px]`, `mt-6` : "Des milliers de dessins africains, des histoires captivantes et des outils intelligents pour apprendre en s'amusant."
- Bloc CTA, `flex gap-4 mt-8 flex-wrap` :
  - Bouton "Commencer gratuitement" : `Button`, fond `bg-brand-primary`, `rounded-full`, hauteur `56px`, padding `px-8`, texte blanc `16px font-bold`, `shadow-hover`, hover `scale-[1.03]`
  - Bouton "Découvrir Petit Baobab" : `Button variant="outline"`, fond blanc, `rounded-full`, hauteur `56px`, padding `px-8`, icône `Play` (Lucide, filled, 16px) à gauche du label dans un cercle violet clair `bg-brand-primary/10`
- Bloc badges de confiance, `flex gap-6 mt-10 flex-wrap`, chaque item = icône (cercle coloré 32px) + label `14px font-semibold text-brand-text-muted` :
  - ✅ icône `ShieldCheck` vert `#20C997` — "100% sécurisé"
  - 🚫 icône `Ban` rouge `#FF5E5E` — "Sans publicité"
  - 🏅 icône `Award` jaune `#FFD95C` — "Approuvé par les parents"

### 3.2 Colonne droite (illustration hero)
- Conteneur `relative h-[480px] lg:h-[560px]`
- **Calque de fond** (`z-0`) : forme arrondie décorative pastel (cercle/blob `bg-brand-yellow/20`), `absolute inset-0`, légère ombre nuage en haut à gauche
- **Illustration scène** (`z-10`) : enfant souriant (style flat illustration, peau brune, couettes avec perles colorées), bras levé, tenant un crayon, débardeur jaune + salopette verte — `absolute top-0 right-0 w-[60%]`
- **Case africaine + baobab** (`z-10`) : à l'arrière-plan droite, toit conique orange/brun — `absolute top-8 right-0 w-[35%]`
- **Girafe** (`z-10`) : silhouette à droite de la case, partiellement coupée par le bord — `absolute top-16 right-[-5%] w-[20%]`
- **Livre ouvert** (`z-20`, élément central dominant) : double page, page gauche = lion colorié (orange/jaune), page droite = baobab + case en line-art noir et blanc — `absolute bottom-0 left-0 w-[85%]`, `shadow-hover`, `rounded-lg`
- **Pot de crayons de couleur** (`z-20`) : motif Faso Danfani sur le pot, crayons multicolores dépassant — `absolute bottom-0 right-0 w-[18%]`
- **Animation** : flottement vertical doux sur l'ensemble du groupe illustration (`animate-float`), keyframes Framer Motion :
```js
animate={{ y: [0, -10, 0] }}
transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
```

---

# 4. BANDE DE FONCTIONNALITÉS (Feature Strip)

**Conteneur** : carte blanche unique, `bg-white rounded-3xl shadow-card`, padding `py-10 px-6`, `mt-16`, `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8`

Chaque item (composant `FeatureIcon`) : `flex flex-col items-center text-center gap-3`
- Icône dans cercle coloré `w-14 h-14 rounded-full flex items-center justify-center`, couleur de fond distincte par item, icône Lucide blanche `24px`
- Titre `text-[15px] font-bold text-brand-text`
- Description `text-[13px] text-brand-text-muted leading-snug max-w-[140px]`

| # | Icône (Lucide) | Couleur fond cercle | Titre | Description |
|---|---|---|---|---|
| 1 | `Palette` | `#7D6AF8` (violet) | Coloriages uniques | Des centaines de dessins inspirés de l'Afrique. |
| 2 | `Bot` | `#20C997` (vert) | Dessin magique | Transforme tes idées en coloriages. |
| 3 | `BookOpen` | `#FFB300` (orange) | Livres personnalisés | Crée ton propre livre de coloriage. |
| 4 | `Gamepad2` | `#1194FF` (bleu) | Jeux éducatifs | Apprends en jouant avec des jeux amusants. |
| 5 | `BookHeart` | `#FF5E83` (rose) | Histoires captivantes | Lis des histoires qui éveillent l'imagination. |
| 6 | `Star` | `#FFD95C` (jaune) | Récompenses | Gagne des badges et progresse. |

Hover par carte : `translateY(-4px)` + `shadow-hover`, transition `200ms`

---

# 5. SECTION "COMMENT ÇA MARCHE ?"

**Conteneur** : `py-20 text-center`
- Titre H2 `text-display-md`, `font-extrabold`, centré, `mb-12` : "Comment ça marche ?"
- Grille `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative`, avec flèches `ArrowRight` (Lucide, `24px`, `text-brand-text-muted`) positionnées en `absolute` entre chaque carte sur desktop (`hidden lg:block`), centrées verticalement

Chaque étape (composant `StepCard`) : `flex flex-col items-center text-center`
- Illustration carrée arrondie, `w-[180px] h-[140px] rounded-2xl object-cover`, scène illustrée différente par étape (enfant avec livre / enfant qui colorie / aperçu livre / téléchargement)
- Badge numéro : cercle `w-9 h-9 rounded-full flex items-center justify-center text-white font-bold`, positionné `absolute -top-3 -left-3` sur l'illustration, couleur distincte par étape :
  1. Violet `#7D6AF8`
  2. Vert `#20C997`
  3. Orange `#FFB300`
  4. Vert (icône `Download` au lieu d'illustration photo, fond plein cercle vert `#20C997`, icône blanche centrée)
- Titre `text-[17px] font-bold mt-4` : Choisis / Personnalise / Aperçois / Télécharge
- Description `text-[14px] text-brand-text-muted mt-1` : "Parmi des centaines de dessins." / "Ton livre avec tes couleurs et ton style." / "Ton livre avant de le télécharger." / "Ton livre ou demande une impression."

---

# 6. BANNIÈRE "CRÉE TON PROPRE LIVRE"

**Conteneur** : `bg-brand-yellow/15 rounded-3xl p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.2fr] gap-8 items-center overflow-hidden relative`, `my-16`

### 6.1 Colonne gauche — illustration enfants
- 2 enfants illustrés tenant chacun un livre ouvert, debout côte à côte, `relative z-10`, feuillage décoratif en bas (`absolute bottom-0 left-0 z-0`, opacité réduite)

### 6.2 Colonne centrale — texte
- Icône étoile jaune `⭐` (Lucide `Star`, filled, `20px`) + Titre `text-headline-lg font-extrabold` sur 2 lignes : "Crée ton propre livre / de coloriage"
- Paragraphe `text-body-md text-brand-text-muted mt-3` : "Un livre unique, à ton image. Parfait pour s'amuser, apprendre et offrir !"
- Bouton "Créer mon livre" : `Button`, fond `bg-brand-primary`, `rounded-full`, hauteur `48px`, padding `px-7`, texte blanc `font-bold`, `mt-6`

### 6.3 Colonne droite — 3 couvertures de livre en éventail
- 3 cartes livre `rounded-xl shadow-hover`, légèrement superposées et tournées (`rotate-[-6deg]`, `rotate-[0deg]`, `rotate-[6deg]`), `w-[140px] h-[180px]` chacune :
  1. "Les animaux de la savane" — fond beige, illustration éléphant + girafe, bordure motif Faso Danfani
  2. "Mon livre de coloriage" (carte centrale, légèrement surélevée `z-10`, plus grande `w-[150px] h-[195px]`) — fond rose/violet, illustration 2 enfants
  3. "Les instruments africains" — fond vert clair, illustration balafon + djembé + guitare

---

# 7. SECTION TÉMOIGNAGES "Ils adorent Petit Baobab"

**Conteneur** : `py-20`
- Titre H2 centré `text-display-md font-extrabold mb-12` : "Ils adorent Petit Baobab"
- Carousel (Shadcn `Carousel`), `relative`, flèches navigation `ChevronLeft`/`ChevronRight` en cercles blancs `shadow-card` positionnées `absolute top-1/2 -translate-y-1/2`, gauche `-left-4`, droite `-right-4`
- Slides : `grid grid-cols-1 sm:grid-cols-3 gap-6` (3 cartes visibles desktop, swipe mobile)

Chaque carte témoignage (composant `TestimonialCard`) : `bg-white rounded-2xl shadow-card p-6`
- Header `flex items-center gap-3 mb-3` : avatar rond `w-12 h-12 rounded-full object-cover`, à côté : nom `font-bold text-[15px]` + rôle `text-[13px] text-brand-text-muted` sur 2 lignes
- Étoiles : `flex gap-0.5 mb-3`, 5 icônes `Star` (Lucide, filled, `14px`, couleur `#FFD95C`)
- Citation : `text-[14px] text-brand-text italic leading-relaxed`

Contenus exacts :
1. Aminata, maman — "Mon fils adore créer ses propres livres. Les dessins sont magnifiques et éducatifs."
2. Yacouba, enseignant — "Parfait pour mes élèves ! Les histoires et activités sont très enrichissantes."
3. Fatou, maman — "Enfin une application africaine qui valorise notre culture."

---

# 8. BANNIÈRE CTA FINALE

**Conteneur** : `bg-brand-primary rounded-3xl p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center overflow-hidden relative`, `mb-20`

### 8.1 Colonne gauche
- Titre `text-headline-lg lg:text-display-md font-extrabold text-white` sur 2 lignes : "Prêt à éveiller la créativité / de votre enfant ?"
- Paragraphe `text-body-md text-white/85 mt-3` : "Rejoignez des milliers de familles qui font déjà confiance à Petit Baobab."
- Boutons `flex items-center gap-6 mt-6 flex-wrap` :
  - "Commencer gratuitement" : `Button`, fond blanc, texte `text-brand-primary font-bold`, `rounded-full`, hauteur `52px`, padding `px-7`
  - "Aucune carte bancaire requise" : texte simple `text-white/80 text-[14px] font-medium` (pas un bouton, juste un repère de confiance à côté)

### 8.2 Colonne droite — illustration
- Enfant assis en tailleur dessinant un baobab sur une feuille, pot de crayons à côté — `absolute bottom-0 right-0 w-[280px]`, `z-10`

---

# 9. FOOTER

**Conteneur** : `bg-brand-bg pt-16 pb-8 border-t border-brand-border relative overflow-hidden`
- Illustration décorative herbe/buisson en bas à droite, `absolute bottom-0 right-0 w-[200px] z-0 opacity-90`
- Contenu principal `grid grid-cols-2 lg:grid-cols-4 gap-10 relative z-10`

### 9.1 Colonne logo
- Logo identique au header (icône + "Petit Baobab" + sous-titre)

### 9.2 Colonne "Produit"
Titre `font-bold text-[15px] mb-4`, liens `flex flex-col gap-2 text-[14px] text-brand-text-muted` : Coloriages, Livres, Jeux éducatifs, Histoires

### 9.3 Colonne "Entreprise"
À propos, Notre mission, Blog, Contact

### 9.4 Colonne "Ressources"
Aide, Guide parents, Confidentialité, Conditions

### 9.5 Bloc réseaux sociaux
"Suivez-nous" `font-bold text-[15px] mb-3`, icônes en ligne `flex gap-3` : `Facebook`, `Instagram`, icône TikTok (custom SVG, Lucide n'en a pas), `Youtube` — chaque icône dans cercle `w-9 h-9 rounded-full bg-white shadow-card`, hover `bg-brand-primary` + icône blanche

### 9.6 Mentions légales
`border-t border-brand-border mt-12 pt-6 text-center text-[13px] text-brand-text-muted` : "© 2025 Petit Baobab. Tous droits réservés."

---

# 10. RESPONSIVE — RÉCAPITULATIF DES BREAKPOINTS

| Breakpoint | Comportement |
|---|---|
| `≥1280px` | Layout complet tel que décrit, container `max-w-[1280px]` |
| `1024–1279px` | Container `max-w-[960px]`, hero passe à `gap-8` |
| `768–1023px` | Nav desktop masquée → Sheet mobile, hero `grid-cols-1` (texte au-dessus, illustration en dessous), feature strip `grid-cols-3` |
| `640–767px` | Bannière "Crée ton livre" passe en `grid-cols-1` empilé, témoignages `grid-cols-1` avec swipe |
| `<640px` | Titres réduits (`display-lg`→`36px`), padding container `px-4`, boutons CTA `w-full` dans les bannières, footer `grid-cols-1` |

---

# 11. ANIMATIONS (Framer Motion)

| Élément | Animation | Trigger |
|---|---|---|
| Illustration hero (groupe) | Flottement vertical `y: [0,-10,0]`, durée 4s, `repeat: Infinity` | Au chargement |
| Cartes feature strip | `initial opacity:0, y:20` → `animate opacity:1, y:0`, stagger `0.08s` par carte | `whileInView` |
| Étapes "Comment ça marche" | Même pattern stagger | `whileInView` |
| Boutons CTA | `whileHover={{ scale: 1.03 }}`, `whileTap={{ scale: 0.97 }}` | Interaction |
| Cartes témoignages | Fade + slide horizontal au changement de slide carousel | Navigation carousel |
| Couvertures livre (bannière section 6) | Légère rotation accentuée au hover (`rotate` +3deg) | Hover |

---

# 12. COMPOSANTS SHADCN UTILISÉS

- `Button` (variants: default, outline)
- `Sheet` (menu mobile)
- `DropdownMenu` (lien "Livres" du header)
- `Carousel` (témoignages)
- `Avatar` (photos témoignages, fallback initiales)
- `Badge` (optionnel, pour étiquettes futures sur les cartes livre)

---

# 13. ARBORESCENCE DE FICHIERS SUGGÉRÉE

```
app/
  page.tsx                      → assemble toutes les sections
components/
  landing/
    Header.tsx
    Hero.tsx
    FeatureStrip.tsx
    HowItWorks.tsx
    CreateBookBanner.tsx
    Testimonials.tsx
    FinalCtaBanner.tsx
    Footer.tsx
  ui/                            → composants Shadcn générés
```
