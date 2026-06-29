"use client"

import { cn } from "@/lib/utils"


// Cover Visual Dynamic Preview Component
export const BookPreviewCanvas = ({
  selectedCover,
  selectedPalette,
  title,
  subtitle,
  childName,
  author,
  decorativeFrame,
  orientation,
  scale = 1.0,
}: { 
  selectedCover: string
  selectedPalette: string
  title: string
  subtitle: string
  childName: string
  author: string
  decorativeFrame: string
  orientation: string
  scale?: number

}) => {
  const colors: Record<string, { primary: string; secondary: string; text: string }> = {
    Purple: { primary: "#7D6AF8", secondary: "#F1EFFF", text: "#4A4EBE" },
    Green: { primary: "#20C997", secondary: "#E6FAF4", text: "#0E7C5D" },
    Yellow: { primary: "#FFD95C", secondary: "#FFFDF2", text: "#8A6D00" },
    Orange: { primary: "#FFB300", secondary: "#FFF6E0", text: "#A35C00" },
    Blue: { primary: "#1194FF", secondary: "#E6F4FF", text: "#0056B3" },
    Pink: { primary: "#FF5E83", secondary: "#FFEBF0", text: "#B81C40" },
    Turquoise: { primary: "#13C6A2", secondary: "#E8FBF7", text: "#0B7F67" },
    Multicolore: { primary: "#7D6AF8", secondary: "#FFFDF7", text: "#3B2416" },
  }

  const activeColors = colors[selectedPalette] || colors.Purple

  const getCoverArt = () => {
    switch (selectedCover) {
      case "petit-baobab":
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full object-contain">
            <circle cx="100" cy="110" r="60" fill={selectedPalette === "Multicolore" ? "url(#coverMultiGrad)" : activeColors.primary} opacity="0.15" />
            <circle cx="100" cy="110" r="45" fill={selectedPalette === "Multicolore" ? "url(#coverMultiGrad)" : activeColors.primary} opacity="0.25" />
            <path d="M92 160 C90 140, 85 110, 80 95 C82 85, 95 80, 100 80 C105 80, 118 85, 120 95 C115 110, 110 140, 108 160 Z" fill="#3B2416" />
            <circle cx="80" cy="85" r="22" fill={selectedPalette === "Multicolore" ? "#20C997" : activeColors.primary} opacity="0.85" />
            <circle cx="120" cy="85" r="22" fill={selectedPalette === "Multicolore" ? "#FFD95C" : activeColors.primary} opacity="0.85" />
            <circle cx="100" cy="70" r="26" fill={selectedPalette === "Multicolore" ? "#7D6AF8" : activeColors.primary} />
            <ellipse cx="100" cy="165" rx="75" ry="12" fill="#5C4033" />
            <path d="M135 160 L137 125 L144 110 L144 75 Q145 70, 148 70 Q150 72, 148 76 L146 110 L149 125 L151 160" stroke="#3B2416" strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="148" cy="71" r="3.5" fill="#3B2416" />
          </svg>
        )
      case "savane":
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full object-contain">
            <circle cx="100" cy="100" r="65" fill={selectedPalette === "Multicolore" ? "url(#coverMultiGrad)" : activeColors.primary} opacity="0.25" />
            <path d="M85 135 C85 125, 95 110, 105 110 C110 110, 115 105, 115 100 C115 95, 110 88, 102 88 C95 88, 92 92, 90 85 C88 80, 95 72, 105 72 C115 72, 128 85, 128 100 C128 115, 132 120, 138 122 L138 135 L128 135 L125 128 L115 128 L112 135 Z" fill="#3B2416" />
            <path d="M30 145 L35 125 L40 145 M45 145 L52 120 L58 145 M150 145 L155 122 L162 145" stroke="#3B2416" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="20" y="135" width="160" height="20" rx="5" fill="#3B2416" />
          </svg>
        )
      case "ecole":
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full object-contain">
            <circle cx="150" cy="50" r="22" fill="#FFD95C" opacity="0.8" />
            <rect x="50" y="90" width="100" height="60" rx="6" fill="#F0E7DA" stroke="#3B2416" strokeWidth="3" />
            <polygon points="40,90 100,45 160,90" fill={selectedPalette === "Multicolore" ? "#FF5E83" : activeColors.primary} stroke="#3B2416" strokeWidth="3" />
            <rect x="88" y="115" width="24" height="35" rx="3" fill="#3B2416" />
            <rect x="62" y="105" width="18" height="18" rx="2" fill="white" stroke="#3B2416" strokeWidth="2" />
            <rect x="120" y="105" width="18" height="18" rx="2" fill="white" stroke="#3B2416" strokeWidth="2" />
            <line x1="100" y1="45" x2="100" y2="25" stroke="#3B2416" strokeWidth="2.5" />
            <path d="M100 25 L120 32 L100 39 Z" fill={selectedPalette === "Multicolore" ? "#1194FF" : activeColors.primary} />
          </svg>
        )
      case "afrique":
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full object-contain">
            <path d="M70 70 L80 135 L75 140 L75 155 L125 155 L125 140 L120 135 L130 70 Z" fill="#5C4033" stroke="#3B2416" strokeWidth="3" />
            <ellipse cx="100" cy="70" rx="30" ry="10" fill="#EFE7DB" stroke="#3B2416" strokeWidth="3" />
            <path d="M73 78 L100 135 L127 78 M85 78 L100 135 L115 78" stroke="#3B2416" strokeWidth="1.5" />
            <path d="M20 50 L40 30 L60 50 L80 30 L100 50 L120 30 L140 50 L160 30 L180 50" fill="none" stroke={selectedPalette === "Multicolore" ? "#FFB300" : activeColors.primary} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <path d="M20 170 L40 150 L60 170 L80 150 L100 170 L120 150 L140 170 L160 150 L180 170" fill="none" stroke={selectedPalette === "Multicolore" ? "#7D6AF8" : activeColors.primary} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          </svg>
        )
      case "coloree":
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full object-contain">
            <path d="M30 150 A70 70 0 0 1 170 150" fill="none" stroke="#FF5E83" strokeWidth="10" />
            <path d="M42 150 A58 58 0 0 1 158 150" fill="none" stroke="#FFB300" strokeWidth="10" />
            <path d="M54 150 A46 46 0 0 1 146 150" fill="none" stroke="#20C997" strokeWidth="10" />
            <path d="M66 150 A34 34 0 0 1 134 150" fill="none" stroke="#1194FF" strokeWidth="10" />
            <circle cx="35" cy="145" r="16" fill="white" opacity="0.95" />
            <circle cx="50" cy="145" r="12" fill="white" opacity="0.95" />
            <circle cx="165" cy="145" r="16" fill="white" opacity="0.95" />
            <circle cx="150" cy="145" r="12" fill="white" opacity="0.95" />
          </svg>
        )
      case "ia":
      default:
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full object-contain">
            <path d="M60 140 L135 65" stroke="#3B2416" strokeWidth="6" strokeLinecap="round" />
            <rect x="131" y="61" width="10" height="10" transform="rotate(45 136 66)" fill="#FFD95C" stroke="#3B2416" strokeWidth="2" />
            <path d="M140 40 L140 25 M140 40 L155 40 M140 40 L148 32 M120 60 L110 50 M165 70 L155 65 M95 45 L90 35" stroke={selectedPalette === "Multicolore" ? "#FF5E83" : activeColors.primary} strokeWidth="3" strokeLinecap="round" />
            <path d="M100 100 L102 108 L110 110 L102 112 L100 120 L98 112 L90 110 L98 108 Z" fill="#FFD95C" />
            <path d="M150 110 L151 114 L155 115 L151 116 L150 120 L149 116 L145 115 L149 114 Z" fill={selectedPalette === "Multicolore" ? "#7D6AF8" : activeColors.primary} />
          </svg>
        )
    }
  }

  const renderFrameBorders = () => {
    switch (decorativeFrame) {
      case "Faso Dan Fani":
        return (
          <div className="absolute inset-0 pointer-events-none border-[12px] border-transparent"
               style={{
                 borderImage: "repeating-linear-gradient(45deg, #FF5E83, #FF5E83 8px, #20C997 8px, #20C997 16px, #FFD95C 16px, #FFD95C 24px) 12"
               }}
          />
        )
      case "Bogolan":
        return (
          <div className="absolute inset-0 pointer-events-none border-[14px] border-[#3B2416]">
            <div className="absolute inset-1 border-2 border-dashed border-white/60" />
            <div className="absolute top-1 left-4 right-4 h-1 flex justify-around text-[6px] text-white/50"><span>â–²</span><span>â–¼</span><span>â–²</span><span>â–¼</span></div>
            <div className="absolute bottom-1 left-4 right-4 h-1 flex justify-around text-[6px] text-white/50"><span>â–²</span><span>â–¼</span><span>â–²</span><span>â–¼</span></div>
          </div>
        )
      case "Nature":
        return (
          <div className="absolute inset-0 pointer-events-none border-[10px] border-[#20C997]/20 flex justify-between items-center p-1">
            <div className="absolute top-1 left-1.5 text-[10px]">ðŸƒ</div>
            <div className="absolute top-1 right-1.5 text-[10px]">ðŸŒ¿</div>
            <div className="absolute bottom-1 left-1.5 text-[10px]">ðŸŒ±</div>
            <div className="absolute bottom-1 right-1.5 text-[10px]">ðŸƒ</div>
          </div>
        )
      case "Savane":
        return (
          <div className="absolute inset-0 pointer-events-none border-[10px] border-[#FFB300]/20 flex justify-between items-center p-1">
            <div className="absolute top-1 left-1.5 text-[10px]">ðŸ¦</div>
            <div className="absolute top-1 right-1.5 text-[10px]">ðŸŒ³</div>
            <div className="absolute bottom-1 left-1.5 text-[10px]">ðŸ¦’</div>
            <div className="absolute bottom-1 right-1.5 text-[10px]">ðŸ˜</div>
          </div>
        )
      case "Animaux":
        return (
          <div className="absolute inset-0 pointer-events-none border-[10px] border-[#7D6AF8]/20 flex justify-between items-center p-1">
            <div className="absolute top-1.5 left-1.5 text-[8px]">ðŸ¾</div>
            <div className="absolute top-1.5 right-1.5 text-[8px]">ðŸ¾</div>
            <div className="absolute bottom-1.5 left-1.5 text-[8px]">ðŸ¾</div>
            <div className="absolute bottom-1.5 right-1.5 text-[8px]">ðŸ¾</div>
          </div>
        )
      case "Aucun":
      default:
        return (
          <div className="absolute inset-0 pointer-events-none border-2 border-[#3B2416]/10 rounded-2xl" />
        )
    }
  }

  const isLandscape = orientation === "Paysage"
  const aspectClass = isLandscape ? "aspect-[47/32]" : "aspect-[32/47]"

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden shadow-md flex flex-col justify-between p-5 transition-all duration-300 font-nunito mx-auto origin-center",
        aspectClass
      )}
      style={{
        background: `linear-gradient(to bottom, #FFFDF7, ${selectedPalette === "Multicolore" ? "#F5EEFF" : activeColors.secondary})`,
        transform: `scale(${scale})`,
        width: isLandscape ? "350px" : "280px",
        height: isLandscape ? "238px" : "410px",
      }}
    >
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="coverMultiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5E83" />
            <stop offset="35%" stopColor="#FFB300" />
            <stop offset="70%" stopColor="#20C997" />
            <stop offset="100%" stopColor="#7D6AF8" />
          </linearGradient>
        </defs>
      </svg>

      {renderFrameBorders()}

      <div className="w-full flex items-center justify-between z-10 px-1 pt-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#3B2416]/40 leading-none">
          Petit Baobab
        </span>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-[#FF5E83]" />
          <span className="w-1 h-1 rounded-full bg-[#FFD95C]" />
          <span className="w-1 h-1 rounded-full bg-[#20C997]" />
        </div>
      </div>

      <div className="flex flex-col items-center text-center mt-3 gap-1 z-10 px-1">
        <h2
          className="text-[16px] sm:text-[18px] font-black tracking-tight leading-tight uppercase font-sans break-words w-full"
          style={{
            color: selectedPalette === "Multicolore" ? "#7D6AF8" : activeColors.text
          }}
        >
          {title || "Mon livre de coloriage"}
        </h2>
        {subtitle && (
          <p className="text-[10px] font-bold text-[#7A6A5E] italic leading-none break-words w-full mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex-1 w-full relative flex items-center justify-center my-2 z-10 pointer-events-none min-h-[70px]">
        {getCoverArt()}
      </div>

      <div className="w-full flex flex-col items-center gap-0.5 z-10 px-1 pb-1">
        <div className="w-6 h-0.5 bg-[#3B2416]/10 rounded-full my-0.5" />
        <p className="text-[9px] font-bold text-[#3B2416]/80 leading-none">
          Par : <span className="font-black text-[#3B2416]">{author || "Auteur"}</span>
        </p>
        {childName && (
          <span className="text-[8px] font-black bg-[#3B2416]/5 text-[#3B2416]/80 px-2 py-0.5 rounded-full mt-1">
            CrÃ©Ã© pour {childName}
          </span>
        )}
      </div>
    </div>
  )
}


