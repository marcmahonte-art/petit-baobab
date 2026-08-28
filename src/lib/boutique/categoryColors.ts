export type CategorySlug =
  | "livres-coloriage"
  | "color-by-number"
  | "kit-de-coloriage"
  | "t-shirts"
  | "stickers"
  | "jeux-et-jouets";

interface CategoryColor {
  base: string;
  hover: string;
  shadow: string;
}

const CATEGORY_BUTTON_COLORS: Record<string, CategoryColor> = {
  "color-by-number": {
    base: "bg-[#1ecc9c]",
    hover: "hover:bg-[#19a882]",
    shadow: "shadow-[#1ecc9c]/20",
  },
  "livres-coloriage": {
    base: "bg-[#7e6af6]",
    hover: "hover:bg-[#6552E8]",
    shadow: "shadow-[#7e6af6]/20",
  },
  "kit-de-coloriage": {
    base: "bg-[#ffaf3c]",
    hover: "hover:bg-[#e69a2e]",
    shadow: "shadow-[#ffaf3c]/20",
  },
  "t-shirts": {
    base: "bg-[#ff6aab]",
    hover: "hover:bg-[#e65d98]",
    shadow: "shadow-[#ff6aab]/20",
  },
  stickers: {
    base: "bg-[#5097ff]",
    hover: "hover:bg-[#4585e6]",
    shadow: "shadow-[#5097ff]/20",
  },
};

const DEFAULT_COLOR: CategoryColor = {
  base: "bg-[#7D6AF8]",
  hover: "hover:bg-[#6552E8]",
  shadow: "shadow-[#7D6AF8]/20",
};

export function getCategoryButtonClasses(category: string): string {
  const color = CATEGORY_BUTTON_COLORS[category] ?? DEFAULT_COLOR;
  return `${color.base} ${color.hover} ${color.shadow}`;
}
