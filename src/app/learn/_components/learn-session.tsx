"use client";

import { createContext, useContext } from "react";

export type LearnSessionRole = "student" | "parent" | "unknown";

interface LearnSessionValue {
  /** Type de session résolu CÔTÉ SERVEUR à partir du cookie sb-student-token.
   *  Source de vérité unique — jamais un état Zustand/React volatile. */
  role: LearnSessionRole;
}

const LearnSessionContext = createContext<LearnSessionValue>({ role: "unknown" });

export function LearnSessionProvider({
  role,
  children,
}: {
  role: LearnSessionRole;
  children: React.ReactNode;
}) {
  return (
    <LearnSessionContext.Provider value={{ role }}>
      {children}
    </LearnSessionContext.Provider>
  );
}

/**
 * Lit le type de session de l'espace apprenant.
 * Déterminé par le serveur (cookie sb-student-token) à chaque chargement de
 * page — jamais depuis un état React/Zustand en cache. Ainsi un élève ne peut
 * jamais voir le menu Parent, même après refresh / retour navigateur / nouvel
 * onglet.
 */
export function useLearnSession(): LearnSessionValue {
  return useContext(LearnSessionContext);
}
