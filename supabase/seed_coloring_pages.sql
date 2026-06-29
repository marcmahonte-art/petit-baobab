-- =============================================================
-- Script d'initialisation : Table COLORING_PAGES
-- À exécuter dans le SQL Editor de Supabase
-- =============================================================

-- Création de la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS coloring_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('animaux', 'fruits', 'metiers', 'culture', 'alphabet')),
  image_url TEXT NOT NULL,
  pdf_url TEXT,
  is_free BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Création d'un index pour le tri
CREATE INDEX IF NOT EXISTS idx_coloring_pages_category ON coloring_pages(category);
CREATE INDEX IF NOT EXISTS idx_coloring_pages_display_order ON coloring_pages(display_order);

-- Insertion des dessins disponibles
INSERT INTO coloring_pages (title, category, image_url, display_order, is_free) VALUES
-- ===== ANIMAUX =====
('Éléphant',        'animaux', '/illustrations/animals/elephant.svg',                      1,  true),
('Girafe',           'animaux', '/illustrations/animals/girafe.svg',                        2,  true),
('Lion',             'animaux', '/illustrations/animals/lion.svg',                          3,  true),
('Cheval',           'animaux', '/illustrations/animals/cheval.svg',                        4,  true),
('Caméléon',         'animaux', '/illustrations/animals/caméléon.svg',                      5,  true),
('Tortue',           'animaux', '/illustrations/animals/tortue.svg',                        6,  true),
('Hippopotame',      'animaux', '/illustrations/animals/hippopotame.svg',                   7,  true),
('Éléphant et son petit', 'animaux', '/illustrations/animals/vache-et-veau-sous-l''arbre.svg', 8, true),
('Singe',            'animaux', '/illustrations/animals/singe-avec-des-bananes.svg',         9,  true),
('Poussins',         'animaux', '/illustrations/animals/poussins.svg',                      10, true),
('Poule',            'animaux', '/illustrations/animals/poule.svg',                         11, true),
('Poisson',          'animaux', '/illustrations/animals/poisson.svg',                       12, true),
('Papillon',         'animaux', '/illustrations/animals/papillon.svg',                      13, true),
('Oiseau',           'animaux', '/illustrations/animals/oiseau.svg',                        14, true),
('Mouton',           'animaux', '/illustrations/animals/mouton.svg',                        15, true),
('Maman cane et ses canetons', 'animaux', '/illustrations/animals/maman-cane-et-ses-canetons.svg', 16, true),
('Lapin',            'animaux', '/illustrations/animals/lapin.svg',                         17, true),
('Escargot',         'animaux', '/illustrations/animals/escargot.svg',                      18, true),
('Dinosaures',       'animaux', '/illustrations/animals/dinosaures.svg',                    19, true),
('Chien',            'animaux', '/illustrations/animals/chien.svg',                         20, true),

-- ===== CULTURE =====
('Petite fille au balafon', 'culture', '/illustrations/culture/balafon.svg',               1,  true),
('Village africain',        'culture', '/illustrations/village-case-girafe.webp',           2,  true)

ON CONFLICT DO NOTHING;
