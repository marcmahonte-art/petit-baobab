// src/features/studio/hooks/useStudioProjects.ts

import { useEffect, useState } from "react";
import { studioService } from "../services/studio-service";
import type { StudioProject } from "../types";

/** Hook to fetch and manage the list of projects for a child */
export function useStudioProjects(childId: string | null) {
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    studioService
      .getProjects(childId)
      .then((data) => setProjects(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [childId]);

  const refresh = () => {
    if (!childId) return;
    setLoading(true);
    studioService
      .getProjects(childId)
      .then((data) => setProjects(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return { projects, loading, error, refresh };
}
