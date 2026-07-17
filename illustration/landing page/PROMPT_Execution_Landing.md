# PROMPT D'EXÉCUTION — LANDING PAGE PETIT BAOBAB

Copie-colle ce prompt dans Antigravity (ou Claude Code) avec le fichier
SPEC_Landing_Petit_Baobab.md joint ou collé juste après.

---

```
Construis la landing page complète de "Petit Baobab" dans ce projet Next.js 15
(App Router) + TypeScript + Tailwind CSS v4 + Shadcn UI, en suivant EXACTEMENT
la spécification ci-dessous, sans rien improviser ni simplifier.

[Colle ici l'intégralité du contenu de SPEC_Landing_Petit_Baobab.md]

INSTRUCTIONS D'EXÉCUTION :

1. Commence par ajouter les tokens Tailwind (section 0 de la spec) dans
   globals.css et tailwind.config, avant tout composant.

2. Installe et configure les composants Shadcn nécessaires (section 12) :
   npx shadcn@latest add button sheet dropdown-menu carousel avatar badge

3. Installe les dépendances manquantes si absentes : framer-motion, lucide-react.

4. Crée chaque composant listé dans l'arborescence (section 13) comme un
   fichier séparé dans components/landing/, dans cet ordre :
   Header → Hero → FeatureStrip → HowItWorks → CreateBookBanner →
   Testimonials → FinalCtaBanner → Footer

5. Pour CHAQUE composant, respecte strictement :
   - les tailles en px données (pas d'approximation type "large" ou "text-xl"
     sans vérifier que ça correspond à la taille demandée)
   - les marges/paddings exacts
   - les couleurs en hex données dans les tokens, jamais de couleur Tailwind
     par défaut (ex: bg-purple-500) à la place
   - le z-index spécifié pour les éléments superposés du Hero et des bannières
   - les breakpoints responsive de la section 10
   - les animations Framer Motion de la section 11

6. Pour les illustrations (enfant, baobab, case africaine, girafe, livre
   ouvert, pot de crayons, couvertures de livres, scènes "Comment ça marche"),
   utilise des placeholders SVG ou PNG simples respectant la position, taille
   et z-index décrits, avec un commentaire TODO indiquant qu'ils doivent être
   remplacés par les assets finaux fournis par le designer. Ne bloque pas le
   développement en attendant les vrais assets.

7. Assemble tous les composants dans app/page.tsx dans l'ordre des sections
   1 à 9 de la spec.

8. Vérifie le rendu responsive aux 5 breakpoints listés (section 10) avant de
   considérer la tâche terminée.

9. N'utilise aucun texte différent de celui fourni dans la spec (titres,
   paragraphes, témoignages, labels de boutons) — tout le contenu textuel est
   final et ne doit pas être reformulé.

Une fois terminé, liste les écarts éventuels entre ton implémentation et la
spec (s'il y en a), avec la raison de chaque écart.
```
