import Image from "next/image"

export function HeroBanner() {
  return (
    <section className="h-[420px] lg:h-[250px] rounded-[32px] bg-[#FFF5CC] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] relative select-none">
      {/* Left Section (Character & Greeting) */}
      <div className="relative h-full flex items-center px-8">
        <div className="absolute bottom-0 left-6 z-20">
          <Image
            src="/illustrations/awa.webp"
            alt="Awa"
            width={240}
            height={240}
            className="w-[240px] h-[240px] object-contain object-bottom"
            priority
          />
        </div>

        <div className="relative z-10 pl-[210px] xl:pl-[240px] flex flex-col justify-center h-full text-left max-w-[540px]">
          <h2 className="text-[32px] xl:text-[38px] font-extrabold leading-none text-[#3B2416] whitespace-nowrap">
            Bonjour Awa !
          </h2>
          <p className="text-[20px] xl:text-[24px] font-bold text-[#3B2416] mt-2 leading-snug">
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
