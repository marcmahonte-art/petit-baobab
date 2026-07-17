import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ClassroomWithStats, DashboardData, StudentActivityFeed } from '@/types/school';
import { getSupabaseClient } from '@/lib/supabase-client';
import { toast } from '@/components/ui/use-toast';

// ────────────────────────────────────────────────────────────
// Données mockées pour le développement UI
// ────────────────────────────────────────────────────────────

const MOCK_DASHBOARD: DashboardData = {
  teacher: {
    name: "Awa Kaboré",
    role: "Enseignante",
    avatar: null,
  },
  stars: {
    balance: 740,
    monthly_limit: 1000,
    consumed_this_month: 260,
    renewal_date: "2025-07-01T00:00:00Z",
    remaining: 180,
  },
  classrooms: [
    {
      id: "cls-1",
      account_id: "acc-1",
      name: "CE1 A",
      class_code: "BAOBAB-CE1",
      academic_year: "2024-2025",
      archived_at: null,
      created_at: "2024-09-01T00:00:00Z",
      student_count: 28,
      active_today: 12,
      total_drawings: 156,
      total_books: 34,
      completion_percentage: 82,
      last_activity_at: new Date().toISOString(),
      color_badge: "#7D6AF8",
      illustration_index: 1,
    },
    {
      id: "cls-2",
      account_id: "acc-1",
      name: "CE2 B",
      class_code: "KM72A",
      academic_year: "2024-2025",
      archived_at: null,
      created_at: "2024-09-01T00:00:00Z",
      student_count: 22,
      active_today: 8,
      total_drawings: 98,
      total_books: 22,
      completion_percentage: 61,
      last_activity_at: new Date(Date.now() - 86400000).toISOString(),
      color_badge: "#FF9500",
      illustration_index: 2,
    },
    {
      id: "cls-3",
      account_id: "acc-1",
      name: "CM1",
      class_code: "A8P2D",
      academic_year: "2024-2025",
      archived_at: null,
      created_at: "2024-09-01T00:00:00Z",
      student_count: 19,
      active_today: 7,
      total_drawings: 112,
      total_books: 18,
      completion_percentage: 80,
      last_activity_at: new Date().toISOString(),
      color_badge: "#20C997",
      illustration_index: 3,
    },
    {
      id: "cls-4",
      account_id: "acc-1",
      name: "CP A",
      class_code: "QP91Z",
      academic_year: "2024-2025",
      archived_at: null,
      created_at: "2024-09-01T00:00:00Z",
      student_count: 24,
      active_today: 10,
      total_drawings: 180,
      total_books: 12,
      completion_percentage: 70,
      last_activity_at: new Date(Date.now() - 43200000).toISOString(),
      color_badge: "#1194FF",
      illustration_index: 4,
    },
    {
      id: "cls-5",
      account_id: "acc-1",
      name: "Maternelle 1",
      class_code: "TH42K",
      academic_year: "2024-2025",
      archived_at: null,
      created_at: "2024-09-01T00:00:00Z",
      student_count: 18,
      active_today: 6,
      total_drawings: 99,
      total_books: 8,
      completion_percentage: 55,
      last_activity_at: new Date().toISOString(),
      color_badge: "#FF5E83",
      illustration_index: 5,
    },
  ],
  recent_activity: [
    {
      id: "act-1",
      profile_id: "p-1",
      action: "drawing_created",
      stars_used: 0,
      points_earned: 5,
      metadata: { theme: "Les animaux de la savane" },
      created_at: new Date().toISOString(),
      student_name: "Ali",
      classroom_name: "CE1 A",
      stars_earned: 5,
      action_detail: "Thème : Les animaux de la savane",
      action_label: "a terminé un coloriage",
      student_avatar: null,
    },
    {
      id: "act-2",
      profile_id: "p-2",
      action: "book_created",
      stars_used: 0,
      points_earned: 20,
      metadata: { title: "Mon village" },
      created_at: new Date(Date.now() - 3600000).toISOString(),
      student_name: "Awa",
      classroom_name: "CE2 B",
      stars_earned: 20,
      action_detail: "Titre : Mon village",
      action_label: "a créé un livre",
      student_avatar: null,
    },
    {
      id: "act-3",
      profile_id: "p-3",
      action: "badge_earned",
      stars_used: 0,
      points_earned: 10,
      metadata: { badge: "Artiste en herbe" },
      created_at: new Date(Date.now() - 86400000).toISOString(),
      student_name: "Moussa",
      classroom_name: "CM1",
      stars_earned: 10,
      action_detail: "Badge : Artiste en herbe",
      action_label: "a gagné un badge",
      student_avatar: null,
    },
    {
      id: "act-4",
      profile_id: "p-4",
      action: "activity_completed",
      stars_used: 0,
      points_earned: 5,
      metadata: { activity: "Lettres et sons" },
      created_at: new Date(Date.now() - 86400000).toISOString(),
      student_name: "Fatou",
      classroom_name: "CP A",
      stars_earned: 5,
      action_detail: "Activité : Lettres et sons",
      action_label: "a terminé une activité",
      student_avatar: null,
    },
    {
      id: "act-5",
      profile_id: "p-5",
      action: "login",
      stars_used: 0,
      points_earned: 0,
      metadata: {},
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      student_name: "Ali",
      classroom_name: "CE1 A",
      stars_earned: 0,
      action_detail: "",
      action_label: "s'est connecté",
      student_avatar: null,
    },
  ],
  summary: {
    total_classes: 5,
    total_students: 132,
    active_today: 43,
    total_drawings: 645,
    total_coloriages: 645,
    total_books: 28,
    stars_earned_this_week: 135,
  },
};

