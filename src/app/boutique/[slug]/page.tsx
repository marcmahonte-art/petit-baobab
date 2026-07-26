"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { BoutiqueHeader } from "@/components/boutique/BoutiqueHeader";
import { Footer } from "@/components/boutique/Footer";
import { MiniCart } from "@/components/boutique/MiniCart";
import { Breadcrumb } from "@/components/boutique/Breadcrumb";
import { ProductGallery } from "@/components/boutique/ProductGallery";
import { Price } from "@/components/boutique/Price";
import { Rating } from "@/components/boutique/Rating";
import { ProductDescription } from "@/components/boutique/ProductDescription";
import { RelatedProducts } from "@/components/boutique/RelatedProducts";
import { PRODUCTS } from "@/lib/mock/products";
import { REVIEWS } from "@/lib/mock/reviews";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingCart, Download, Check, ShieldCheck, Heart } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const product = PRODUCTS.find((p) => p.slug === slug);
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    notFound();
  }

  const reviews = REVIEWS.filter((r) => r.productId === product.id);
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#3B2416] font-sans antialiased">
      <BoutiqueHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Boutique", href: "/boutique" },
            { label: product.category, href: `/boutique?category=${product.category}` },
            { label: product.title },
          ]}
        />

        {/* Product Hero Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mt-6 items-start">
          {/* Gallery Left */}
          <ProductGallery images={product.images} title={product.title} />

          {/* Details Right */}
          <div className="space-y-6 bg-white p-6 md:p-8 rounded-[24px] border border-[#E5E0D5] shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] text-xs font-bold uppercase tracking-wider">
                  {product.category.replace("-", " ")}
                </span>
                {product.downloadable && (
                  <span className="px-3 py-1 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-bold flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> PDF Téléchargeable
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#3B2416] leading-tight">
                {product.title}
              </h1>

              <div className="mt-3 flex items-center gap-4">
                <Rating rating={product.rating} reviewCount={product.reviewCount} size={18} />
                <span className="text-xs font-bold text-[#1D9E75]">En stock ({product.stock})</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-4 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#3B2416]/60 uppercase">Prix TTC</p>
                <Price amount={product.price} currency={product.currency} size="xl" />
              </div>
              {product.downloadable && (
                <span className="text-xs font-bold text-[#7D6AF8]">
                  Accès instantané par email
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm md:text-base text-[#3B2416]/80 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quantity & Add to Cart */}
            <div className="pt-4 border-t border-[#E5E0D5] space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E5E0D5] rounded-full bg-[#FFF9F2] p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-base shadow-sm hover:bg-[#7D6AF8] hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-extrabold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-base shadow-sm hover:bg-[#7D6AF8] hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 px-6 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    added
                      ? "bg-[#1D9E75] text-white"
                      : "bg-[#7D6AF8] hover:bg-[#6552E8] text-white shadow-[#7D6AF8]/20 hover:scale-[1.01]"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Ajouter au panier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick reassurance */}
            <div className="pt-2 flex items-center justify-between text-xs text-[#3B2416]/70">
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#1D9E75]" /> Paiement 100% Sécurisé
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Heart className="w-4 h-4 text-[#FF5E83]" /> Satisfait ou remboursé
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Info & Reviews */}
        <ProductDescription product={product} reviews={reviews} />

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </main>

      <Footer />
      <MiniCart />
    </div>
  );
}
