import { describe, expect, it } from "vitest";
import {
  clampPhotoZoom,
  normalizeRotation,
  PHOTO_ZOOM_MAX,
  PHOTO_ZOOM_MIN,
} from "../photo";

describe("clampPhotoZoom", () => {
  it("laisse passer une valeur dans les bornes", () => {
    expect(clampPhotoZoom(1.5)).toBe(1.5);
  });

  it("relève un zoom inférieur au minimum (sinon le cadre laisserait des vides)", () => {
    expect(clampPhotoZoom(0.4)).toBe(PHOTO_ZOOM_MIN);
    expect(clampPhotoZoom(0)).toBe(PHOTO_ZOOM_MIN);
  });

  it("plafonne un zoom excessif", () => {
    expect(clampPhotoZoom(12)).toBe(PHOTO_ZOOM_MAX);
  });

  it("arrondit au centième", () => {
    expect(clampPhotoZoom(1.23456)).toBe(1.23);
  });

  it("retombe sur le minimum pour une valeur non finie", () => {
    expect(clampPhotoZoom(Number.NaN)).toBe(PHOTO_ZOOM_MIN);
    expect(clampPhotoZoom(Number.POSITIVE_INFINITY)).toBe(PHOTO_ZOOM_MAX);
  });

  it("accepte les deux bornes elles-mêmes", () => {
    expect(clampPhotoZoom(PHOTO_ZOOM_MIN)).toBe(PHOTO_ZOOM_MIN);
    expect(clampPhotoZoom(PHOTO_ZOOM_MAX)).toBe(PHOTO_ZOOM_MAX);
  });
});

describe("normalizeRotation", () => {
  it("conserve un angle déjà dans l'intervalle", () => {
    expect(normalizeRotation(90)).toBe(90);
    expect(normalizeRotation(0)).toBe(0);
  });

  it("ramène 360° à 0°", () => {
    expect(normalizeRotation(360)).toBe(0);
    expect(normalizeRotation(720)).toBe(0);
  });

  it("gère les angles négatifs", () => {
    expect(normalizeRotation(-5)).toBe(355);
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(-360)).toBe(0);
  });

  it("arrondit un angle fractionnaire", () => {
    expect(normalizeRotation(89.6)).toBe(90);
  });

  it("retombe sur 0 pour une valeur non finie", () => {
    expect(normalizeRotation(Number.NaN)).toBe(0);
  });
});
