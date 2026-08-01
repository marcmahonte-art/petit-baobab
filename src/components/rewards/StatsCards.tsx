"use client";

import { motion } from "framer-motion";
import { Star, Award, Trophy, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RewardStats } from "@/lib/rewards/mock-rewards";

function StatCard({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
    >
      <Card className="rounded-[22px] md:rounded-[28px] bg-white border border-[#EFE7DB]/60 shadow-[0_4px_12px_rgba(0,0,0,.06)] p-5 h-full">
        {children}
      </Card>
    </motion.div>
  );
}

function ProgressBar({ value, goal, tone }: { value: number; goal: number; tone: string }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="h-2.5 w-full rounded-full bg-[#F0E7DA] overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${tone}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export function StatsCards({ stats }: { stats: RewardStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* 1. Niveau */}
      <StatCard delay={0}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#E2F7EE] text-emerald-500 flex items-center justify-center text-2xl">
            🌟
          </div>
          <div>
            <p className="text-xs font-bold text-[#7A6A5E] uppercase tracking-wide">Mon niveau</p>
            <p className="text-xl font-extrabold text-[#3B2416]">Niveau {stats.level}</p>
          </div>
        </div>
        <ProgressBar value={stats.xp} goal={stats.xpForNextLevel} tone="bg-emerald-400" />
        <p className="mt-2 text-xs font-semibold text-[#7A6A5E]">
          {stats.xp} / {stats.xpForNextLevel} XP
        </p>
      </StatCard>

      {/* 2. Étoiles */}
      <StatCard delay={0.08}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#FFF5CC] text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7A6A5E] uppercase tracking-wide">Mes étoiles</p>
            <p className="text-xl font-extrabold text-[#3B2416]">{stats.stars} étoiles</p>
          </div>
        </div>
        <p className="text-xs font-semibold text-[#7A6A5E]">
          Encore {stats.starsForNextGift - stats.stars} étoiles pour le prochain cadeau
        </p>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 text-[#FFD95C] fill-current" />
          ))}
        </div>
      </StatCard>

      {/* 3. Badges */}
      <StatCard delay={0.16}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#EBE8FF] text-purple-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7A6A5E] uppercase tracking-wide">Mes badges</p>
            <p className="text-xl font-extrabold text-[#3B2416]">
              {stats.badgesEarned} / {stats.badgesTotal}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-1 w-full rounded-full border-[#E5E0D5] text-[#1A1A2E] font-bold hover:bg-[#FFF9F2]"
        >
          Voir tous
        </Button>
      </StatCard>

      {/* 4. Défis réussis */}
      <StatCard delay={0.24}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#E3F2FD] text-blue-500 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7A6A5E] uppercase tracking-wide">Défis réussis</p>
            <p className="text-xl font-extrabold text-[#3B2416]">{stats.challengesWon} terminés</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-1 w-full rounded-full border-[#E5E0D5] text-[#1A1A2E] font-bold hover:bg-[#FFF9F2]"
        >
          <Sparkles className="w-4 h-4 mr-1" /> Voir les défis
        </Button>
      </StatCard>
    </div>
  );
}
