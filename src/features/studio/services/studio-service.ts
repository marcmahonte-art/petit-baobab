// src/features/studio/services/studio-service.ts

import { getSupabaseServer } from "@/lib/supabaseServer";
import type {
  StudioProject,
  StudioPage,
  StudioTemplate,
  StudioAsset,
  ProjectType,
} from "../types";

/**
 * Service for CRUD operations on Studio entities.
 */
export const studioService = {
  /** Projects */
  async getProjects(childId: string): Promise<StudioProject[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("studio_projects")
      .select("*")
      .eq("child_id", childId);
    if (error) throw error;
    return data as StudioProject[];
  },

  async createProject(payload: {
    child_id: string;
    title: string;
    type: ProjectType;
  }): Promise<StudioProject> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("studio_projects")
      .insert({ ...payload, status: "draft" })
      .select()
      .single();
    if (error) throw error;
    return data as StudioProject;
  },

  /** Pages */
  async getPages(projectId: string): Promise<StudioPage[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("studio_pages")
      .select("*")
      .eq("project_id", projectId)
      .order("page_number", { ascending: true });
    if (error) throw error;
    return data as StudioPage[];
  },

  async savePage(page: {
    project_id: string;
    page_number: number;
    json: any;
    preview?: string;
  }): Promise<StudioPage> {
    const supabase = await getSupabaseServer();
    // Upsert based on project_id + page_number unique combination
    const { data, error } = await supabase
      .from("studio_pages")
      .upsert({
        ...page,
        created_at: new Date().toISOString(),
      }, { onConflict: ["project_id", "page_number"] })
      .select()
      .single();
    if (error) throw error;
    return data as StudioPage;
  },

  /** Templates */
  async getTemplates(filters?: { category?: string; premium?: boolean }): Promise<StudioTemplate[]> {
    const supabase = await getSupabaseServer();
    let query = supabase.from("studio_templates").select("*");
    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.premium !== undefined) query = query.eq("premium", filters.premium);
    const { data, error } = await query;
    if (error) throw error;
    return data as StudioTemplate[];
  },

  /** Assets */
  async getAssets(childId: string): Promise<StudioAsset[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("studio_assets")
      .select("*")
      .eq("child_id", childId);
    if (error) throw error;
    return data as StudioAsset[];
  },

  async uploadAsset(payload: {
    child_id: string;
    type: string;
    url: string;
    tags?: string[];
  }): Promise<StudioAsset> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("studio_assets")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as StudioAsset;
  },
};
