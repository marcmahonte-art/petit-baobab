// ============================================================
// Petit Baobab — Types d'authentification multi-rôles (Phase 1.2)
// ============================================================

export type UserRole = "parent" | "teacher" | "student";

export type SessionType =
  | { type: "parent"; profileId: string; accountId: string }
  | { type: "teacher"; profileId: string; accountId: string }
  | {
      type: "student";
      profileId: string;
      studentId: string;
      classroomId: string;
      name: string;
      mascot: string;
    }
  | null;

export type StudentLoginInput = {
  class_code: string;
  first_name: string;
  student_id?: string; // si sélection parmi homonymes
};

export type StudentLoginResponse = {
  profile_id: string;
  student_id: string;
  classroom_id: string;
  name: string;
  mascot: "bobo" | "kaya" | "zuri" | "momo" | "kiki" | "baobab";
  classroom_name: string;
  stars_balance: number;
  type: "student";
};

export type MultipleStudentsResponse = {
  multiple: true;
  students: { id: string; display_name: string; mascot: "bobo" | "kaya" | "zuri" | "momo" | "kiki" | "baobab" }[];
};
