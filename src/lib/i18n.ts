import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Lang = 'fr' | 'en'

export const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  'nav.home': { fr: 'Accueil', en: 'Home' },
  'nav.coloring': { fr: 'Coloriage', en: 'Coloring' },
  'nav.magic-drawing': { fr: 'Dessin magique', en: 'Magic Drawing' },
  'nav.coloring-books': { fr: 'Livres de coloriage', en: 'Coloring Books' },
  'nav.games': { fr: 'Jeux éducatifs', en: 'Educational Games' },
  'nav.stories': { fr: 'Histoires', en: 'Stories' },
  'nav.activities': { fr: 'Activités', en: 'Activities' },
  'nav.parents': { fr: 'Espace parents', en: 'Parent Space' },
  'nav.settings': { fr: 'Paramètres', en: 'Settings' },

  // Hero
  'hero.greeting': { fr: 'Bonjour {name} !', en: 'Hello {name}!' },
  'hero.subtitle': { fr: 'Qu\'allons-nous créer aujourd\'hui ?', en: 'What shall we create today?' },

  // Search
  'search.placeholder': { fr: 'Que veux-tu créer aujourd\'hui ? (ex : un éléphant...)', en: 'What do you want to create? (e.g. an elephant...)' },

  // Feature modules
  'feature.coloring': { fr: 'Coloriage', en: 'Coloring' },
  'feature.magic-drawing': { fr: 'Dessin magique', en: 'Magic Drawing' },
  'feature.coloring-books': { fr: 'Livres de coloriage', en: 'Coloring Books' },
  'feature.games': { fr: 'Jeux éducatifs', en: 'Educational Games' },
  'feature.stories': { fr: 'Histoires', en: 'Stories' },
  'feature.activities': { fr: 'Activités', en: 'Activities' },

  // Coloring page
  'coloring.title': { fr: 'Amuse-toi à colorier ton dessin !', en: 'Have fun coloring your drawing!' },
  'coloring.tools.brush': { fr: 'Pinceau', en: 'Brush' },
  'coloring.tools.bucket': { fr: 'Pot de peinture', en: 'Paint Bucket' },
  'coloring.tools.eraser': { fr: 'Gomme', en: 'Eraser' },
  'coloring.tools.fill': { fr: 'Remplissage', en: 'Fill' },
  'coloring.tools.undo': { fr: 'Annuler', en: 'Undo' },
  'coloring.tools.redo': { fr: 'Refaire', en: 'Redo' },
  'coloring.tools.zoom-in': { fr: 'Zoom +', en: 'Zoom +' },
  'coloring.tools.zoom-out': { fr: 'Zoom -', en: 'Zoom -' },
  'coloring.tools.clear': { fr: 'Effacer tout', en: 'Clear All' },
  'coloring.save': { fr: 'Enregistrer', en: 'Save' },
  'coloring.download': { fr: 'Télécharger', en: 'Download' },
  'coloring.print': { fr: 'Imprimer', en: 'Print' },
  'coloring.back': { fr: 'Retour', en: 'Back' },
  'coloring.my-drawings': { fr: 'Mes dessins', en: 'My Drawings' },
  'coloring.add-to-book': { fr: 'Ajouter au livre', en: 'Add to Book' },

  // Magic Drawing
  'magic.title': { fr: 'Dessin Magique', en: 'Magic Drawing' },
  'magic.subtitle': { fr: 'Décris ce que tu imagines et je crée un dessin rien que pour toi !', en: 'Describe what you imagine and I\'ll create a drawing just for you!' },
  'magic.step1': { fr: 'Décris ton dessin', en: 'Describe Your Drawing' },
  'magic.step2': { fr: 'Choisis le style', en: 'Choose the Style' },
  'magic.step3': { fr: 'Créer le dessin', en: 'Create the Drawing' },
  'magic.generate': { fr: 'Créer mon dessin magique', en: 'Create My Magic Drawing' },
  'magic.generating': { fr: 'La magie opère...', en: 'Magic in progress...' },
  'magic.result': { fr: 'Résultat généré', en: 'Generated Result' },
  'magic.placeholder': { fr: 'Exemple : Une petite fille jouant du balafon dans un village...', en: 'Example: A little girl playing balafon in a village...' },
  'magic.style.noir-blanc': { fr: 'Coloriage (Noir & Blanc)', en: 'Coloring (Black & White)' },
  'magic.style.contour-simple': { fr: 'Contour simple', en: 'Simple Outline' },
  'magic.style.detaille': { fr: 'Dessin détaillé', en: 'Detailed Drawing' },
  'magic.style.couleur': { fr: 'Version couleur', en: 'Color Version' },
  'magic.favorite': { fr: 'Ajouter aux favoris', en: 'Add to Favorites' },
  'magic.variants': { fr: 'Variantes', en: 'Variants' },
  'magic.add-to-book': { fr: 'Ajouter à mon livre', en: 'Add to My Book' },
  'magic.cost': { fr: 'Coût : {cost} crédit(s)', en: 'Cost: {cost} credit(s)' },
  'magic.insufficient': { fr: 'Crédits insuffisants', en: 'Not enough credits' },
  'magic.upgrade': { fr: 'Demande à tes parents de passer au plan supérieur pour plus de crédits !', en: 'Ask your parents to upgrade for more credits!' },
  'magic.safe': { fr: 'Contenu sûr et adapté aux enfants', en: 'Safe content for children' },

  // Credits
  'credits.daily': { fr: 'Gratuit du jour : {used}/{total}', en: 'Free today: {used}/{total}' },
  'credits.monthly': { fr: 'Crédits du mois : {used}/{total}', en: 'Monthly credits: {used}/{total}' },
  'credits.free-plan-only': { fr: 'Plan gratuit : contour simple uniquement', en: 'Free plan: simple outline only' },

  // Books
  'books.title': { fr: 'Livres de coloriage', en: 'Coloring Books' },
  'books.step1': { fr: 'Choisir les dessins', en: 'Choose Drawings' },
  'books.step2': { fr: 'Personnaliser', en: 'Customize' },
  'books.step3': { fr: 'Révision & impression', en: 'Review & Print' },
  'books.step4': { fr: 'Génération', en: 'Generation' },
  'books.my-books': { fr: 'Mes livres', en: 'My Books' },
  'books.free-limit': { fr: 'Plan gratuit : maximum 2 livres', en: 'Free plan: maximum 2 books' },

  // Gamification
  'gamification.points': { fr: 'Points', en: 'Points' },
  'gamification.badges': { fr: 'Badges', en: 'Badges' },
  'gamification.days': { fr: 'Jours', en: 'Days' },
  'gamification.bravo': { fr: 'Bravo {name} !', en: 'Well done {name}!' },
  'gamification.on-track': { fr: 'Tu es sur la bonne voie.', en: 'You\'re on the right track.' },
  'gamification.reward-title': { fr: 'Bravo {name} !', en: 'Great job {name}!' },
  'gamification.reward-body': { fr: 'Ton coloriage est magnifique !', en: 'Your coloring is beautiful!' },
  'gamification.points-earned': { fr: '+{points}', en: '+{points}' },
  'gamification.badge-earned': { fr: 'Nouveau badge !', en: 'New badge!' },
  'gamification.badge-super-artiste': { fr: 'Super Artiste', en: 'Super Artist' },
  'gamification.badge-explorateur': { fr: 'Explorateur', en: 'Explorer' },
  'gamification.badge-creatif': { fr: 'Créatif', en: 'Creative' },
  'gamification.badge-lecteur': { fr: 'Lecteur', en: 'Reader' },

  // Settings
  'settings.title': { fr: 'Paramètres', en: 'Settings' },
  'settings.subtitle': { fr: 'Personnalise ton expérience !', en: 'Customize your experience!' },
  'settings.profile': { fr: 'Profil de l\'enfant', en: 'Child Profile' },
  'settings.name': { fr: 'Prénom', en: 'First Name' },
  'settings.mascot': { fr: 'Choisis ta mascotte', en: 'Choose Your Mascot' },
  'settings.language': { fr: 'Langue', en: 'Language' },
  'settings.audio': { fr: 'Préférences Audio', en: 'Audio Preferences' },
  'settings.music': { fr: 'Musique d\'ambiance', en: 'Background Music' },
  'settings.sfx': { fr: 'Effets sonores', en: 'Sound Effects' },
  'settings.parental': { fr: 'Contrôle Parental', en: 'Parental Control' },
  'settings.pin': { fr: 'Code PIN', en: 'PIN Code' },
  'settings.save': { fr: 'Enregistrer', en: 'Save' },
  'settings.saved': { fr: 'Paramètres enregistrés !', en: 'Settings saved!' },

  // Parents
  'parents.title': { fr: 'Espace Parents', en: 'Parent Space' },
  'parents.free-plan': { fr: 'Votre enfant profite du forfait GRATUIT', en: 'Your child is on the FREE plan' },
  'parents.plans': { fr: 'Forfaits disponibles', en: 'Available Plans' },
  'parents.discover': { fr: 'Découverte', en: 'Discovery' },
  'parents.super-baobab': { fr: 'Super Baobab', en: 'Super Baobab' },
  'parents.school': { fr: 'École / Pro', en: 'School / Pro' },
  'parents.credits': { fr: 'crédits', en: 'credits' },
  'parents.per-month': { fr: 'par mois', en: 'per month' },
  'parents.popular': { fr: 'Populaire', en: 'Popular' },

  // Footer
  'footer.grass': { fr: 'Pied de page décoratif', en: 'Decorative footer' },

  // Drawing status
  'status.in-progress': { fr: 'En cours', en: 'In Progress' },
  'status.completed': { fr: 'Terminé', en: 'Completed' },

  // Errors
  'error.generic': { fr: 'Oups ! Quelque chose n\'a pas fonctionné. Réessaie !', en: 'Oops! Something went wrong. Try again!' },
  'error.network': { fr: 'Pas de connexion. Vérifie ta connexion Internet.', en: 'No connection. Check your internet.' },
  'error.credits': { fr: 'Pas assez de crédits. Demande à tes parents !', en: 'Not enough credits. Ask your parents!' },

  // Misc
  'misc.see-all': { fr: 'Voir tout', en: 'See All' },
  'misc.loading': { fr: 'Chargement...', en: 'Loading...' },
  'misc.confirm-clear': { fr: 'Veux-tu vraiment effacer tout ton dessin ?', en: 'Do you really want to clear your drawing?' },
}

function lookup(key: string, lang: Lang, params?: Record<string, string | number>): string {
  const translation = translations[key]?.[lang]
  if (!translation) return key
  if (!params) return translation
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(`{${k}}`, String(v)),
    translation,
  )
}

interface I18nStore {
  lang: Lang
  setLanguage: (lang: Lang) => void
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      lang: 'fr',
      setLanguage: (lang: Lang) => set({ lang }),
    }),
    {
      name: 'petit-baobab-lang',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export function t(key: string, params?: Record<string, string | number>): string {
  return lookup(key, useI18nStore.getState().lang, params)
}

export function setLanguage(lang: Lang): void {
  useI18nStore.getState().setLanguage(lang)
}

export function getCurrentLang(): Lang {
  return useI18nStore.getState().lang
}

export { lookup as translate }
