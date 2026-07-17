// ============================================================
// Petit Baobab — Types TypeScript pour le Module École
// ============================================================

export interface Classroom {
  id: string;
  account_id: string;
  name: string;
  class_code: string;
  academic_year: string;
  archived_at: string | null;
  created_at: string;
}

export interface SchoolStudent {
  id: string;
  classroom_id: string;
  first_name: string;
  last_name: string | null;
  display_name: string | null;
  mascot: "awa" | "lion" | "robot";
  pin: string | null;
  deleted_at: string | null;
  created_at: string;
}

export type StudentActivityAction =
  | "drawing_created"
  | "book_created"
  | "badge_earned"
  | "activity_completed"
  | "login";

export interface StudentActivity {
  id: string;
  profile_id: string;
  action: StudentActivityAction;
  stars_used: number;
  points_earned: number;
  metadata: Record<string, any>;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// Types enrichis pour l'interface utilisateur
// ────────────────────────────────────────────────────────────

export interface ClassroomWithStats extends Classroom {
  student_count: number;
  active_today: number;
  total_drawings: number;
  total_books: number;
  // Champs enrichis pour le nouveau design
  completion_percentage: number;
  last_activity_at: string | null;
  color_badge: string;
  illustration_index: number;
}

export interface StudentWithProfile extends SchoolStudent {
  profile_id: string;
  points: number;
  badges: string[];
  drawings_count: number;
  books_count: number;
  last_active: string | null;
}

export interface StudentActivityFeed extends StudentActivity {
  student_name: string;
  classroom_name: string;
  // Champs enrichis
  stars_earned: number;
  action_detail: string;
  action_label: string;
  student_avatar: string | null;
}

export interface DashboardData {
  teacher: {
    name: string;
    role: string;
    avatar: string | null;
  };
  stars: {
    balance: number;
    monthly_limit: number;
    consumed_this_month: number;
    renewal_date: string;
    remaining: number;
  };
  classrooms: ClassroomWithStats[];
  recent_activity: StudentActivityFeed[];
  summary: {
    total_classes: number;
    total_students: number;
    active_today: number;
    total_drawings: number;
    total_coloriages: number;
    total_books: number;
    stars_earned_this_week: number;
  };
}

// ────────────────────────────────────────────────────────────
// Types de requête et de réponse API
// ────────────────────────────────────────────────────────────

export interface CreateClassroomInput {
  name: string;
  academic_year?: string;
}

export interface CreateStudentInput {
  first_name: string;
  last_name?: string;
  display_name?: string;
  mascot?: "awa" | "lion" | "robot";
}

export interface CreateStudentsBulkInput {
  classroom_id: string;
  students: CreateStudentInput[];
}

export interface StudentLoginInput {
  class_code: string;
  first_name: string;
  student_id?: string; // optionnel pour lever l'homonymie
}

export interface StudentLoginResponse {
  profile_id: string;
  student_id: string;
  classroom_id: string;
  name: string;
  mascot: "awa" | "lion" | "robot";
  classroom_name: string;
  stars_balance: number;
  type: "student";
}
