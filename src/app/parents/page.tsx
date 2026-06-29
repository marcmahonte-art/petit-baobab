import { Sidebar } from "@/components/sidebar"
import { ParentsPage } from "@/components/parents-page"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import Image from "next/image"

export default function ParentsSpace() {
  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <ParentsPage />
        </main>
      </div>

      <MobileBottomNav />

      {/* Decorative Grassy Footer Background */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 hidden lg:block select-none pointer-events-none">
        <Image
          src="/illustrations/footer_bas.webp"
          alt="Grass Footer"
          width={1920}
          height={346}
          className="w-full h-auto block"
          priority
        />
      </div>
    </div>
  )
}
