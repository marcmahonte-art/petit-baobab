// ============================================================
// Petit Baobab — Contexte Culturel Africain (Section 14)
// Données vérifiées et respectueuses pour enrichir le Story Planner
// ============================================================

export interface AfricanCountryContext {
  id: string
  name: string
  flag: string
  region: "Afrique de l'Ouest" | "Afrique Centrale" | "Afrique de l'Est" | "Afrique Australe" | "Afrique du Nord"
  environments: string[]
  animals: string[]
  culturalElements: string[]
  traditionalClothing: string[]
  typicalFoods: string[]
  values: string[]
}

export const AFRICAN_COUNTRIES: AfricanCountryContext[] = [
  {
    id: "burkina-faso",
    name: "Burkina Faso",
    flag: "🇧🇫",
    region: "Afrique de l'Ouest",
    environments: ["Village sahélien", "Savane arborée", "Marché animé", "Cour familiale ombragée", "École du village"],
    animals: ["Éléphant", "Girafe", "Gazelle", "Tortue sage", "Calao", "Crocodile sacré"],
    culturalElements: ["Grand Baobab", "Balafon", "Artisanat du bronze", "Tissage faso dan fani", "Cases rondes en terre"],
    traditionalClothing: ["Boubou traditionnel", "Faso dan fani brodé", "Petit bonnet en coton tissé"],
    typicalFoods: ["Tô et sauce gombo", "Mangues fraîches", "Beignets de mil"],
    values: ["Partage", "Respect des anciens", "Courage", "Solidarité", "Persévérance"],
  },
  {
    id: "senegal",
    name: "Sénégal",
    flag: "🇸🇳",
    region: "Afrique de l'Ouest",
    environments: ["Bord de mer et pirogues", "Fleuve Sénégal", "Village de pêcheurs", "Savane aux acacias", "Grand marché"],
    animals: ["Pélican", "Singe vervet", "Tortue marine", "Lion protecteur", "Héron cendré"],
    culturalElements: ["Kora mélodieuse", "Sabar", "Teranga (l'hospitalité)", "Lutte traditionnelle bienveillante", "Pirogues colorées"],
    traditionalClothing: ["Grand boubou éclatant", "Tunique brodée", "Foulard ou chapeau traditionnel"],
    typicalFoods: ["Thiéboudienne parfumé", "Jus de bissap glacé", "Pastels croustillants"],
    values: ["Teranga (hospitalité)", "Entraide", "Respect de la nature", "Politesse", "Curiosité"],
  },
  {
    id: "cote-divoire",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    region: "Afrique de l'Ouest",
    environments: ["Forêt tropicale luxuriante", "Lagune paisible", "Plantation d'arbres fruitiers", "Village aux toits de chaume", "Grande école fleurie"],
    animals: ["Éléphant majestueux", "Chimpanzé malicieux", "Caméléon magique", "Perroquet gris", "Papillons multicolores"],
    culturalElements: ["Tissu Baoulé", "Masque Zaouli joyeux", "Djembé", "Fêtes des générations", "Contes sous l'iroko"],
    traditionalClothing: ["Pagne kita coloré", "Chemise en pagne tissé", "Sandales artisanales"],
    typicalFoods: ["Alloco doré", "Attiéké doux", "Bananes plantains sucrées"],
    values: ["Union", "Créativité", "Générosité", "Protection des forêts", "Joie de vivre"],
  },
  {
    id: "mali",
    name: "Mali",
    flag: "🇲🇱",
    region: "Afrique de l'Ouest",
    environments: ["Bord du majestueux fleuve Niger", "Pays Dogon et falaises", "Village d'argile", "Oasis sahélienne", "Cour de contes"],
    animals: ["Aigle pêcheur", "Hippopotame du fleuve", "Gazelle rapide", "Antilope chevaline"],
    culturalElements: ["Bogolan peint à la main", "Grande Mosquée en banco", "Ngoni", "Griots et maîtres de la parole"],
    traditionalClothing: ["Tunique en bogolan", "Chapeau de paille Peul", "Boubou couleur terre d'Afrique"],
    typicalFoods: ["Riz au gras parfumé", "Dégue au yaourt et mil", "Dattes sucrées"],
    values: ["Parole donnée", "Sagesse", "Patience", "Courage", "Fraternité"],
  },
  {
    id: "tchad",
    name: "Tchad",
    flag: "🇹🇩",
    region: "Afrique Centrale",
    environments: ["Rives du Lac Tchad", "Désert aux dunes dorées", "Oasis aux palmiers", "Savane du Sud", "Campement nomade"],
    animals: ["Fennec aux grandes oreilles", "Dromadaire endurant", "Oryx gracieux", "Grue couronnée"],
    culturalElements: ["Guitare tchadienne", "Poteries traditionnelles", "Récits autour du feu", "Tentes traditionnelles"],
    traditionalClothing: ["Djellaba claire", "Tunique souple du désert", "Chèche doux protecteur"],
    typicalFoods: ["Kissar moelleuse", "Sauce gombo et poisson du lac", "Thé vert à la menthe"],
    values: ["Endurance", "Partage de l'eau", "Honnêteté", "Écoute", "Bienveillance"],
  },
  {
    id: "guinee",
    name: "Guinée",
    flag: "🇬🇳",
    region: "Afrique de l'Ouest",
    environments: ["Montagnes verdoyantes du Fouta Djallon", "Cascades cristallines", "Vergers luxuriants", "Marché villageois"],
    animals: ["Chimpanzé montagnard", "Léopard discret", "Oiseau touraco", "Pintade sauvage"],
    culturalElements: ["Rythmes du Djembé", "Maisons rondes aux toits de paille", "Tapis tissés", "Légendes des cours d'eau"],
    traditionalClothing: ["Tissu Lepi indigo", "Veste courte brodée", "Coiffe en coton"],
    typicalFoods: ["Riz à la sauce feuille", "Foutou banane", "Ananas très sucré"],
    values: ["Respect des sources d'eau", "Honneur", "Amour du travail", "Solidarité"],
  },
  {
    id: "benin",
    name: "Bénin",
    flag: "🇧🇯",
    region: "Afrique de l'Ouest",
    environments: ["Cité lacustre sur pilotis", "Forêt sacrée", "Collines rocheuses", "Plage bordée de cocotiers"],
    animals: ["Pélican blanc", "Paresseux malin", "Tortue géante", "Martin-pêcheur bleu"],
    culturalElements: ["Tentures d'Abomey", "Tambours royaux", "Maisons en bois sur l'eau", "Légendes des souverains bienveillants"],
    traditionalClothing: ["Agbada brodé", "Pagne imprimé aux motifs d'oiseaux", "Toque royale d'enfant"],
    typicalFoods: ["Amiwo au poulet", "Beignets Kpanman", "Jus de papaye fraîche"],
    values: ["Courage", "Fidélité", "Curiosité intellectuelle", "Respect de la parole"],
  },
  {
    id: "togo",
    name: "Togo",
    flag: "🇹🇬",
    region: "Afrique de l'Ouest",
    environments: ["Monts verdoyants du Togo", "Lagune calme", "Champs de caféiers et cacaoyers", "Marché aux tissus colorés"],
    animals: ["Buffle d'Afrique", "Singe colobe", "Colibri scintillant", "Papillon géant"],
    culturalElements: ["Tissage Kente togolais", "Chants polyphoniques", "Maisons fortifiées Tata Somba"],
    traditionalClothing: ["Tunique Kente", "Sandales en cuir faites main", "Collier de perles traditionnelles"],
    typicalFoods: ["Foufou d'igname pilonné", "Djenkoumé doré", "Mangues sauvages"],
    values: ["Humilité", "Persévérance", "Joie communicative", "Amour familial"],
  },
]

