"use client";

import { useEffect } from "react";

// Persiste le choix d'espace par défaut côté serveur (colonne accounts.default_space)
// lorsqu'on clique sur un espace et que la case "se souvenir" est cochée.
// Le callback OAuth lit ensuite cette valeur pour rediriger automatiquement.
export function RememberSpaceScript() {
  useEffect(() => {
    async function rememberAndGo(space: "family" | "school") {
      const checkbox = document.getElementById("remember-space") as HTMLInputElement | null;
      if (checkbox?.checked) {
        try {
          await fetch("/api/auth/default-space", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ space }),
          });
        } catch {
          // Non bloquant : la redirection a lieu quand même.
        }
      }
    }

    const family = document.getElementById("space-family");
    const school = document.getElementById("space-school");

    const onFamily = () => rememberAndGo("family");
    const onSchool = () => rememberAndGo("school");

    family?.addEventListener("click", onFamily);
    school?.addEventListener("click", onSchool);

    return () => {
      family?.removeEventListener("click", onFamily);
      school?.removeEventListener("click", onSchool);
    };
  }, []);

  return null;
}
