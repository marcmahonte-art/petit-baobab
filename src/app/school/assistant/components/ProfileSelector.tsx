"use client";

import React from "react";
import ProfileCard, { ProfileItem } from "./ProfileCard";
import { Persona } from "@/lib/assistant/prompts";

const PROFILES: ProfileItem[] = [
  {
    id: "educatrice_creche",
    title: "Éducatrice de crèche",
    subtitle: "Pour les tout-petits",
    ageBadge: "3 mois – 3 ans",
    imageSrc: "/illustrations/awa.webp",
    accentColor: "#65A916",
  },
  {
    id: "maitresse_maternelle",
    title: "Maîtresse de maternelle",
    subtitle: "Pour apprendre en s'amusant",
    ageBadge: "3 – 6 ans",
    imageSrc: "/illustrations/yacouba-enseignant.png",
    accentColor: "#FF8A00",
  },
  {
    id: "directrice",
    title: "Directrice",
    subtitle: "Pour organiser et accompagner l'équipe",
    ageBadge: "Équipe & gestion",
    imageSrc: "/illustrations/aminata-maman.png",
    accentColor: "#6535E8",
  },
];

interface ProfileSelectorProps {
  selectedPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
}

export default function ProfileSelector({ selectedPersona, onSelectPersona }: ProfileSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-[#35180D] flex items-center gap-2">
          <span>1. Choisissez votre profil</span>
        </h2>
        <p className="text-sm text-[#7A6A5E] font-medium mt-1">
          Votre profil nous aide à vous proposer les meilleurs outils.
        </p>
      </div>

      {/* Grid of Profile Cards (Responsive horizontal scroll on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PROFILES.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isSelected={selectedPersona === profile.id}
            onSelect={onSelectPersona}
          />
        ))}
      </div>
    </div>
  );
}
