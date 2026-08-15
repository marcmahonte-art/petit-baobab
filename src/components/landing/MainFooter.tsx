import * as React from "react"

export default function MainFooter() {
  return (
    <footer className="bg-[#fef5e0] pt-20 pb-8 border-t border-gray-100 relative overflow-hidden">
      {/* Absolutely Positioned Baobab Landscape on the right */}
      <img
        alt="Paysage Baobab"
          className="absolute bottom-0 right-0 h-[132px] md:h-[158px] w-auto object-contain pointer-events-none select-none z-0"
        src="/illustrations/Baobab.webp"
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Column 1: Logo */}
          <div className="col-span-2 md:col-span-2 flex flex-col justify-start">
            <img
              alt="Logo Petit Baobab"
              className="h-[200px] w-auto object-contain self-start mb-4"
              src="/illustrations/logo-petit-baobab.svg"
            />
          </div>

          {/* Column 2: Produit */}
          <div className="col-span-1">
            <h4 className="font-bold text-sm text-[#1C1C3A] mb-6">Produit</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a className="hover:text-[#6D4CFF]" href="#">Coloriages</a></li>
              <li><a className="hover:text-[#6D4CFF]" href="#">Livres</a></li>
              <li><a className="hover:text-[#6D4CFF]" href="#">Jeux éducatifs</a></li>
              <li><a className="hover:text-[#6D4CFF]" href="#">Histoires</a></li>
            </ul>
          </div>

          {/* Column 3: Entreprise */}
          <div className="col-span-1">
            <h4 className="font-bold text-sm text-[#1C1C3A] mb-6">Entreprise</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a className="hover:text-[#6D4CFF]" href="/about">À propos</a></li>
              <li><a className="hover:text-[#6D4CFF]" href="#">Notre mission</a></li>
              <li><a className="hover:text-[#6D4CFF]" href="#">Blog</a></li>
              <li><a className="hover:text-[#6D4CFF]" href="#">Contact</a></li>
            </ul>
          </div>

          {/* Column 4: Ressources */}
          <div className="col-span-1">
            <h4 className="font-bold text-sm text-[#1C1C3A] mb-6">Ressources</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a className="hover:text-[#6D4CFF]" href="#">Aide</a></li>
              <li><a className="hover:text-[#6D4CFF]" href="#">Guide parents</a></li>
              <li><a className="hover:text-[#6D4CFF]" href="/confidentialite">Confidentialité</a></li>
              <li><a className="hover:text-[#6D4CFF]" href="#">Conditions</a></li>
            </ul>
          </div>

          {/* Column 5: Suivez-nous */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold text-sm text-[#1C1C3A] mb-6 text-center md:text-left">Suivez-nous</h4>
            <div className="flex gap-3 justify-center md:justify-start">
              {/* Facebook */}
              <a className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-blue-600 hover:scale-110 transition-transform border border-gray-100 shadow-sm" href="https://web.facebook.com/profile.php?id=61591574387656" target="_blank" rel="noopener noreferrer">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Instagram */}
              <a className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-pink-600 hover:scale-110 transition-transform border border-gray-100 shadow-sm" href="#">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* TikTok */}
              <a className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform border border-gray-100 shadow-sm" href="#">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.08-1.39-.42-.31-.8-.67-1.14-1.07-.05 2.12-.02 4.24-.03 6.36 0 1.62-.39 3.29-1.33 4.61-.95 1.34-2.44 2.29-4.09 2.51-1.62.24-3.37-.09-4.74-.99C5.03 18.96 4 17.15 4 15.2c0-1.95 1.03-3.76 2.76-4.81.99-.61 2.15-.92 3.3-.92.13 0 .26.01.39.02v4.08c-.76-.11-1.57.06-2.21.5-.68.46-1.07 1.25-1.07 2.07 0 .82.39 1.61 1.07 2.07.72.49 1.65.61 2.47.33.82-.28 1.48-.94 1.77-1.76.24-.68.25-1.42.25-2.14.01-4.87.01-9.74.02-14.62z" />
                </svg>
              </a>
              {/* YouTube */}
              <a className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-red-600 hover:scale-110 transition-transform border border-gray-100 shadow-sm" href="#">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="py-8 border-t border-gray-200/30 text-center relative z-10">
          <p className="text-xs text-gray-500 font-medium">© 2025 Petit Baobab. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
