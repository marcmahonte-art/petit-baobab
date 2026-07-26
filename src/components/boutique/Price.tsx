interface PriceProps {
  amount: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Price({
  amount,
  currency = "FCFA",
  className = "",
  size = "md",
}: PriceProps) {
  const formatted = amount.toLocaleString("fr-FR");

  const sizeClasses = {
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-xl font-extrabold",
    xl: "text-2xl md:text-3xl font-black",
  };

  return (
    <span className={`text-[#7D6AF8] ${sizeClasses[size]} ${className}`}>
      {formatted} {currency}
    </span>
  );
}
