import React from "react";
import Image from "next/image";

export const HeroSection: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col pt-4 px-10 pb-10 lg:pt-6 lg:px-12 lg:pb-12 select-none overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/illustrations/background login good.webp"
          alt="Fond décoratif"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full flex flex-col h-full">
        
        {/* Top Brand Logo */}
        <div className="self-start mb-6 w-full">
          <Image
            src="/illustrations/logo-petit-baobab.svg"
            alt="Logo Petit Baobab"
            width={500}
            height={167}
            className="w-auto h-32 md:h-48 lg:h-56 object-contain max-w-full"
            priority
          />
        </div>

      </div>
    </div>
  );
};
