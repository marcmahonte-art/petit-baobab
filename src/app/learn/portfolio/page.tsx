"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { Sidebar } from "@/app/learn/_components/sidebar"
import { Header } from "@/app/learn/_components/header"
import { useAuthStore } from "@/lib/auth-store"
import { useProfile } from "@/lib/profile-store"
import { useLearnSession } from "@/app/learn/_components/learn-session"
import { useRouter } from "next/navigation"
import { useGamification } from "@/features/gamification/hooks/use-gamification"
import { useProgression } from "@/features/progression/hooks/use-progression"
import { useWorldObjects } from "@/features/baobab-world/hooks"
import { useLearningPaths } from "@/features/learning-paths/hooks"
import { generateCertificatePdf } from "@/features/learning-paths/services/certificate-service"
import { CERTIFICATE_VERIFY_URL, MASCOT_IMAGES, getPathById } from "@/features/learning-paths/constants"
import type { LearningCertificate } from "@/features/learning-paths/types"
import type { PlanType } from "@/features/gamification/types"
import {
  PortfolioHero,
  SouvenirOfDay,
  EvolutionSection,
  BeforeAfter,
  AlbumCard,
  PortfolioTimeline,
  StatsSection,
  AchievementGallery,
  CertificateCard as PortfolioCertificateCard,
  FavoriteCard,
  GalleryView,
  MemoryModal,
  TimeCapsule,
} from "@/features/portfolio/components"
import { usePortfolio, usePortfolioGallery } from "@/features/portfolio/hooks"
import { portfolioEngine } from "@/features/portfolio/engine/portfolio-engine"
import { generateSouvenirBookPdf } from "@/features/portfolio/exports/pdf"
import { printPortfolio, shareToWhatsApp } from "@/features/portfolio/exports"
import type { PortfolioEvent } from "@/features/portfolio/types"
import type { AlbumSummary } from "@/features/portfolio/albums"

function normalizePlan(plan: string | undefined): PlanType {
  if (plan === "super_baobab") return "super-baobab"
  if (plan === "ecole_pro") return "ecole-pro"
  return plan === "decouverte" ? "decouverte" : "free"
}

