# Cahier des charges – Page Login / Sign Up
**Projet : Petit Baobab**

## 1. Objectif
Créer une interface d'authentification moderne, accessible et responsive en respectant la maquette fournie.

## 2. Stack
- Next.js 15 (App Router)
- Tailwind CSS
- Shadcn UI
- Framer Motion
- Police : **Nunito**

## 3. Grille Desktop
- Largeur : 1440 px
- Colonnes : 12
- Marges : 80 px
- Gouttières : 24 px

## 4. Layout
### Colonne gauche
- Largeur : 50%
- Illustration pleine hauteur
- Padding : 64 px

### Colonne droite
- Largeur : 50%
- Carte login : 520 px max
- Border radius : 32 px
- Padding : 48 px
- Ombre : `0 24px 80px rgba(0,0,0,.08)`

## 5. Typographie
| Élément | Taille | Poids |
|---|---:|---:|
| H1 | 56 px | 800 |
| H2 | 40 px | 800 |
| Body | 16 px | 400 |
| Label | 14 px | 700 |
| Bouton | 16 px | 700 |

## 6. Inputs
- Hauteur : 56 px
- Rayon : 16 px
- Padding X : 18 px
- Bordure : #E8E8EF

États :
- Hover : bordure primaire
- Focus : ring 2 px
- Error : rouge
- Disabled : 50% opacité

## 7. Boutons
Primaire :
- Hauteur : 56 px
- Rayon : 9999 px
- Dégradé violet
- Hover : scale 1.02
- Active : scale 0.98

## 8. Responsive
### Desktop ≥1280
Deux colonnes.

### Tablet 768–1279
Illustration réduite, formulaire centré.

### Mobile ≤767
Une seule colonne, illustration masquée ou placée au-dessus.

## 9. Animations Framer Motion
Carte :
```tsx
initial={{opacity:0,y:24}}
animate={{opacity:1,y:0}}
transition={{duration:0.45}}
```

## 10. Shadcn UI
- Card
- Input
- Button
- Checkbox
- Separator

## 11. Design Tokens Tailwind
```ts
colors.primary="#6D4CFF"
radius.lg="16px"
radius.xl="32px"
shadow.card="0 24px 80px rgba(0,0,0,.08)"
fontFamily.sans=["Nunito","sans-serif"]
```

## 12. Z-index
| Élément | Z |
|---|---:|
| Fond | 0 |
| Illustration | 1 |
| Carte | 10 |
| Modal | 100 |

## 13. Accessibilité
- Contraste AA
- Navigation clavier
- ARIA labels
- Focus visible

## 14. Architecture Next.js
```text
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
components/auth/
```

## 15. Checklist Pixel Perfect
- [ ] Espacements multiples de 4
- [ ] Nunito partout
- [ ] Responsive validé
- [ ] États hover/focus/disabled
- [ ] Lighthouse >95
