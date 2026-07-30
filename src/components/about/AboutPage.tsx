"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Gamepad2,
  GraduationCap,
  Heart,
  Leaf,
  Map,
  Palette,
  Pencil,
  School,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  UsersRound,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.24, ease: "easeOut" } },
};

type IconCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
};

type UniverseCard = IconCard & {
  image: string;
  alt: string;
};

const missionCards: IconCard[] = [
  {
    title: "Creer",
    description: "Developper la creativite grace au dessin et aux activites.",
    icon: Palette,
    color: "text-[#7D6AF8]",
    iconBg: "bg-[#7D6AF8]/18",
  },
  {
    title: "Apprendre",
    description: "Decouvrir les lettres, les chiffres et le monde en s'amusant.",
    icon: BookOpen,
    color: "text-[#1D9E75]",
    iconBg: "bg-[#1D9E75]/16",
  },
  {
    title: "Grandir",
    description: "Valoriser les cultures africaines et encourager l'autonomie.",
    icon: Sprout,
    color: "text-[#FF8A00]",
    iconBg: "bg-[#FFD95C]/35",
  },
];

const stats = [
  {
    value: "+1000",
    label: "dessins generes",
    detail: "chaque jour",
    icon: WandSparkles,
    color: "text-[#7D6AF8]",
    bg: "bg-[#7D6AF8]",
  },
  {
    value: "100%",
    label: "adapte",
    detail: "aux enfants",
    icon: ShieldCheck,
    color: "text-[#1D9E75]",
    bg: "bg-[#1D9E75]",
  },
  {
    value: "Mobile",
    label: "et tablette",
    detail: "partout, a tout moment",
    icon: Smartphone,
    color: "text-[#FF8A00]",
    bg: "bg-[#FF8A00]",
  },
  {
    value: "Afrique",
    label: "contenus inspires",
    detail: "pour nos enfants",
    icon: Map,
    color: "text-[#7D6AF8]",
    bg: "bg-[#7D6AF8]",
  },
];

const universeCards: UniverseCard[] = [
  {
    title: "Coloriage",
    description: "Creer des coloriages personnalises grace a l'IA.",
    icon: Palette,
    image: "/illustrations/coloring-baobab.png",
    alt: "Coloriage de baobab",
    color: "text-[#7D6AF8]",
    iconBg: "bg-[#7D6AF8]/12",
  },
  {
    title: "Livres",
    description: "Creer des livres uniques a imprimer ou l'enfant est le heros.",
    icon: BookOpen,
    image: "/illustrations/Collection-livres.webp",
    alt: "Collection de livres Petit Baobab",
    color: "text-[#1D9E75]",
    iconBg: "bg-[#1D9E75]/12",
  },
  {
    title: "Histoires",
    description: "Des histoires educatives adaptees a chaque enfant.",
    icon: Pencil,
    image: "/illustrations/reading-girl.webp",
    alt: "Enfant lisant une histoire",
    color: "text-[#FF8A00]",
    iconBg: "bg-[#FF8A00]/14",
  },
  {
    title: "Jeux",
    description: "Des jeux educatifs pour apprendre en jouant.",
    icon: Gamepad2,
    image: "/illustrations/puzzle.webp",
    alt: "Pieces de puzzle colorees",
    color: "text-[#1194FF]",
    iconBg: "bg-[#1194FF]/12",
  },
];

const values: IconCard[] = [
  {
    title: "Bienveillance",
    description: "Creer un environnement positif, securise et adapte aux enfants.",
    icon: Heart,
    color: "text-[#FF5E83]",
    iconBg: "bg-[#FF5E83]/15",
  },
  {
    title: "Education",
    description: "Apprendre autrement grace au jeu, au dessin et aux histoires.",
    icon: GraduationCap,
    color: "text-[#1D9E75]",
    iconBg: "bg-[#1D9E75]/15",
  },
  {
    title: "Creativite",
    description: "Encourager chaque enfant a imaginer, creer et s'exprimer librement.",
    icon: Pencil,
    color: "text-[#7D6AF8]",
    iconBg: "bg-[#7D6AF8]/15",
  },
  {
    title: "Culture africaine",
    description: "Valoriser nos cultures, nos histoires et nos heros au quotidien.",
    icon: Map,
    color: "text-[#FF8A00]",
    iconBg: "bg-[#FFD95C]/35",
  },
];

const impactItems = [
  { value: "1000+", label: "coloriages crees", icon: Sparkles },
  { value: "300+", label: "livres prets a imprimer", icon: BookOpen },
  { value: "Ecoles", label: "partenaires accompagnees", icon: School },
  { value: "Chaque jour", label: "des enfants apprennent", icon: UsersRound },
];

function MotionSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
      <div className="mb-2 flex justify-center">
        <Leaf className="h-5 w-5 fill-[#8BC34A] text-[#8BC34A]" aria-hidden />
      </div>
      <h2 className="text-3xl font-bold leading-tight text-[#3B2416] md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-3 text-base font-medium leading-8 text-[#5E5E5E] md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

function FeatureCard({ card }: { card: IconCard }) {
  const Icon = card.icon;

  return (
    <motion.article
      variants={scaleIn}
      whileHover={{ y: -4, scale: 1.02 }}
      className="rounded-[20px] border border-[#F1E7DA] bg-white p-6 shadow-[0_10px_30px_rgba(59,36,22,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(59,36,22,0.12)]"
    >
      <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${card.iconBg}`}>
        <Icon className={`h-8 w-8 ${card.color}`} aria-hidden />
      </div>
      <h3 className={`text-2xl font-bold ${card.color}`}>{card.title}</h3>
      <p className="mt-2 text-[15px] font-medium leading-7 text-[#3B2416]/78">{card.description}</p>
    </motion.article>
  );
}

function StatCard({ item }: { item: (typeof stats)[number] }) {
  const Icon = item.icon;

  return (
    <motion.article
      variants={scaleIn}
      whileHover={{ y: -4, scale: 1.02 }}
      className="flex items-center gap-4 rounded-[20px] bg-white p-5 shadow-[0_8px_24px_rgba(59,36,22,0.05)]"
    >
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] ${item.bg} text-white shadow-lg shadow-black/10`}>
        <Icon className="h-8 w-8" aria-hidden />
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none ${item.color}`}>{item.value}</p>
        <p className="mt-2 text-sm font-bold leading-5 text-[#3B2416]">{item.label}</p>
        <p className="text-sm font-medium leading-5 text-[#5E5E5E]">{item.detail}</p>
      </div>
    </motion.article>
  );
}

function UniverseCardItem({ card }: { card: UniverseCard }) {
  const Icon = card.icon;

  return (
    <motion.article
      variants={scaleIn}
      whileHover={{ y: -4, scale: 1.02 }}
      className="overflow-hidden rounded-[20px] border border-[#F1E7DA] bg-white shadow-[0_10px_30px_rgba(59,36,22,0.06)] transition-shadow hover:shadow-[0_18px_42px_rgba(59,36,22,0.13)]"
    >
      <div className="relative h-44 bg-[#FBF3E6]">
        <Image src={card.image} alt={card.alt} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-contain p-5" />
      </div>
      <div className="p-6">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${card.iconBg}`}>
          <Icon className={`h-5 w-5 ${card.color}`} aria-hidden />
        </div>
        <h3 className={`text-xl font-bold ${card.color}`}>{card.title}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-[#3B2416]/78">{card.description}</p>
      </div>
    </motion.article>
  );
}

function ValueCard({ card }: { card: IconCard }) {
  const Icon = card.icon;

  return (
    <motion.article variants={scaleIn} className="flex items-start gap-4">
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}>
        <Icon className={`h-8 w-8 ${card.color}`} aria-hidden />
      </div>
      <div>
        <h3 className={`text-lg font-bold ${card.color}`}>{card.title}</h3>
        <p className="mt-1 text-sm font-medium leading-6 text-[#3B2416]/78">{card.description}</p>
      </div>
    </motion.article>
  );
}

