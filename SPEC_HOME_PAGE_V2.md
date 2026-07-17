# SPEC_HOME_PAGE_V2.md
# Petit Baobab — Home Page Production Specification (Pixel Perfect)

## Objective
Corriger la première capture pour obtenir le rendu de référence de la seconde capture.

Base Desktop:
- Frame: 1536 × 1024
- Content max-width: 1536px
- Background: #FFF9F2
- Font: Nunito
- 8px spacing system

---

# Tailwind Design Tokens

```ts
export const pbTokens = {
  colors: {
    background: "#FFF9F2",
    surface: "#FFFFFF",
    border: "#F0E7DA",
    text: "#3B2416",
    muted: "#7A6A5E",

    hero: "#FFF5CC",

    yellow: "#FFD95C",
    purple: "#7D6AF8",
    green: "#20C997",
    orange: "#FFB300",
    blue: "#1194FF",
    pink: "#FF5E83",
    teal: "#13C6A2"
  },

  radius: {
    sm: "16px",
    md: "20px",
    lg: "24px",
    xl: "28px",
    hero: "32px",
    pill: "999px"
  },

  shadow: {
    card: "0 4px 12px rgba(0,0,0,.06)",
    hover: "0 10px 30px rgba(0,0,0,.12)"
  }
}
```

---

# Root Layout

Desktop ≥ 1280px

```css
display:grid;
grid-template-columns: 280px 1fr;
gap:32px;

padding:
24px top
32px left/right
24px bottom;
```

Important:
- Sidebar fixe.
- Contenu principal centré.
- Aucun scroll horizontal.

---

# Sidebar

Width: 280px

```css
position:relative;
display:flex;
flex-direction:column;
height:calc(100vh - 48px);
```

## Logo

Height: 110px

Logo:
- 68 × 68

Titre:
- 38px
- 800

Sous-titre:
- 18px
- 600

---

# Navigation

Gap:
12px

Item:

- Height: 52px
- Radius: 18px
- Padding X: 20px
- Icon: 24px
- Label: 16px / 700

Active:

```css
background:#FFE08A;
```

Animation:

```css
transition:all .2s ease;
```

Hover:
- scale(1.02)

---

# Premium Card

Position:
bottom sidebar

Size:
- width: 100%
- height: 220px

Radius:
28px

Padding:
20px

Illustration:
- Child bottom-right
- 100 × 100

Button:
- 44px height
- radius 999px

---

# Top Header

Height:
72px

Layout:

```css
display:flex;
align-items:center;
justify-content:space-between;
```

Gap:
24px

---

# Search Bar

Reference capture 2

Width:
640px

Height:
54px

Radius:
999px

Padding:
0 24px

Icon:
20px

Placeholder:
16px / 500

Border:
1px solid #EFE7DB

---

# User Actions

Language button:
40 × 40

Notifications:
40 × 40

Avatar container:
176 × 56

Radius:
999px

---

# HERO SECTION

Exact reference dimensions

Height:
250px

Radius:
32px

Background:
#FFF5CC

Padding:
0

Overflow:
hidden

Layout:
2 columns

```css
grid-template-columns:
1.1fr 1fr;
```

---

# Hero Left

Padding:

top:40px
left:36px
right:24px

Character:

Size:
260 × 260

Position:
bottom aligned

Z-index:
2

---

# Hero Text Block

Position:
absolute-like centered

Title:

- 62px
- 800
- line-height 1

Color:
#3B2416

Subtitle:

- 28px
- 700

Max width:
360px

Spacing title/subtitle:
16px

Wave emoji:
48px

---

# Hero Right Landscape

Width:
100%

Contains:

- sun
- baobab
- giraffe
- hut
- plants

Landscape baseline:
bottom:24px

Element sizes:

Sun:
72 × 72

Baobab:
220 × 180

Hut:
120 × 120

Giraffe:
88 × 180

Plants:
40–60px

Z-index order:

1 Sky
2 Plants
3 Hut
4 Baobab
5 Giraffe

---

# Feature Modules Row

Height:
180px

Columns:
6

Gap:
18px

```css
grid-template-columns:
repeat(6,1fr);
```

---

# Feature Card

Height:
180px

Radius:
24px

Structure:

Top illustration:
130px

Footer:
50px

Hover:

```css
transform:translateY(-6px);
```

Duration:
220ms

---

# Module Illustrations

Exact size:

Lion:
118 × 118

Robot:
118 × 118

Book:
126 × 110

Puzzle:
118 × 118

Story girl:
120 × 118

Pencil cup:
118 × 118

Object-fit:
contain

---

# Recent Colorings Section

Container height:
355px

Radius:
28px

Padding:
20px

Header:
64px

---

# Coloring Grid

Columns:
4

Gap:
16px

Card Size:

Width:
178px

Height:
280px

Radius:
18px

Border:
1px solid #ECECEC

Padding:
12px

---

# Coloring Thumbnail

Height:
180px

Object-fit:
contain

Bottom Pencil:

Size:
32px

Position:
bottom-right

---

# Activity Panel

Width:
392px

Radius:
28px

Padding:
24px

---

# Progress Ring

Size:
96px

Stroke:
10px

Value:
75%

---

# Stats Cards

Height:
72px

Radius:
16px

Gap:
12px

Columns:
3

---

# Rewards Card

Margin top:
16px

Radius:
28px

Padding:
24px

Badge size:
72px

Grid:
4 columns

Gap:
20px

---

# Z-INDEX SCALE

```css
z-0 background
z-10 cards
z-20 hero decor
z-30 illustrations
z-40 floating actions
z-50 dropdowns
z-100 dialogs
```

---

# Shadcn Components

Mandatory

- Card
- Button
- Input
- ScrollArea
- Tooltip
- DropdownMenu
- Avatar
- Progress
- Sheet (mobile nav)

Buttons:

```tsx
<Button size="lg" className="rounded-full">
```

Cards:

```tsx
<Card className="rounded-[28px] shadow-card">
```

---

# Animations

## Card Hover

Duration:
220ms

```css
transform:translateY(-6px);
```

## Hero Illustration

Floating:

```css
animation:
float 4s ease-in-out infinite;
```

Amplitude:
8px

## Reward Badge

Hover:

```css
scale(1.08);
```

---

# Responsive

## 1280px - 1024px

Sidebar:
240px

Feature grid:
3 columns

Recent colorings:
2 columns

Right panel:
under gallery

---

## 1024px - 768px

Hero:
single column

Hero height:
420px

Modules:
2 columns

---

## Mobile ≤768px

Sidebar hidden

Use Shadcn Sheet

Bottom navigation:
5 items

Search:
100% width

Hero:
420px

Modules:
2 columns

Colorings:
1 column

Activity:
full width

---

# Corrections Required vs Capture 1

1. Hero too small -> 250px exact.
2. Text too small -> 62px title.
3. Character illustration must be 260px.
4. Feature cards must be 180px height.
5. Sidebar width must be 280px.
6. Search bar must be 640px.
7. Recent colorings cards must be 178×280.
8. Right column width fixed to 392px.
9. Add hover animations.
10. Use unified radius scale (16/24/28/32).
