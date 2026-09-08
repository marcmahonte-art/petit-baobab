"use client";

import React from "react";
import { Sidebar } from "@/app/learn/_components/sidebar";
import { Header } from "@/app/learn/_components/header";
import { MobileBottomNav } from "@/components/child-dashboard";
import { useProfile } from "@/lib/profile-store";

interface AppShellProps {
  children: React.ReactNode;
  sidebarExtra?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const profile = useProfile();
  const childId = profile?.id || "default_child";

  return (
    <div className="min-h-screen bg-[#F3EDE4] relative overflow-hidden font-['Quicksand',sans-serif] text-[#3B2416]">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <Header />
          {children}
        </main>
      </div>

      <MobileBottomNav homeHref="/learn/dashboard" />
    </div>
  );
}
