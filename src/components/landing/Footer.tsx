import * as React from "react"
import Image from "next/image"

const productLinks = [
  { label: "Coloriages", href: "#features" },
  { label: "Livres", href: "#" },
  { label: "Jeux éducatifs", href: "#" },
  { label: "Histoires", href: "#" },
]

const companyLinks = [
  { label: "À propos", href: "#" },
  { label: "Notre mission", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact", href: "#" },
]

const resourceLinks = [
  { label: "Aide", href: "#" },
  { label: "Guide parents", href: "#" },
  { label: "Confidentialité", href: "#" },
  { label: "Conditions", href: "#" },
]

interface SocialLink {
  icon: () => React.ReactNode
  href: string
  label: string
}

const socialLinks: SocialLink[] = [
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
    href: "#",
    label: "Facebook",
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    href: "#",
    label: "Instagram",
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.5c-.2.9-1.02 2.68-1.14 2.98-.12.3-.2.46-.2.46s-.1-.16-.2-.46c-.12-.3-.94-2.08-1.14-2.98-.12-.54-.44-.7-.74-.7H9.38v7.68c0 .7.56 1.26 1.26 1.26.7 0 1.26-.56 1.26-1.26v-3.86h.02l.84 2.5c.1.3.36.5.66.5s.56-.2.66-.5l.84-2.5h.02v3.86c0 .7.56 1.26 1.26 1.26.7 0 1.26-.56 1.26-1.26V9.2h-1.28c-.3 0-.62.16-.74.7z" />
      </svg>
    ),
    href: "#",
    label: "TikTok",
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    href: "#",
    label: "Youtube",
  },
]

export default function Footer() {
  return (
    <footer className="bg-bg pt-16 pb-8 border-t border-border relative overflow-hidden">
      {/* Decorative bush */}
      <div className="absolute bottom-0 right-0 w-[200px] h-[200px] z-0 opacity-90">
        <Image
          src="/illustrations/Baobab.webp"
          alt="Baobab decoration"
          width={200}
          height={200}
          className="object-contain w-full h-full"
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="shrink-0">
                <rect x="16" y="26" width="8" height="10" rx="2" fill="#8B5A2B" />
                <ellipse cx="20" cy="14" rx="12" ry="10" fill="#20C997" />
                <circle cx="20" cy="13" r="4" fill="#FFF9F2" />
              </svg>
              <div className="flex flex-col leading-tight">
                <div className="flex gap-1">
                  <span className="text-[18px] font-bold text-[#1A1A2E]">Petit</span>
                  <span className="text-[18px] font-extrabold text-[#7D6AF8]">Baobab</span>
                </div>
                <span className="text-[11px] font-medium text-[#6B6B7B]">
                  Apprendre, créer, grandir !
                </span>
              </div>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="font-bold text-[15px] text-[#1A1A2E] mb-4">Produit</h4>
            <div className="flex flex-col gap-2">
              {productLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[14px] text-[#6B6B7B] hover:text-[#7D6AF8] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="font-bold text-[15px] text-[#1A1A2E] mb-4">Entreprise</h4>
            <div className="flex flex-col gap-2">
              {companyLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[14px] text-[#6B6B7B] hover:text-[#7D6AF8] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="font-bold text-[15px] text-[#1A1A2E] mb-4">Ressources</h4>
            <div className="flex flex-col gap-2">
              {resourceLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[14px] text-[#6B6B7B] hover:text-[#7D6AF8] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="mt-12">
          <p className="font-bold text-[15px] text-[#1A1A2E] mb-3">Suivez-nous</p>
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center text-[#6B6B7B] hover:bg-[#7D6AF8] hover:text-white transition-all duration-200"
                aria-label={social.label}
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-12 pt-6 text-center text-[13px] text-[#6B6B7B]">
          &copy; {new Date().getFullYear()} Petit Baobab. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