function AboutHero() {
  return (
      <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 lg:py-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-[28px] sm:text-[34px] lg:text-display-lg font-extrabold leading-tight">
            <span className="text-[#1A1A2E]">Une nouvelle facon</span>
            <br />
            <span className="text-[#1A1A2E]">d&apos;apprendre en </span>
            <span className="text-[#20C997]">Afrique.</span>
          </h1>
          <p className="text-sm md:text-body-lg text-[#6B6B7B] max-w-[480px] mt-4 md:mt-6">
            Petit Baobab aide les enfants a apprendre en creant. Coloriages,
            histoires, livres personnalises et jeux educatifs reunis dans une
            seule plateforme pensee pour les familles et les ecoles africaines.
          </p>
          <div className="flex gap-3 md:gap-4 mt-5 md:mt-8 flex-wrap">
            <Button asChild className="h-12 md:h-14 px-6 md:px-8 bg-[#7D6AF8] hover:bg-[#6552E8] text-white font-bold text-sm md:text-[16px] rounded-full shadow-hover hover:scale-[1.02] md:hover:scale-[1.03] transition-all duration-180 md:duration-200 cursor-pointer">
              <Link href="/signup">Decouvrir la plateforme<ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" className="h-12 md:h-14 px-6 md:px-8 bg-white text-[#1A1A2E] font-bold text-sm md:text-[16px] rounded-full border border-[#E5E0D5] hover:bg-[#FFF9F2] transition-colors cursor-pointer">
              <Link href="/boutique">Voir la boutique<ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" /></Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative h-[320px] md:h-[480px] lg:h-[560px]"
        >
          <Image
            src="/illustrations/about-hero.webp"
            alt="Enfant africain souriant dans l'univers Petit Baobab"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <MotionSection className="mx-auto max-w-[1280px] px-6 py-8 md:px-12 lg:px-20">
      <div className="rounded-[28px] bg-[#FFFDF8] px-5 py-10 shadow-[0_18px_50px_rgba(59,36,22,0.07)] md:px-10">
        <SectionTitle title="Notre mission" subtitle="Chaque enfant merite une experience d&apos;apprentissage qui lui ressemble." />
        <motion.div className="grid grid-cols-1 gap-5 md:grid-cols-3" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
          {missionCards.map((card) => <FeatureCard key={card.title} card={card} />)}
        </motion.div>
      </div>
    </MotionSection>
  );
}

function StatsSection() {
  return (
    <MotionSection className="mx-auto max-w-[1280px] px-6 py-10 md:px-12 lg:px-20">
      <SectionTitle title="Pourquoi Petit Baobab ?" />
      <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
        {stats.map((item) => <StatCard key={item.value} item={item} />)}
      </motion.div>
    </MotionSection>
  );
}

function UniverseSection() {
  return (
    <MotionSection className="mx-auto max-w-[1280px] px-6 py-10 md:px-12 lg:px-20">
      <SectionTitle title="Notre univers" />
      <motion.div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        {universeCards.map((card) => <UniverseCardItem key={card.title} card={card} />)}
      </motion.div>
    </MotionSection>
  );
}

function ValuesSection() {
  return (
    <MotionSection className="mx-auto max-w-[1280px] px-6 py-10 md:px-12 lg:px-20">
      <SectionTitle title="Nos valeurs" />
      <motion.div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
        {values.map((card) => <ValueCard key={card.title} card={card} />)}
      </motion.div>
    </MotionSection>
  );
}

function ImpactSection() {
  return (
    <MotionSection className="mx-auto max-w-[1280px] px-6 py-10 md:px-12 lg:px-20">
      <div className="rounded-[28px] border border-[#F1E7DA] bg-white px-5 py-10 shadow-[0_16px_45px_rgba(59,36,22,0.06)] md:px-10">
        <SectionTitle title="Notre impact" subtitle="Des reperes simples, faciles a faire evoluer au rythme de la plateforme." />
        <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
          {impactItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article key={item.label} variants={scaleIn} className="rounded-[18px] bg-[#FFF9F2] p-6">
                <Icon className="h-7 w-7 text-[#7D6AF8]" aria-hidden />
                <p className="mt-5 text-3xl font-bold text-[#3B2416]">{item.value}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#5E5E5E]">{item.label}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </MotionSection>
  );
}

function CTASection() {
  return (
    <MotionSection className="mx-auto max-w-[1280px] px-6 pb-16 pt-10 md:px-12 md:pb-20 lg:px-20">
      <div className="relative overflow-hidden rounded-[28px] bg-[#5C35BA] px-6 py-10 text-white shadow-[0_24px_70px_rgba(92,53,186,0.25)] md:px-10 lg:px-14">
        <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">Rejoignez l&apos;aventure Petit Baobab</h2>
            <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-white/88 md:text-lg">
              Des milliers de coloriages, d&apos;histoires personnalisees et d&apos;activites educatives pour accompagner chaque enfant dans son apprentissage.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-[8px] bg-[#FFD95C] px-7 text-base font-bold text-[#3B2416] hover:bg-[#F7C93A] focus-visible:ring-[#FFD95C] sm:h-14">
                <Link href="/signup">Creer un compte<ArrowRight className="ml-2 h-5 w-5" aria-hidden /></Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-[8px] border-white/50 bg-transparent px-7 text-base font-bold text-white hover:bg-white/10 hover:text-white focus-visible:ring-white sm:h-14">
                <Link href="/tarification">Decouvrir les tarifs</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto h-64 w-full max-w-[360px] lg:h-72">
            <Image src="/illustrations/mascots/petit-baobab-guide-magique.png" alt="Guide magique Petit Baobab" fill sizes="(max-width: 1024px) 80vw, 360px" className="object-contain drop-shadow-2xl" />
          </div>
        </div>
        <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[#FFD95C]/20 blur-2xl" />
        <div className="absolute bottom-8 left-1/2 h-32 w-32 rounded-full bg-[#1D9E75]/20 blur-2xl" />
      </div>
    </MotionSection>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFF9F2] font-sans text-[#3B2416] antialiased">
      <Header />
      <main>
        <AboutHero />
        <MissionSection />
        <StatsSection />
        <UniverseSection />
        <ValuesSection />
        <ImpactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
