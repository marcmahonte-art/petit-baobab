export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <aside className="w-[280px] relative flex flex-col h-[calc(100vh-48px)] justify-between shrink-0 select-none pb-2">
              <div className="animate-pulse">
                <div className="h-[110px] flex items-center px-1">
                  <div className="w-[180px] h-[60px] bg-[#EFE7DB] rounded-lg" />
                </div>
                <nav className="flex flex-col gap-1.5 mt-2">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-[46px] bg-[#EFE7DB] rounded-[18px] mx-4" />
                  ))}
                </nav>
              </div>
              <div className="w-full h-[200px] rounded-[28px] bg-[#EFE7DB] animate-pulse mt-4" />
            </aside>
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <div className="animate-pulse space-y-6">
            <div className="h-[72px] bg-[#EFE7DB] rounded-full" />
            <div className="h-[250px] bg-[#EFE7DB] rounded-[32px]" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-[18px]">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[180px] bg-[#EFE7DB] rounded-[24px]" />
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_392px] gap-6">
              <div className="h-[355px] bg-[#EFE7DB] rounded-[28px]" />
              <div className="space-y-4">
                <div className="h-[250px] bg-[#EFE7DB] rounded-[28px]" />
                <div className="h-[200px] bg-[#EFE7DB] rounded-[28px]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
