import Image from "next/image"

export function HeroBanner() {
  return (
    <section className="h-[180px] xs:h-[200px] md:h-[250px] lg:h-[250px] rounded-[32px] bg-[#FFF5CC] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] relative select-none">
      {/* Left Section (Character & Greeting) */}
      <div className="relative h-full flex items-center px-4 xs:px-6 md:px-8">
        <div className="absolute bottom-0 left-2 xs:left-4 md:left-6 z-20">
          <Image
            src="/illustrations/awa.webp"
            alt="Awa"
            width={240}
            height={240}
            className="w-[120px] h-[120px] xs:w-[140px] h-[140px] md:w-[240px] md:h-[240px] object-contain object-bottom"
            priority
          />
        </div>

        <div className="relative z-10 pl-[110px] xs:pl-[130px] md:pl-[240px] lg:pl-[210px] xl:pl-[240px] flex flex-col justify-center h-full text-left max-w-[540px]">
          <h2 className="text-xl xs:text-2xl md:text-[32px] xl:text-[38px] font-extrabold leading-none text-[#3B2416] whitespace-nowrap">
            Bonjour Awa !
          </h2>
          <p className="text-xs xs:text-sm md:text-[20px] xl:text-[24px] font-bold text-[#3B2416] mt-1.5 xs:mt-2 leading-snug">
            Qu&apos;allons-nous créer aujourd&apos;hui ?
          </p>
        </div>
      </div>

      {/* Right Section (Landscape Decor) */}
      <div className="relative w-full h-full hidden lg:block overflow-hidden">
        <div className="absolute bottom-0 right-0 w-full h-[400px] flex items-end justify-end z-10 animate-float-slow">
          <Image
            src="/illustrations/village-case-girafe.webp"
            alt="Paysage"
            width={710}
            height={400}
            className="w-auto h-[400px] object-contain object-bottom"
            style={{ width: "auto", height: "400px" }}
            priority
          />
        </div>
      </div>
    </section>
  )
}