export const STORY_ENVIRONMENTS = [
  { id: "savane", label: "Grande Savane", icon: "TreePine", desc: "Arbres baobabs, herbes dorées et grands animaux protecteurs" },
  { id: "village", label: "Village chaleureux", icon: "Home", desc: "Cases rondes, cour familiale ombragée et rires d'enfants" },
  { id: "fleuve", label: "Bord du fleuve", icon: "Waves", desc: "Eau fraîche, pirogues en bois et chants des oiseaux pêcheurs" },
  { id: "foret", label: "Forêt tropicale", icon: "Palmtree", desc: "Grands arbres feuillus, papillons multicolores et mystères bienveillants" },
  { id: "marche", label: "Marché animé", icon: "Store", desc: "Étalages d'épices, tissus colorés et marchands accueillants" },
  { id: "ecole", label: "École du village", icon: "GraduationCap", desc: "Cour de récréation, tableau noir, cahiers et apprentissages" },
  { id: "sahel", label: "Sahel doré", icon: "Sun", desc: "Dunes de sable fin, soleil éclatant et campements paisibles" },
  { id: "montagne", label: "Montagnes vertes", icon: "Mountain", desc: "Cascades d'eau pure, brume matinale et chemins secrets" },
]

export const EDUCATIONAL_VALUES = [
  { id: "partage", label: "Partager avec les autres", icon: "Heart", desc: "Découvrir la joie de donner et de vivre ensemble" },
  { id: "courage", label: "Être courageux", icon: "Shield", desc: "Surmonter ses petites peurs pour aider un ami" },
  { id: "nature", label: "Protéger la nature", icon: "Leaf", desc: "Prendre soin des arbres, de l'eau et des animaux" },
  { id: "anciens", label: "Écouter les anciens", icon: "BookOpen", desc: "Apprendre de la sagesse et des contes sous le baobab" },
  { id: "perseverance", label: "Persévérer", icon: "Trophy", desc: "Ne pas abandonner même quand un défi paraît difficile" },
  { id: "confiance", label: "Confiance en soi", icon: "Sparkles", desc: "Découvrir son talent unique et croire en ses capacités" },
  { id: "entraide", label: "Aider son prochain", icon: "Users", desc: "Travailler main dans la main pour réussir ensemble" },
]

export const VISUAL_STYLES = [
  {
    id: "petit-baobab-3d",
    label: "Petit Baobab 3D",
    desc: "Style 3D chaleureux, doux et expressif, plein de lumière naturelle",
    badge: "Populaire",
    previewBg: "from-[#FFB300]/20 to-[#7D6AF8]/20",
  },
  {
    id: "album-jeunesse",
    label: "Album Jeunesse",
    desc: "Illustration éditoriale moderne aux textures douces et contrastes vifs",
    badge: "Classique",
    previewBg: "from-[#20C997]/20 to-[#1194FF]/20",
  },
  {
    id: "aquarelle",
    label: "Aquarelle Africaine",
    desc: "Teintes naturelles et artistiques à l'eau rappelant les carnets de voyage",
    badge: "Artistique",
    previewBg: "from-[#FF5E83]/20 to-[#FFD95C]/20",
  },
]
