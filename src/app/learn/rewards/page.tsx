"use client";

import { Sidebar } from "@/app/learn/_components/sidebar";
import { Header } from "@/app/learn/_components/header";
import { MobileBottomNav } from "@/components/child-dashboard";
import Image from "next/image";
import { Hero } from "@/components/rewards/Hero";
import { StatsCards } from "@/components/rewards/StatsCards";
import { Tabs } from "@/components/rewards/Tabs";
import { RewardsSidebar } from "@/components/rewards/RewardsSidebar";
import { ProgressCard } from "@/components/rewards/ProgressCard";
import { BaobabAdvice } from "@/components/rewards/BaobabAdvice";
import { BottomBanner } from "@/components/rewards/BottomBanner";
import { getRewardsData } from "@/lib/rewards/mock-rewards";

export default function RewardsPage() {
  const data = getRewardsData();

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        {/* Sidebar réutilisée (aucune duplication) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          {/* Header réutilisé */}
          <Header />

          <Hero childName={data.childName} />

          <StatsCards stats={data.stats} />

          {/* Onglets (Badges / Trophées / Collections / Défis / Historique) + panneau latéral */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <Tabs badges={data.badges} collection={data.collection} />
            <RewardsSidebar rewards={data.upcomingRewards} />
          </div>

          <ProgressCard items={data.progress} />

          <BaobabAdvice advice={data.advice} />

          <BottomBanner />
        </main>
      </div>

      <MobileBottomNav homeHref="/learn/dashboard" />

      {/* Footer décoratif (identique au dashboard enfant) */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 hidden lg:block select-none pointer-events-none">
        <Image
          src="/illustrations/footer_bas.webp"
          alt="Herbe décorative"
          width={1920}
          height={346}
          className="w-full h-auto block"
          priority
        />
      </div>
    </div>
  );
}
