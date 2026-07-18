"use client";
import React from "react";
import ShareClassWidget from "./ShareClassWidget";
import StarsBalanceWidget from "./StarsBalanceWidget";
import ProgressChart from "./ProgressChart";
import QuickActionsWidget from "./QuickActionsWidget";
import InspirationWidget from "./InspirationWidget";
import { ClassroomWithStats } from "@/types/school";

interface RightPanelProps {
  selectedClass: ClassroomWithStats | null;
  stars: {
    balance: number;
    monthly_limit: number;
    renewal_date: string;
  };
}

export default function RightPanel({ selectedClass, stars }: RightPanelProps) {
  return (
    <div className="space-y-6 w-full">
      {/* 1. Share Classroom Widget */}
      <ShareClassWidget
        classCode={selectedClass?.class_code || "BAOBAB-CE1"}
        className={selectedClass?.name || "Classe"}
      />

      {/* 2. Stars Balance Widget */}
      <StarsBalanceWidget
        balance={stars.balance}
        limit={stars.monthly_limit}
        renewalDate={stars.renewal_date}
      />

      {/* 3. Classroom Progression Rates Chart & Bravo Card */}
      <ProgressChart />

      {/* 4. Quick Actions Widget */}
      <QuickActionsWidget />

      {/* 5. Inspiration / Motivation Widget */}
      <InspirationWidget />
    </div>
  );
}
