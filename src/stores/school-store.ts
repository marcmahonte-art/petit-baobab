import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ClassroomWithStats, DashboardData } from '@/types/school';
import { getSupabaseClient } from '@/lib/supabase-client';
import { toast } from '@/components/ui/use-toast';

interface SchoolState {
  dashboardData: DashboardData | null;
  classes: ClassroomWithStats[];
  loading: boolean;
  error: string | null;
  selectedStudentId: string | null;
  isStudentDrawerOpen: boolean;
  fetchDashboard: () => Promise<void>;
  fetchClasses: () => Promise<void>;
  createClass: (name: string, academicYear?: string) => Promise<void>;
  openStudentDrawer: (studentId: string) => void;
  closeStudentDrawer: () => void;
  addStudentsBulk: (
    classroomId: string,
    students: { first_name: string; last_name?: string; display_name?: string; mascot?: string }[]
  ) => Promise<void>;
}

export const useSchoolStore = create<SchoolState>()(
  devtools(
    persist(
      (set, get) => ({
        dashboardData: null,
        classes: [],
        loading: false,
        error: null,
        selectedStudentId: null,
        isStudentDrawerOpen: false,
        async fetchDashboard() {
          try {
            set({ loading: true, error: null });
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.from('school_dashboard_view').select('*').single();
            if (error) throw error;
            set({ dashboardData: data as DashboardData, loading: false });
          } catch (e: any) {
            set({ error: e.message || 'Erreur tableau de bord', loading: false });
            toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
          }
        },
        async fetchClasses() {
          try {
            set({ loading: true, error: null });
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.from('classrooms').select('*');
            if (error) throw error;
            set({ classes: data as ClassroomWithStats[], loading: false });
          } catch (e: any) {
            set({ error: e.message || 'Erreur classes', loading: false });
            toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
          }
        },
        async createClass(name, academicYear) {
          try {
            set({ loading: true, error: null });
            const supabase = getSupabaseClient();
            const payload: any = { name };
            if (academicYear) payload.academic_year = academicYear;
            const { data, error } = await supabase.rpc('create_classroom', payload);
            if (error) throw error;
            await get().fetchClasses();
            toast({ title: 'Classe créée', description: `${name} a été ajoutée.` });
          } catch (e: any) {
            set({ error: e.message || 'Erreur création', loading: false });
            toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
          } finally {
            set({ loading: false });
          }
        },
        openStudentDrawer(studentId) {
          set({ selectedStudentId: studentId, isStudentDrawerOpen: true });
        },
        closeStudentDrawer() {
          set({ selectedStudentId: null, isStudentDrawerOpen: false });
        },
        async addStudentsBulk(classroomId, students) {
          try {
            set({ loading: true, error: null });
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
              .from('school_students')
              .insert(
                students.map((s) => ({
                  classroom_id: classroomId,
                  first_name: s.first_name,
                  last_name: s.last_name,
                  display_name: s.display_name,
                  mascot: s.mascot,
                }))
              );
            if (error) throw error;
            toast({ title: 'Import réussie', description: `${data?.length ?? 0} élèves créés.` });
            await get().fetchDashboard();
            await get().fetchClasses();
          } catch (e: any) {
            set({ error: e.message || 'Erreur import bulk', loading: false });
            toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
          } finally {
            set({ loading: false });
          }
        },
      }),
      {
        name: 'school-store',
        getStorage: () => sessionStorage,
      }
    )
  )
);