export default function PortfolioPage() {
  const router = useRouter()
  const { role } = useLearnSession()
  const { account, isInitialized, checkSession } = useAuthStore()
  const profile = useProfile()
  const childId = profile?.id

  const gamification = useGamification(childId)
  const progression = useProgression(childId)
  const learning = useLearningPaths(childId, { childName: profile?.name })
  const { animals, props, decorations } = useWorldObjects()

  const portfolio = usePortfolio(childId, {
    xp: gamification.profile?.totalXpEarned ?? gamification.profile?.xp ?? 0,
    stars: gamification.profile?.starsBalance ?? 0,
    timePlayedSeconds: learning.learningSeconds,
  })

  const gallery = usePortfolioGallery(portfolio.events)

  const [selectedEvent, setSelectedEvent] = useState<PortfolioEvent | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumSummary | null>(null)
  const [showAllGallery, setShowAllGallery] = useState(false)

  const bookQrRef = useRef<HTMLCanvasElement>(null)
  const certQrRefs = useRef<Record<string, HTMLCanvasElement | null>>({})

  useEffect(() => {
    if (!isInitialized) checkSession()
  }, [isInitialized, checkSession])

  // Garde enfant : le Portfolio est réservé aux enfants connectés.
  // Un adulte sans session enfant (ni élève, ni profil actif) est renvoyé
  // vers son espace apprenant.
  useEffect(() => {
    if (isInitialized && role !== "student" && !childId) {
      router.replace("/learn/dashboard")
    }
  }, [isInitialized, role, childId, router])

  useEffect(() => {
    if (childId) {
      gamification.initialize(childId, { name: profile?.name, mascot: profile?.mascot, plan: normalizePlan(account?.plan) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, profile?.name, profile?.mascot, account?.plan])

  if (!isInitialized || !childId) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#3B2416] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#3B2416] font-bold text-sm">Ouverture du musée...</span>
        </div>
      </div>
    )
  }

  const badgesCount = gamification.badges?.length ?? 0
  const collectionsCount =
    animals.filter((a) => a.is_unlocked).length +
    props.filter((p) => p.is_unlocked).length +
    decorations.filter((d) => d.is_unlocked).length
  const certificates = learning.certificates as LearningCertificate[]
  const bookQrValue = `${CERTIFICATE_VERIFY_URL}/portfolio?child=${childId}&year=${new Date().getFullYear()}`
  const latestEvents = [...portfolio.events].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8)

  const handleExportBook = async () => {
    const qr = bookQrRef.current?.toDataURL("image/png") ?? null
    await generateSouvenirBookPdf(
      {
        childName: profile?.name ?? "Petit Explorateur",
        mascotUrl: profile?.mascot ? MASCOT_IMAGES[profile.mascot] ?? MASCOT_IMAGES.baobab : undefined,
        year: new Date().getFullYear(),
        accent: "#FF8A00",
        events: portfolio.events,
        stats: portfolio.stats,
        certificates: certificates.map((c) => ({ title: c.path_title, date: c.issued_at })),
        messages: portfolio.capsules.map((c) => ({
          message: c.message,
          author: c.author,
          years: c.unlock_after_years,
        })),
        timelineLabel: `Le portfolio de ${profile?.name ?? "mon enfant"}`,
      },
      qr,
    )
  }

  const handleDownloadCertificate = async (cert: LearningCertificate) => {
    const qr = certQrRefs.current[cert.token]?.toDataURL("image/png") ?? null
    const path = getPathById(cert.path_id)
    await generateCertificatePdf(
      {
        childName: profile?.name ?? "Petit Explorateur",
        mascot: cert.mascot,
        pathTitle: cert.path_title,
        pathTheme: path?.theme ?? "animals",
        issuedAt: cert.issued_at,
        token: cert.token,
      },
      qr,
      MASCOT_IMAGES[cert.mascot] ?? MASCOT_IMAGES.baobab,
    )
  }

  const handleShare = async () => {
    const latest = latestEvents[0] ?? null
    await shareToWhatsApp({
      title: `Le musée de ${profile?.name ?? "mon enfant"}`,
      subtitle: latest ? latest.title : undefined,
      image: latest?.image ?? null,
      event: latest,
    }, profile?.name)
  }

  const handleShareEvent = async (event: PortfolioEvent) => {
    await shareToWhatsApp(
      { title: event.title, subtitle: event.description, image: event.image, event },
      profile?.name,
    )
  }

  const handleSaveCapsule = (message: string, years: 1 | 3 | 5, author?: string) => {
    portfolio.saveTimeCapsule(message, years, author)
  }

  const handleOpenCapsule = (capsuleId: string) => {
    portfolio.markCapsuleOpened(capsuleId)
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block print:hidden">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <Header />

          <motion.div variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="visible" className="flex flex-col gap-8 print-area">
            <PortfolioHero
              childName={profile?.name}
              cover={portfolio.portfolio?.cover ?? null}
              stats={portfolio.stats}
              onExport={handleExportBook}
              onPrint={() => printPortfolio()}
              onShare={handleShare}
            />

            {portfolio.souvenir && (
              <section>
                <SouvenirOfDay souvenir={portfolio.souvenir} onOpen={setSelectedEvent} />
              </section>
            )}

            {portfolio.evolution.some((m) => m.achieved) && (
              <section>
                <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Mon évolution</h2>
                <EvolutionSection milestones={portfolio.evolution} onOpen={setSelectedEvent} />
              </section>
            )}

            <section>
              <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Avant / Après</h2>
              <BeforeAfter pairs={portfolio.beforeAfter} onOpen={setSelectedEvent} />
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#3B2416]">Dernières créations</h2>
                <button
                  type="button"
                  onClick={() => setShowAllGallery((v) => !v)}
                  className="cursor-pointer rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#7A6A5E] shadow-sm transition hover:text-[#3B2416]"
                >
                  {showAllGallery ? "Voir le musée" : "Galerie complète"}
                </button>
              </div>
              {showAllGallery ? (
                <GalleryView
                  gallery={gallery}
                  favoriteIds={portfolio.favoriteIds}
                  onSelectEvent={setSelectedEvent}
                  onToggleFavorite={(id) => portfolio.toggleFavorite("event", id)}
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {latestEvents.map((event) => (
                    <div key={event.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <button type="button" onClick={() => setSelectedEvent(event)} className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-[#F1E7DA] bg-white p-0 shadow-sm transition hover:shadow-md">
                        <div className="flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF6E8] to-[#FFE08A]">
                          {event.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={event.image} alt={event.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                          ) : (
                            <span className="text-4xl" aria-hidden="true">
                              {portfolioEngine.categoryIcon(portfolioEngine.categoryOfEvent(event))}
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="truncate text-xs font-extrabold text-[#3B2416]">{event.title}</p>
                          <p className="text-[10px] font-semibold text-[#B4A495]">{portfolioEngine.formatDate(event.created_at)}</p>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {portfolio.albums.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Albums automatiques</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {portfolio.albums.map((album) => (
                    <AlbumCard key={album.id} album={album} onOpen={setSelectedAlbum} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Timeline</h2>
              <div className="rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
                <PortfolioTimeline
                  buckets={portfolio.timeline}
                  favoriteIds={portfolio.favoriteIds}
                  onSelectEvent={setSelectedEvent}
                  onToggleFavorite={(id) => portfolio.toggleFavorite("event", id)}
                />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Statistiques</h2>
              <StatsSection stats={portfolio.stats} />
            </section>

            <section>
              <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Badges & Collections</h2>
              <AchievementGallery milestones={portfolio.evolution} badgesCount={badgesCount} collectionsCount={collectionsCount} />
            </section>

            <section>
              <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Certificats</h2>
              <PortfolioCertificateCard certificates={certificates} onDownload={(c) => { void handleDownloadCertificate(c as LearningCertificate) }} />
              <div className="hidden">
                {certificates.map((cert) => (
                  <QRCodeCanvas
                    key={cert.token}
                    ref={(node) => {
                      certQrRefs.current[cert.token] = node
                    }}
                    value={`${CERTIFICATE_VERIFY_URL}/${cert.token}`}
                    size={128}
                    level="M"
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Mes favoris</h2>
              <FavoriteCard
                events={portfolio.favoriteEvents}
                favoriteIds={portfolio.favoriteIds}
                onSelectEvent={setSelectedEvent}
                onToggleFavorite={(id) => portfolio.toggleFavorite("event", id)}
              />
            </section>

            <section>
              <h2 className="mb-3 text-lg font-extrabold text-[#3B2416]">Capsule temporelle</h2>
              <TimeCapsule
                capsules={portfolio.capsules}
                childName={profile?.name}
                onSave={handleSaveCapsule}
                onOpen={handleOpenCapsule}
              />
            </section>

            {/* QR du livre souvenir (invisible, pour l'export PDF) */}
            <div className="hidden">
              <QRCodeCanvas ref={bookQrRef} value={bookQrValue} size={128} level="M" />
            </div>
          </motion.div>
        </main>
      </div>

      {/* Modale d'un souvenir */}
      {selectedEvent && (
        <MemoryModal
          event={selectedEvent}
          isFavorite={portfolio.favoriteIds.has(`event:${selectedEvent.id}`)}
          onClose={() => setSelectedEvent(null)}
          onToggleFavorite={() => portfolio.toggleFavorite("event", selectedEvent.id)}
          onShare={() => handleShareEvent(selectedEvent)}
          onDownload={handleExportBook}
        />
      )}

      {/* Modale d'un album */}
      {selectedAlbum && (
        <AlbumModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onOpenEvent={setSelectedEvent} />
      )}
    </div>
  )
}

function AlbumModal({ album, onClose, onOpenEvent }: { album: AlbumSummary; onClose: () => void; onOpenEvent: (e: PortfolioEvent) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B2416]/60 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label={album.title}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#F1E7DA] p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              {album.icon}
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-[#3B2416]">{album.title}</h3>
              <p className="text-xs font-semibold text-[#7A6A5E]">
                Année {album.year} · {album.count} création{album.count > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#F5F0EB] text-[#3B2416] hover:bg-[#EAD9BF]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {album.events.length === 0 ? (
            <p className="text-center text-sm font-bold text-[#7A6A5E]">Cet album est vide.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {album.events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onOpenEvent(event)}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#F1E7DA] bg-white text-left shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-24 items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF6E8] to-[#FFE08A]">
                    {event.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.image} alt={event.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="text-3xl" aria-hidden="true">
                        {portfolioEngine.categoryIcon(portfolioEngine.categoryOfEvent(event))}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-extrabold text-[#3B2416]">{event.title}</p>
                    <p className="text-[10px] font-semibold text-[#B4A495]">{new Date(event.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
