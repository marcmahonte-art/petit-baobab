import React from 'react';
import SchoolSidebar from '@/components/school/SchoolSidebar';
import SchoolMobileNav from '@/components/school/SchoolMobileNav';
import SchoolSupportButton from '@/components/school/SchoolSupportButton';

export const metadata = {
  title: 'Espace École – Petit Baobab',
};

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FFF9F2] text-[#3B2416]">
      {/* Sidebar – desktop */}
      <aside className="hidden md:block w-64 border-r border-[#F0E7DA] bg-white sticky top-0 h-screen select-none shrink-0">
        <SchoolSidebar />
      </aside>

      {/* Mobile top bar + content */}
      <div className="flex flex-col flex-1 min-w-0">
        <SchoolMobileNav />
        <main className="flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Support WhatsApp Business — visible dans tout l'espace école */}
      <SchoolSupportButton />
    </div>
  );
}
