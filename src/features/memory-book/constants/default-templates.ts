import { MemoryBookTemplate } from '../types/memory-book.types';

export const SCHOOL_MEMORY_BOOK_TEMPLATE_V1: MemoryBookTemplate = {
  id: 'school_memory_book_v1',
  title: 'Mon Cahier de Souvenirs Scolaires',
  subtitle: 'Mon année inoubliable avec Petit Baobab',
  description: 'Un merveilleux album de 9 pages pour immortaliser ta classe, tes copains, tes meilleurs souvenirs et tes victoires !',
  coverBadge: 'Modèle Scolaire 9 Pages',
  icon: 'BookOpen',
  previewThumbnail: '/illustrations/mascotte/mascotte_lire.png',
  totalDefaultPages: 9,
  pages: [
    // Page 1: Couverture & Portrait
    {
      id: 'p1_portrait',
      pageNumber: 1,
      title: 'Mon Portrait & Mon École',
      subtitle: 'Bienvenue dans mon grand cahier de souvenirs !',
      categoryTag: 'Couverture & Portrait',
      headerIcon: 'Sparkles',
      backgroundTheme: 'warm-cream',
      elements: [
        {
          id: 'p1_photo_portrait',
          type: 'photo',
          title: 'Mon Portrait de l’Année',
          subtitle: 'Glisse ta plus belle photo ici',
          photoData: {
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            placeholderText: 'Ajouter ma photo de classe ou mon portrait'
          }
        },
        {
          id: 'p1_txt_prenom',
          type: 'text',
          title: 'Mon prénom & nom',
          textData: {
            value: '',
            placeholder: 'Comment t’appelles-tu ?',
            maxLength: 40,
            fontSize: 'lg',
            fontStyle: 'handwriting'
          }
        },
        {
          id: 'p1_txt_classe',
          type: 'text',
          title: 'Ma classe',
          textData: {
            value: '',
            placeholder: 'Ex : CP, CE1, CE2, CM1, CM2...',
            maxLength: 30,
            fontSize: 'md'
          }
        },
        {
          id: 'p1_txt_ecole',
          type: 'text',
          title: 'Le nom de mon école',
          textData: {
            value: '',
            placeholder: 'Nom de ton école ou ville',
            maxLength: 50,
            fontSize: 'md'
          }
        },
        {
          id: 'p1_txt_annee',
          type: 'text',
          title: 'Année scolaire',
          textData: {
            value: '2025 - 2026',
            placeholder: '2025 - 2026',
            maxLength: 20,
            fontSize: 'md',
            align: 'center'
          }
        }
      ]
    },

    // Page 2: Tout sur Moi
    {
      id: 'p2_tout_sur_moi',
      pageNumber: 2,
      title: 'Tout sur Moi',
      subtitle: 'Mes petites informations secrètes',
      categoryTag: 'Identité',
      headerIcon: 'User',
      backgroundTheme: 'sunny-yellow',
      elements: [
        {
          id: 'p2_txt_age',
          type: 'text',
          title: 'Mon âge cette année',
          textData: {
            value: '',
            placeholder: 'J’ai ... ans !',
            maxLength: 15,
            fontSize: 'lg'
          }
        },
        {
          id: 'p2_txt_anniversaire',
          type: 'text',
          title: 'Mon anniversaire',
          textData: {
            value: '',
            placeholder: 'Ex : Le 14 avril',
            maxLength: 30,
            fontSize: 'md'
          }
        },
        {
          id: 'p2_txt_taille',
          type: 'text',
          title: 'Ma taille',
          textData: {
            value: '',
            placeholder: 'Ex : 1 mètre et 22 cm',
            maxLength: 25,
            fontSize: 'md'
          }
        },
        {
          id: 'p2_txt_couleur',
          type: 'text',
          title: 'Ma couleur préférée',
          textData: {
            value: '',
            placeholder: 'Ex : Le vert émeraude, le bleu...',
            maxLength: 30,
            fontSize: 'md'
          }
        },
        {
          id: 'p2_txt_plat',
          type: 'text',
          title: 'Mon plat préféré',
          textData: {
            value: '',
            placeholder: 'Ex : Le mafé, les crêpes, l’alloco...',
            maxLength: 40,
            fontSize: 'md'
          }
        },
        {
          id: 'p2_txt_animal',
          type: 'text',
          title: 'Mon animal préféré',
          textData: {
            value: '',
            placeholder: 'Ex : Le lion, le zèbre, le chat...',
            maxLength: 30,
            fontSize: 'md'
          }
        }
      ]
    },

    // Page 3: Rêves & Goûts
    {
      id: 'p3_reves_et_gouts',
      pageNumber: 3,
      title: 'Mes Rêves & Mes Goûts',
      subtitle: 'Quand je serai grand(e)... et ce que j’aime !',
      categoryTag: 'Avenir & Passions',
      headerIcon: 'Heart',
      backgroundTheme: 'lavender-light',
      elements: [
        {
          id: 'p3_txt_futur_metier',
          type: 'text',
          title: 'Plus tard, quand je serai grand(e), je serai...',
          textData: {
            value: '',
            placeholder: 'Ex : Astronaute, médecin, artiste, architecte...',
            maxLength: 80,
            fontSize: 'lg',
            fontStyle: 'handwriting'
          }
        },
        {
          id: 'p3_txt_jadore',
          type: 'text',
          title: 'Ce que j’adore',
          textData: {
            value: '',
            placeholder: 'Jouer à la récréation, écouter des histoires, rigoler...',
            maxLength: 180,
            multiline: true,
            minRows: 3,
            fontSize: 'md'
          }
        },
        {
          id: 'p3_txt_deteste',
          type: 'text',
          title: 'Ce que je déteste',
          textData: {
            value: '',
            placeholder: 'Me réveiller tôt le lundi, les épinards bouillis...',
            maxLength: 180,
            multiline: true,
            minRows: 3,
            fontSize: 'md'
          }
        }
      ]
    },

    // Page 4: Ma classe & Mes Enseignants
    {
      id: 'p4_classe_enseignants',
      pageNumber: 4,
      title: 'Ma Classe & Mes Enseignants',
      subtitle: 'Ceux qui m’ont appris plein de belles choses',
      categoryTag: 'Vie de Classe',
      headerIcon: 'School',
      backgroundTheme: 'mint-pastel',
      elements: [
        {
          id: 'p4_txt_enseignant',
          type: 'text',
          title: 'Ma maîtresse / Mon maître',
          textData: {
            value: '',
            placeholder: 'Nom de mon enseignant(e)',
            maxLength: 50,
            fontSize: 'lg'
          }
        },
        {
          id: 'p4_photo_classe',
          type: 'photo',
          title: 'Photo de notre classe ou de l’école',
          subtitle: 'Une belle photo souvenir de tout le groupe',
          photoData: {
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            placeholderText: 'Ajouter la photo de groupe ou de classe 📸'
          }
        },
        {
          id: 'p4_txt_matiere',
          type: 'text',
          title: 'Ma matière préférée',
          textData: {
            value: '',
            placeholder: 'Ex : Les maths, les arts, la lecture, le sport...',
            maxLength: 50,
            fontSize: 'md'
          }
        }
      ]
    },

    // Page 5: Meilleurs Souvenirs
    {
      id: 'p5_meilleurs_souvenirs',
      pageNumber: 5,
      title: 'Mes Meilleurs Souvenirs',
      subtitle: 'Les moments gravés dans mon cœur',
      categoryTag: 'Souvenirs',
      headerIcon: 'Smile',
      backgroundTheme: 'coral-soft',
      elements: [
        {
          id: 'p5_txt_meilleur_souvenir',
          type: 'text',
          title: 'Mon meilleur souvenir de l’année',
          textData: {
            value: '',
            placeholder: 'Raconte ton moment magique (sortie scolaire, fête, jeu entre amis)...',
            maxLength: 250,
            multiline: true,
            minRows: 4,
            fontSize: 'md'
          }
        },
        {
          id: 'p5_txt_moment_rigolo',
          type: 'text',
          title: 'Le moment le plus rigolo de l’année',
          textData: {
            value: '',
            placeholder: 'Le jour où toute la classe a éclaté de rire...',
            maxLength: 220,
            multiline: true,
            minRows: 3,
            fontSize: 'md'
          }
        },
        {
          id: 'p5_txt_projet_prefere',
          type: 'text',
          title: 'Mon projet ou atelier préféré',
          textData: {
            value: '',
            placeholder: 'Le spectacle, l’exposé, le dessin ou la maquette que j’ai adoré faire...',
            maxLength: 180,
            multiline: true,
            minRows: 2,
            fontSize: 'md'
          }
        }
      ]
    },

    // Page 6: Ce que j'ai Appris
    {
      id: 'p6_ce_que_jai_appris',
      pageNumber: 6,
      title: 'Ce que j’ai Appris & Découvert',
      subtitle: 'Comme le Baobab, j’ai grandi !',
      categoryTag: 'Apprentissage & Victoires',
      headerIcon: 'BookMarked',
      backgroundTheme: 'warm-cream',
      elements: [
        {
          id: 'p6_txt_decouverte',
          type: 'text',
          title: 'Les choses les plus importantes que j’ai apprises',
          textData: {
            value: '',
            placeholder: 'Lire de vrais livres tout seul, faire de grandes multiplications, parler anglais...',
            maxLength: 250,
            multiline: true,
            minRows: 4,
            fontSize: 'md'
          }
        },
        {
          id: 'p6_txt_livres',
          type: 'text',
          title: 'Mes livres ou histoires préférés',
          textData: {
            value: '',
            placeholder: 'Les titres des contes ou livres que j’ai adoré lire...',
            maxLength: 160,
            fontSize: 'md'
          }
        },
        {
          id: 'p6_txt_fiertes',
          type: 'text',
          title: 'Mes plus grandes fiertés',
          textData: {
            value: '',
            placeholder: 'Ce dont je suis particulièrement fier(e) d’avoir réussi cette année...',
            maxLength: 200,
            multiline: true,
            minRows: 3,
            fontSize: 'md'
          }
        }
      ]
    },

    // Page 7: Mes Camarades & Petits Mots
    {
      id: 'p7_camarades_mots',
      pageNumber: 7,
      title: 'Mes Camarades & Petits Mots',
      subtitle: 'Les personnes précieuses de mon année',
      categoryTag: 'Amitié',
      headerIcon: 'Users',
      backgroundTheme: 'sunny-yellow',
      elements: [
        {
          id: 'p7_txt_camarades',
          type: 'text',
          title: 'Mes camarades et meilleurs amis 🤝',
          textData: {
            value: '',
            placeholder: 'Écris les prénoms de tes copains et copines...',
            maxLength: 200,
            multiline: true,
            minRows: 3,
            fontSize: 'md'
          }
        },
        {
          id: 'p7_txt_petits_mots',
          type: 'text',
          title: 'Dédicaces et petits mots de mes amis 💬',
          textData: {
            value: '',
            placeholder: 'Espace réservé pour coller ou recopier les petits messages gentils de tes amis !',
            maxLength: 300,
            multiline: true,
            minRows: 5,
            fontSize: 'md',
            fontStyle: 'handwriting'
          }
        }
      ]
    },

    // Page 8: Vacances & Aventures
    {
      id: 'p8_vacances_aventures',
      pageNumber: 8,
      title: 'Mes Vacances & Évasions',
      subtitle: 'Moments de repos et grandes aventures',
      categoryTag: 'Voyages & Nature',
      headerIcon: 'Sun',
      backgroundTheme: 'mint-pastel',
      elements: [
        {
          id: 'p8_photo_vacances',
          type: 'photo',
          title: 'Photo de mes vacances ou d’une sortie mémorable',
          subtitle: 'À la mer, au village, dans la forêt ou en famille',
          photoData: {
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            placeholderText: 'Ajouter une photo de vacances ou de fête 🌴'
          }
        },
        {
          id: 'p8_txt_vacances',
          type: 'text',
          title: 'Mes souvenirs de vacances préférés',
          textData: {
            value: '',
            placeholder: 'Ce que j’ai fait pendant les vacances ou mes sorties...',
            maxLength: 220,
            multiline: true,
            minRows: 3,
            fontSize: 'md'
          }
        },
        {
          id: 'p8_txt_prochaine_annee',
          type: 'text',
          title: 'Ce que j’ai hâte de faire l’année prochaine 🚀',
          textData: {
            value: '',
            placeholder: 'Apprendre une nouvelle langue, faire du vélo, retrouver mes amis...',
            maxLength: 180,
            fontSize: 'md'
          }
        }
      ]
    },

    // Page 9: Petits Secrets & Mot de Fin
    {
      id: 'p9_secrets_mot_de_fin',
      pageNumber: 9,
      title: 'Mon Jardin Secret & Mot Doux',
      subtitle: 'Dernière page de mon grand cahier',
      categoryTag: 'Secrets & Clôture',
      headerIcon: 'Sparkles',
      backgroundTheme: 'lavender-light',
      elements: [
        {
          id: 'p9_txt_secrets',
          type: 'text',
          title: 'Mon petit secret ou vœu pour l’avenir 🤫',
          textData: {
            value: '',
            placeholder: 'Un petit vœu ou un secret que je garde précieusement...',
            maxLength: 200,
            multiline: true,
            minRows: 3,
            fontSize: 'md'
          }
        },
        {
          id: 'p9_txt_mot_parents',
          type: 'text',
          title: 'Le mot doux de mes parents ou de ma famille 💌',
          textData: {
            value: '',
            placeholder: 'Un mot d’encouragement et d’amour rédigé par la famille...',
            maxLength: 300,
            multiline: true,
            minRows: 4,
            fontSize: 'md',
            fontStyle: 'handwriting'
          }
        },
        {
          id: 'p9_txt_signature',
          type: 'text',
          title: 'Signé par l’artiste !',
          textData: {
            value: '',
            placeholder: 'Ton prénom ou ta signature magique',
            maxLength: 30,
            fontSize: 'lg',
            align: 'center',
            fontStyle: 'handwriting'
          }
        }
      ]
    }
  ]
};

export const AVAILABLE_MEMORY_BOOK_TEMPLATES: MemoryBookTemplate[] = [
  SCHOOL_MEMORY_BOOK_TEMPLATE_V1
];
