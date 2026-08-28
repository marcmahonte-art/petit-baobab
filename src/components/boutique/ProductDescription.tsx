import { Product, Review } from "@/lib/mock/types";
import { Rating } from "./Rating";
import { BookOpen, Globe, Users, FileText, CheckCircle } from "lucide-react";

interface ProductDescriptionProps {
  product: Product;
  reviews: Review[];
}

export function ProductDescription({ product, reviews }: ProductDescriptionProps) {
  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-[#E5E0D5]">
      {/* Detail Specifications Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-[20px] bg-white border border-[#E5E0D5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7D6AF8]/10 text-[#7D6AF8] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#3B2416]/60 uppercase">Âge</p>
            <p className="text-sm font-bold text-[#3B2416]">{product.age}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#3B2416]/60 uppercase">Langue</p>
            <p className="text-sm font-bold text-[#3B2416]">{product.language}</p>
          </div>
        </div>

        {product.pages && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD95C]/20 text-[#3B2416] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#3B2416]/60 uppercase">Pages</p>
              <p className="text-sm font-bold text-[#3B2416]">{product.pages} pages</p>
            </div>
          </div>
        )}

        {product.fileSize && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF5E83]/10 text-[#FF5E83] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#3B2416]/60 uppercase">Format</p>
              <p className="text-sm font-bold text-[#3B2416]">PDF ({product.fileSize})</p>
            </div>
          </div>
        )}
      </div>

      {/* Description Text */}
      <div className="bg-white p-6 md:p-8 rounded-[20px] border border-[#E5E0D5] space-y-4">
        <h3 className="text-xl font-bold text-[#3B2416]">Description du produit</h3>
        <p className="text-sm md:text-base text-[#3B2416]/80 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Kit contents */}
      {product.kitContents && product.kitContents.length > 0 && (
        <div className="bg-white p-6 md:p-8 rounded-[20px] border border-[#E5E0D5] space-y-4">
          <h3 className="text-xl font-bold text-[#3B2416]">Ce que contient le kit</h3>
          <ul className="space-y-2">
            {product.kitContents.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm md:text-base text-[#3B2416]/80">
                <CheckCircle className="w-5 h-5 text-[#1D9E75] shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white p-6 md:p-8 rounded-[20px] border border-[#E5E0D5] space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#3B2416]">
            Avis des parents ({reviews.length})
          </h3>
          <Rating rating={product.rating} reviewCount={product.reviewCount} size={18} />
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-[#3B2416]/60">Soyez le premier à donner votre avis !</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-[#FFF9F2] border border-[#E5E0D5]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#3B2416]">{rev.author}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1D9E75] bg-[#1D9E75]/10 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Achat vérifié
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#3B2416]/50">{rev.date}</span>
                </div>
                <Rating rating={rev.rating} showText={false} size={14} />
                <p className="text-xs md:text-sm text-[#3B2416]/80">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
