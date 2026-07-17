// src/app/school/classes/page.tsx
"use server";
import { metadata } from '@/app/school/classes/metadata';
import ClassesClient from '@/app/school/classes/ClientPage';

export const metadata = {
  title: 'Mes classes – École',
};

export default function ClassesPage() {
  return <ClassesClient />;
}
