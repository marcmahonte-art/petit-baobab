// src/app/school/students/page.tsx
import StudentsClient from "@/app/school/students/StudentsClient";

export const metadata = {
  title: "Mes élèves – École",
};

export default function StudentsPage() {
  return <StudentsClient />;
}
