import React from 'react';
import SchoolSidebar from '@/components/school/SchoolSidebar';

export const metadata = {
  title: 'Tableau de bord – École',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FFF9F2]">
      {/* Sidebar – visible on desktop */}
      <aside className="hidden lg:block w-60 border-r border-gray-200 bg-white/60 backdrop-blur-sm">
        <SchoolSidebar />
      </aside>

      {/* Mobile navigation – placeholder (future Sheet) */}
      {/* TODO: implement Shadcn Sheet with hamburger */}

      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