// ────────────────────────────────────────────────────────────
// Store
// ────────────────────────────────────────────────────────────

interface SchoolState {
  dashboardData: DashboardData | null;
  classes: ClassroomWithStats[];
  loading: boolean;
  error: string | null;
  selectedStudentId: string | null;
  isStudentDrawerOpen: boolean;
  selectedClassForShare: ClassroomWithStats | null;
  useMockData: boolean;
  selectedClass: ClassroomWithStats | null;
  loadingDetail: boolean;
  errorDetail: string | null;
  students: any[];
  fetchDashboard: () => Promise<void>;
  fetchClasses: () => Promise<void>;
  fetchClassDetail: (id: string) => Promise<void>;
  fetchStudents: (id: string) => Promise<void>;
  createClass: (name: string, academicYear?: string) => Promise<void>;
  openStudentDrawer: (studentId: string) => void;
  closeStudentDrawer: () => void;
  selectClassForShare: (cls: ClassroomWithStats | null) => void;
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
        selectedClassForShare: null,
        useMockData: true, // Activé pour le développement UI
        selectedClass: null,
        loadingDetail: false,
        errorDetail: null,
        students: [],
        async fetchDashboard() {
          try {
            set({ loading: true, error: null });

            if (get().useMockData) {
              // Utiliser les données mockées
              set({ dashboardData: MOCK_DASHBOARD, loading: false });
              return;
            }

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

            if (get().useMockData) {
              set({ classes: MOCK_DASHBOARD.classrooms, loading: false });
              return;
            }

            const supabase = getSupabaseClient();
            const { data, error } = await supabase.from('classrooms').select('*');
            if (error) throw error;
            set({ classes: data as ClassroomWithStats[], loading: false });
          } catch (e: any) {
            set({ error: e.message || 'Erreur classes', loading: false });
            toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
          }
        },
        async fetchClassDetail(id) {
          try {
            set({ loadingDetail: true, errorDetail: null });
            if (get().useMockData) {
              const cls = MOCK_DASHBOARD.classrooms.find(c => c.id === id) || MOCK_DASHBOARD.classrooms[0];
              set({ selectedClass: cls, loadingDetail: false });
              return;
            }
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.from('classrooms').select('*').eq('id', id).single();
            if (error) throw error;
            set({ selectedClass: data as ClassroomWithStats, loadingDetail: false });
          } catch (e: any) {
            set({ errorDetail: e.message || 'Erreur détail classe', loadingDetail: false });
          }
        },
        async fetchStudents(classroomId) {
          try {
            if (get().useMockData) {
              const mockStudents = [
                { id: "st-1", classroom_id: classroomId, first_name: "Ali", mascot: "lion", profile_id: "prof-ali-123", display_name: "Ali K." },
                { id: "st-2", classroom_id: classroomId, first_name: "Awa", mascot: "awa", profile_id: "prof-awa-456", display_name: "Awa S." },
                { id: "st-3", classroom_id: classroomId, first_name: "Moussa", mascot: "robot", profile_id: "prof-moussa-789", display_name: "Moussa B." },
              ];
              set({ students: mockStudents });
              return;
            }
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.from('school_students').select('*').eq('classroom_id', classroomId);
            if (error) throw error;
            set({ students: data || [] });
          } catch (e: any) {
            toast({ title: 'Erreur', description: 'Impossible de charger les élèves.', variant: 'destructive' });
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
        selectClassForShare(cls) {
          set({ selectedClassForShare: cls });
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
