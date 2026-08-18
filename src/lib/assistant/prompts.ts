/**
 * Petit Baobab — Bibliothèque de prompts pour l'Assistant Enseignante (/school/assistant)
 * Source : "Petit Baobab AI — Bibliothèque de prompts" (doc de référence Marc)
 *
 * Portée : crèche (0–3 ans) + maternelle/CEEP (3–6 ans), Burkina Faso.
 * Référentiel officiel : 5 domaines d'éveil MENA
 * (psychomoteur, langagier, cognitif, socio-affectif, artistique).
 *
 * Ce fichier ne fait AUCUN appel réseau. Il expose uniquement les templates
 * et une fonction de substitution. L'appel au LLM (Phase 3) devra combiner
 * GLOBAL_SYSTEM_PROMPT + template.systemAddition + buildUserPrompt(...).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldType = "text" | "textarea" | "number" | "select";

export interface PromptField {
  key: string; // utilisé comme {key} dans le template
  label: string; // libellé affiché dans le formulaire
  type: FieldType;
  options?: string[]; // pour type "select"
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  min?: number;
  max?: number;
}

export type Priority = "v1" | "v2" | "v3";
// v1 = assistant de préparation pédagogique (activités, communication essentielle et administration courante)
// v2 = communication parents / administratif / crèche
// v3 = génération d'assets culturels réutilisables + adaptation linguistique

export type Persona = "educatrice_creche" | "maitresse_maternelle" | "directrice";

export type DomaineEveil =
  | "Psychomoteur"
  | "Langagier"
  | "Cognitif"
  | "Socio-affectif"
  | "Artistique";

export type AssistantCategory =
  | "pedagogie"
  | "activites"
  | "communication"
  | "administration"
  | "culture"
  | "langues";

export interface PromptTemplate {
  id: string;
  label: string; // libellé du bouton/outil dans l'UI (façon Ari)
  persona: Persona;
  priority: Priority;
  category?: AssistantCategory;
  // Catégorie d’interface : permet de regrouper les outils sans dupliquer le catalogue.
  domaine?: DomaineEveil; // optionnel : certains templates sont transverses
  description: string; // aide contextuelle affichée sous le bouton
  fields: PromptField[];
  systemAddition: string; // consignes spécifiques à ce générateur, ajoutées au system prompt global
  userTemplate: string; // gabarit du prompt utilisateur, avec {placeholders}
}

// ---------------------------------------------------------------------------
// Prompt système global — à préfixer à CHAQUE appel, quel que soit le template
// ---------------------------------------------------------------------------

export const GLOBAL_SYSTEM_PROMPT = `
Tu es l'assistante pédagogique de Petit Baobab, destinée aux éducatrices de
crèche, maîtresses de maternelle/CEEP et directrices d'établissement au
Burkina Faso.

Règles impératives, à respecter dans TOUTE réponse :

1. Tranche d'âge : la cible va de 3 mois à 6 ans (crèche + CEEP/maternelle).
   Ne jamais produire de contenu de niveau primaire (CP-CM2). Précise toujours
   l'âge en MOIS pour la crèche et en ANNÉES pour la maternelle.

2. Référentiel officiel : aligne tout contenu pédagogique sur les 5 domaines
   d'éveil du programme national piloté par le MENA — psychomoteur, langagier,
   cognitif, socio-affectif, artistique. Ne fais jamais référence à des
   standards scolaires français ou occidentaux.

3. Matériel : ne propose que du matériel simple, local et accessible
   (tissus, calebasses, graines, bâtons, bidons recyclés, matériaux de
   récupération). Jamais de matériel importé ou coûteux.

4. Impression avant écran : conçois chaque fiche pour un rendu correct en
   noir et blanc, faible encre, impression recto simple. Pas de fonds colorés
   ni de dégradés dans les descriptions de mise en page.

5. Plurilinguisme : le français est la langue d'enseignement, mais Mooré,
   Dioula, Fulfuldé, Gulmancéma et Bissa sont parlés selon la région. Si une
   langue locale est demandée, propose une ADAPTATION (sens et ton conservés)
   et non une traduction mot à mot ; signale les expressions sans équivalent
   direct et comment tu les as contournées.

6. Neutralité religieuse et communautaire : ne présente jamais une fête ou
   tradition (Tabaski, Ramadan, Noël, Semaine Nationale de la Culture,
   FESPACO, SIAO, 11 décembre...) comme une référence universelle par défaut.
   Un ancrage culturel/religieux est toujours un paramètre choisi par
   l'utilisatrice, jamais un défaut imposé.

7. Pas de diagnostic : si un comportement d'enfant est décrit, explique en
   langage simple ce qu'il signifie habituellement à cet âge et propose des
   pistes concrètes — ne pose JAMAIS de diagnostic médical ou psychologique.

8. Pas d'hallucination culturelle : ne invente jamais le détail exact d'une
   comptine, d'un rituel ou d'un texte religieux. Si tu n'es pas certaine
   d'un contenu culturel précis, indique-le clairement et recommande une
   relecture par un référent local avant publication ou impression.

9. Langage simple par défaut : même pour les contenus administratifs
   (rapports, fiches d'inscription, messages), utilise un français simple,
   des phrases courtes, lisibles par une personne qui lit peu.

10. Format de sortie : structure toujours la réponse en sections claires
    avec des titres courts (ex. Objectif / Matériel / Déroulé / Variante),
    prêtes à être copiées dans une fiche imprimable.
`.trim();

// ---------------------------------------------------------------------------
// Fonction de substitution — {cle} -> valeur saisie par l'utilisatrice
// ---------------------------------------------------------------------------

export function buildUserPrompt(
  template: PromptTemplate,
  values: Record<string, string>
): string {
  let result = template.userTemplate;
  for (const field of template.fields) {
    const value = values[field.key]?.trim() || field.defaultValue || `[${field.label}]`;
    result = result.replaceAll(`{${field.key}}`, value);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Catalogue de templates
// ---------------------------------------------------------------------------

export const ASSISTANT_PROMPTS: PromptTemplate[] = [
  // ===================== V1 — Fiches d'activités / leçons (texte) =====================

  {
    id: "sequence_eveil_maternelle",
    label: "Créer une séquence d'éveil",
    persona: "maitresse_maternelle",
    priority: "v1",
    category: "pedagogie",
    description: "Séquence structurée pour une classe de maternelle/CEEP, alignée sur les domaines d'éveil.",
    fields: [
      { key: "theme", label: "Thème", type: "text", placeholder: "ex : les animaux de la savane", required: true },
      { key: "duree", label: "Durée (minutes)", type: "number", min: 5, max: 120, defaultValue: "30", required: true },
      { key: "niveau", label: "Niveau", type: "select", options: ["Petite section", "Moyenne section", "Grande section"], required: true },
    ],
    systemAddition:
      "Structure la séquence en 3 temps (accueil / activité / retour au calme). Termine par une transition adaptée au rythme de la classe : retour au calme, rangement, regroupement ou sieste lorsque celle-ci est prévue.",
    userTemplate: `Crée une séquence d'éveil de {duree} minutes sur le thème "{theme}" pour une classe de {niveau}, alignée sur les 5 domaines d'éveil du programme national (psychomoteur, langagier, cognitif, socio-affectif, artistique).

Donne : objectif, matériel nécessaire (accessible localement), déroulé en 3 temps (accueil / activité / retour au calme), et une transition adaptée au rythme de la classe (retour au calme, rangement, regroupement ou sieste lorsqu’elle est prévue).`,
  },

  {
    id: "activite_eveil_crèche",
    label: "Proposer une activité d'éveil (crèche)",
    persona: "educatrice_creche",
    priority: "v1",
    category: "activites",
    description: "Activité courte pour un enfant de 0 à 3 ans, avec matériel local.",
    fields: [
      { key: "age_en_mois", label: "Âge de l'enfant (mois)", type: "number", min: 3, max: 36, required: true },
      { key: "domaine", label: "Domaine d'éveil", type: "select", options: ["Psychomoteur", "Langagier", "Cognitif", "Socio-affectif", "Artistique"], required: true },
      { key: "duree", label: "Durée (minutes)", type: "number", defaultValue: "15", required: true },
      { key: "nombre_enfants", label: "Nombre d'enfants (pour la variante groupe)", type: "number", defaultValue: "1" },
    ],
    systemAddition:
      "Le matériel doit être exclusivement local (tissus, calebasses, graines, bâtons, bidons recyclés). Inclus un signal d'alerte en cas de difficulté de l'enfant, sans poser de diagnostic.",
    userTemplate: `Un enfant de {age_en_mois} mois a besoin d'une activité d'éveil {domaine}.

Propose une activité de {duree} minutes, réalisable avec du matériel simple et local (tissus, calebasses, graines, bâtons, bidons recyclés — pas de matériel importé).

Indique : objectif visé, déroulé en 3 étapes, signal d'alerte si l'enfant est en difficulté, et une variante pour un groupe de {nombre_enfants} enfants.`,
  },

  {
    id: "fiche_graphisme",
    label: "Générer une fiche de graphisme",
    persona: "maitresse_maternelle",
    priority: "v1",
    category: "activites",
    domaine: "Psychomoteur",
    description: "Fiche de pré-écriture imprimable (traits, ronds, ponts, boucles).",
    fields: [
      { key: "age", label: "Âge de l'enfant (années)", type: "number", min: 3, max: 6, required: true },
      { key: "nombre_lignes", label: "Nombre de lignes d'exercice", type: "number", min: 1, max: 10, defaultValue: "4" },
      { key: "motif", label: "Motif du cadre décoratif", type: "select", options: ["Bogolan", "Faso dan fani", "Savane"] },
    ],
    systemAddition:
      "Format A4, imprimable en noir et blanc, économe en encre. Décris la mise en page textuellement (le rendu graphique réel sera produit séparément).",
    userTemplate: `Génère une fiche de graphisme pré-écriture (traits, ronds, ponts, boucles) pour des enfants de {age} ans, avec {nombre_lignes} lignes d'exercice, cadre décoratif {motif}, format A4 imprimable en noir et blanc, économe en encre.`,
  },

  {
    id: "fiche_routine_creche",
    label: "Générer une fiche de routine journalière",
    persona: "educatrice_creche",
    priority: "v1",
    category: "administration",
    description: "Emploi du temps type pour une crèche, respectant les rythmes réels de l'enfant.",
    fields: [
      { key: "nombre_enfants", label: "Nombre d'enfants accueillis", type: "number", required: true },
      { key: "tranche_age", label: "Tranche d'âge", type: "text", placeholder: "ex : 6 mois – 2 ans", required: true },
      { key: "nombre_educatrices", label: "Nombre d'éducatrices", type: "number", required: true },
    ],
    systemAddition:
      "Respecte les rythmes réels : sieste, allaitement/goûter, temps chaud entre 12h et 15h. Format : tableau horaire simple, imprimable en noir et blanc.",
    userTemplate: `Génère une fiche de routine journalière pour une crèche accueillant {nombre_enfants} enfants de {tranche_age}, avec {nombre_educatrices} éducatrices.

Respecte les rythmes réels (sieste, allaitement/goûter, temps chaud de la journée entre 12h et 15h). Format : tableau horaire simple, imprimable en noir et blanc.`,
  },

  {
    id: "evaluation_informelle",
    label: "Créer une évaluation informelle",
    persona: "maitresse_maternelle",
    priority: "v1",
    category: "pedagogie",
    description: "Questions d'observation (pas un test noté) en motricité fine et langage oral.",
    fields: [
      { key: "age", label: "Âge de l'enfant (années)", type: "number", min: 3, max: 6, required: true },
    ],
    systemAddition:
      "Ce n'est pas un test noté mais une observation informelle. Le français peut être une langue seconde pour l'enfant : formule les questions en conséquence.",
    userTemplate: `Propose 5 questions de motricité fine et 5 questions de langage oral pour évaluer informellement (pas un test noté) où en est un enfant de {age} ans en milieu d'année, en tenant compte du fait que le français peut être une langue seconde pour l'enfant.`,
  },

  {
    id: "fiche_decouverte_culturelle",
    label: "Créer une fiche découverte culturelle",
    persona: "maitresse_maternelle",
    priority: "v1",
    category: "culture",
    domaine: "Cognitif",
    description: "Fiche courte autour d'un élément culturel local (bogolan, balafon, mil, baobab...).",
    fields: [
      { key: "element_culturel", label: "Élément culturel", type: "select", options: ["Le bogolan", "Le balafon", "Le mil", "Le baobab"], required: true },
    ],
    systemAddition:
      "Format imprimable A5. Ne pas inventer de détail culturel précis sans certitude — recommander une relecture par un référent local si besoin.",
    userTemplate: `Génère une fiche d'activité "Découverte" sur {element_culturel}, avec : 1 explication simple pour l'enfant, 1 question à poser en classe, 1 activité manuelle associée, format imprimable A5.`,
  },

  // ===================== V2 — Communication, gestion, crèche =====================

  {
    id: "explication_comportement",
    label: "Comprendre un comportement d'enfant",
    persona: "educatrice_creche",
    priority: "v2",
    category: "pedagogie",
    domaine: "Socio-affectif",
    description: "Explication non-diagnostique d'un comportement observé, avec pistes concrètes.",
    fields: [
      { key: "age", label: "Âge de l'enfant", type: "text", required: true },
      { key: "comportement", label: "Comportement observé", type: "textarea", placeholder: "ex : pleurs au moment de la séparation", required: true },
    ],
    systemAddition: "Ne jamais poser de diagnostic médical ou psychologique. Langage simple, destiné à une non-spécialiste.",
    userTemplate: `Un enfant de {age} présente : {comportement}.

Explique en langage simple à une éducatrice non spécialisée en psychologie infantile ce que cela signifie habituellement à cet âge, sans poser de diagnostic, et propose 3 gestes concrets à essayer cette semaine.`,
  },

  {
    id: "comptine",
    label: "Créer une comptine",
    persona: "maitresse_maternelle",
    priority: "v2",
    category: "activites",
    domaine: "Artistique",
    description: "Comptine courte avec gestes, sans instrument.",
    fields: [
      { key: "theme", label: "Thème", type: "select", options: ["Se laver les mains", "Dire bonjour", "Partager"], required: true },
      { key: "age_en_mois", label: "Âge (mois)", type: "number", required: true },
    ],
    systemAddition: "4 à 6 lignes, rimes simples, pensée pour être chantée avec des gestes, sans instrument.",
    userTemplate: `Crée une comptine courte en français (4 à 6 lignes, rimes simples) sur le thème "{theme}", pensée pour être chantée avec des gestes, sans instrument, adaptée à des enfants de {age_en_mois} mois.`,
  },

  {
    id: "message_whatsapp_parent",
    label: "Rédiger un message WhatsApp aux parents",
    persona: "directrice",
    priority: "v1",
    category: "communication",
    description: "Message court, chaleureux, pour informer d'un progrès.",
    fields: [
      { key: "domaine_progres", label: "Domaine du progrès", type: "text", placeholder: "ex : reconnaissance des couleurs", required: true },
    ],
    systemAddition: "3-4 lignes maximum, ton chaleureux, sans jargon pédagogique, 1-2 émojis, français simple.",
    userTemplate: `Rédige un message WhatsApp court (3-4 lignes maximum) à envoyer aux parents pour expliquer que leur enfant a progressé en {domaine_progres}, ton chaleureux, sans jargon pédagogique, avec 1-2 émojis, en français simple.`,
  },

  {
    id: "reponse_question_parent",
    label: "Répondre à une question de parent",
    persona: "directrice",
    priority: "v1",
    category: "communication",
    description: "Réponse bienveillante et concrète à une interrogation de parent.",
    fields: [
      { key: "question", label: "Question du parent", type: "textarea", required: true },
    ],
    systemAddition: "Ton bienveillant, sans jugement. Le plurilinguisme est présenté comme une force, pas un problème.",
    userTemplate: `Un parent demande : "{question}". Réponds avec bienveillance, en rappelant que le plurilinguisme est une force si pertinent, sans jugement, et propose une piste concrète et simple.`,
  },

  {
    id: "activites_maison",
    label: "Proposer des activités à faire à la maison",
    persona: "directrice",
    priority: "v1",
    category: "activites",
    description: "3 activités sans achat, avec du matériel de cuisine ou de cour.",
    fields: [
      { key: "materiel_disponible", label: "Matériel disponible", type: "select", options: ["Ce qu'on trouve dans une cuisine burkinabè", "Ce qu'on trouve dans la cour"], required: true },
      { key: "age", label: "Âge de l'enfant", type: "number", min: 3, max: 6, required: true },
    ],
    systemAddition: "Sans achat, réalisable en moins de 15 minutes.",
    userTemplate: `Propose 3 activités à faire à la maison avec {materiel_disponible} pour continuer l'éveil d'un enfant de {age} ans après l'école, sans nécessiter d'achat, réalisables en moins de 15 minutes.`,
  },

  {
    id: "rapport_trimestriel",
    label: "Rédiger un rapport trimestriel",
    persona: "directrice",
    priority: "v1",
    category: "administration",
    description: "Synthèse d'une page pour parents et/ou partenaire.",
    fields: [
      { key: "nombre_enfants", label: "Nombre d'enfants", type: "number", required: true },
      { key: "nombre_classes", label: "Nombre de classes", type: "number", required: true },
    ],
    systemAddition: "1 page maximum, ton professionnel mais accessible.",
    userTemplate: `Rédige un rapport trimestriel synthétique (1 page) pour {nombre_enfants} enfants répartis en {nombre_classes} classes, résumant la progression générale par domaine d'éveil, ton professionnel mais accessible, destiné à être partagé avec les parents et/ou une ONG partenaire.`,
  },

  {
    id: "ordre_du_jour_reunion",
    label: "Préparer un ordre du jour de réunion",
    persona: "directrice",
    priority: "v1",
    category: "administration",
    description: "Réunion d'équipe pédagogique.",
    fields: [
      { key: "duree", label: "Durée de la réunion", type: "text", placeholder: "ex : 1h", required: true },
      { key: "nombre_educatrices", label: "Nombre d'éducatrices", type: "number", required: true },
      { key: "sujet_prioritaire", label: "Sujet prioritaire", type: "text", required: true },
    ],
    systemAddition: "Inclure un temps d'échange sur les difficultés du mois.",
    userTemplate: `Prépare l'ordre du jour d'une réunion d'équipe pédagogique de {duree} pour une crèche/maternelle de {nombre_educatrices} éducatrices, incluant un point sur {sujet_prioritaire} et un temps d'échange sur les difficultés rencontrées ce mois-ci.`,
  },

  {
    id: "planning_vacances",
    label: "Créer un planning de vacances",
    persona: "directrice",
    priority: "v1",
    category: "administration",
    description: "Calendrier visuel avec pictogrammes plutôt que texte dense.",
    fields: [
      { key: "duree", label: "Durée des vacances", type: "text", required: true },
    ],
    systemAddition: "1 activité par jour maximum, mélange jeu/apprentissage, format calendrier visuel avec pictogrammes.",
    userTemplate: `Crée un planning de révision très simple pour les vacances ({duree}), avec une activité par jour maximum, mélangeant jeu et apprentissage, présenté sous forme de calendrier visuel avec pictogrammes plutôt que texte dense.`,
  },

  // ===================== V3 — Assets culturels réutilisables + langues locales =====================

  {
    id: "imagier_illustre",
    label: "Générer un imagier illustré",
    persona: "maitresse_maternelle",
    priority: "v3",
    category: "culture",
    description: "8 à 10 mots, avec description visuelle pour illustrateur.",
    fields: [
      { key: "theme", label: "Thème", type: "select", options: ["Le marché", "Les animaux de la savane", "Les instruments de musique traditionnels"], required: true },
      { key: "langue_locale", label: "Langue locale (optionnel)", type: "select", options: ["Aucune", "Mooré", "Dioula", "Fulfuldé", "Gulmancéma", "Bissa"] },
    ],
    systemAddition: "Pour chaque mot : version française + version en langue locale si disponible + description visuelle style coloriage contour simple.",
    userTemplate: `Génère un imagier illustré (8 à 10 mots) sur le thème "{theme}", avec pour chaque mot : le mot en français, une version simplifiée en {langue_locale} si disponible, et une description visuelle pour l'illustrateur (style coloriage contour simple).`,
  },

  {
    id: "conte_traditionnel",
    label: "Créer un conte traditionnel réinventé",
    persona: "maitresse_maternelle",
    priority: "v3",
    category: "culture",
    description: "Structure du conte africain : répétition, question, morale implicite.",
    fields: [
      { key: "animal_principal", label: "Animal principal", type: "text", required: true },
      { key: "decor", label: "Décor", type: "select", options: ["Village", "Savane", "Bord du fleuve"], required: true },
    ],
    systemAddition:
      "4 paragraphes maximum, structure classique du conte africain (animal rusé, répétition d'un motif, question posée aux enfants, morale implicite). Adapté à une lecture à voix haute par un adulte. Ne pas inventer de détail culturel précis non vérifiable.",
    userTemplate: `Crée un conte traditionnel réinventé de 4 paragraphes, structure classique du conte africain (animal rusé, répétition d'un motif, question posée aux enfants, morale implicite), mettant en scène {animal_principal} dans un décor {decor}, adapté à une lecture à voix haute par un adulte.`,
  },

  {
    id: "adaptation_linguistique",
    label: "Adapter un texte en langue locale",
    persona: "maitresse_maternelle",
    priority: "v3",
    category: "langues",
    description: "Adaptation (pas traduction mot à mot) d'un texte pour enfant.",
    fields: [
      { key: "texte", label: "Texte source (français)", type: "textarea", required: true },
      { key: "age", label: "Âge de l'enfant", type: "number", min: 3, max: 6, required: true },
      { key: "langue_locale", label: "Langue locale", type: "select", options: ["Mooré", "Dioula", "Fulfuldé", "Gulmancéma", "Bissa"], required: true },
    ],
    systemAddition:
      "Adaptation, pas traduction mot à mot. Signaler les expressions sans équivalent direct et comment elles ont été contournées. Recommander une relecture par un locuteur natif avant publication.",
    userTemplate: `Voici un texte en français destiné à un enfant de {age} ans : "{texte}".

Propose une adaptation — pas une traduction mot à mot — en {langue_locale}, qui garde le sens et le ton, en signalant les expressions qui n'ont pas d'équivalent direct et comment tu les as contournées.`,
  },

  {
    id: "fiche_inscription",
    label: "Générer un modèle de fiche d'inscription",
    persona: "directrice",
    priority: "v3",
    category: "administration",
    description: "Fiche d'inscription simple pour une crèche privée.",
    fields: [],
    systemAddition: "Uniquement les champs essentiels à la protection de l'enfant, aucun champ superflu.",
    userTemplate: `Génère un modèle de fiche d'inscription simple pour une crèche privée au Burkina Faso, incluant les champs essentiels (identité enfant, contact parent/tuteur, personne autorisée à récupérer l'enfant, informations utiles type allergies), en évitant tout champ non nécessaire à la protection de l'enfant.`,
  },
];

// ---------------------------------------------------------------------------
// Helpers d'accès pour l'UI (façon Ari : filtrer par persona / priorité)
// ---------------------------------------------------------------------------

export function getPromptsForPersona(persona: Persona, priority?: Priority): PromptTemplate[] {
  return ASSISTANT_PROMPTS.filter(
    (t) => t.persona === persona && (!priority || t.priority === priority)
  );
}

export function getPromptById(id: string): PromptTemplate | undefined {
  return ASSISTANT_PROMPTS.find((t) => t.id === id);
}
