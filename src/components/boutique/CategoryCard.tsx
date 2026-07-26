import Link from "next/link";
import Image from "next/image";
import { Category } from "@/lib/mock/types";
import { Palette, Hash, Code, Shirt, Sticker } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CategoryCard({ category, isSelected = false, onClick }: CategoryCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Palette":
        return <Palette className="w-5 h-5" />;
      case "Hash":
        return <Hash className="w-5 h-5" />;
      case "Code":
        return <Code className="w-5 h-5" />;
      case "Shirt":
        return <Shirt className="w-5 h-5" />;
      case "Sticker":
        return <Sticker className="w-5 h-5" />;
      default:
        return <Palette className="w-5 h-5" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col p-4 rounded-[20px] bg-white border cursor-pointer transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl ${
        isSelected
          ? "border-[#7D6AF8] ring-2 ring-[#7D6AF8]/20 shadow-md"
          : "border-[#E5E0D5] hover:border-[#7D6AF8]/50 shadow-sm"
      }`}
    >
      <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden mb-3 bg-[#FFF9F2]">
        <Image
          src={category.image}
          alt={category.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#7D6AF8] shadow-sm">
          {getIcon(category.icon)}
        </div>
      </div>

      <h3 className="text-base font-bold text-[#3B2416] group-hover:text-[#7D6AF8] transition-colors">
        {category.title}
      </h3>
      <p className="text-xs text-[#3B2416]/70 mt-1 line-clamp-2 leading-relaxed">
        {category.description}
      </p>
      <div className="mt-3 flex items-center justify-between text-[11px] font-extrabold text-[#7D6AF8]">
        <span>{category.productCount} produits</span>
        <span className="group-hover:translate-x-1 transition-transform">Voir tout &rarr;</span>
      </div>
    </div>
  );
}
