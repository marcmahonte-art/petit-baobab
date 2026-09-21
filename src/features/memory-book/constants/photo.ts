/**
 * Transformations photo du cahier de souvenirs (spec §25).
 *
 * Ces bornes étaient dupliquées et divergentes : l'inspecteur autorisait un zoom
 * de 0,8 à 1,8 alors que le canvas l'autorisait de 1 à 3, si bien qu'un même
 * réglage n'avait pas la même signification selon l'endroit où on le modifiait.
 * Un zoom inférieur à 1 laisserait en plus des vides dans le cadre.
 */

export const PHOTO_ZOOM_MIN = 1;
export const PHOTO_ZOOM_MAX = 3;
export const PHOTO_ZOOM_STEP = 0.1;

/** Ramène un zoom dans les bornes autorisées. */
export function clampPhotoZoom(value: number): number {
  // Seul NaN échappe au calcul : Math.max/min propagent NaN. L'infini, lui,
  // doit simplement saturer sur la borne correspondante.
  if (Number.isNaN(value)) return PHOTO_ZOOM_MIN;
  const bounded = Math.min(PHOTO_ZOOM_MAX, Math.max(PHOTO_ZOOM_MIN, value));
  return Number(bounded.toFixed(2));
}

/** Normalise un angle de rotation dans l'intervalle [0, 360). */
export function normalizeRotation(degrees: number): number {
  if (!Number.isFinite(degrees)) return 0;
  return ((Math.round(degrees) % 360) + 360) % 360;
}
