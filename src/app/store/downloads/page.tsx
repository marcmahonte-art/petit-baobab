import { StoreAuthGate } from "@/components/store/StoreAuthGate";
import { DownloadCard } from "@/components/store/StoreCards";
import { StoreShell } from "@/components/store/StoreShell";
import { getCurrentStoreUser } from "@/lib/store/auth";
import { getStoreDownloadsForUser } from "@/lib/store/customer-data";

export const dynamic = "force-dynamic";

export default async function StoreDownloadsPage() {
  const user = await getCurrentStoreUser();
  if (!user) return <StoreAuthGate />;
  const downloads = await getStoreDownloadsForUser(user);
  return (
    <StoreShell title="Mes téléchargements" subtitle="Tous tes PDF achetés avec liens sécurisés, quotas et dates d’expiration.">
      <div className="grid gap-4 xl:grid-cols-2">
        {downloads.map((download) => <DownloadCard key={download.id} download={download} />)}
      </div>
      {downloads.length === 0 && <p className="rounded-[24px] bg-white p-6 text-sm font-bold text-[#7A6A5E]">Aucun PDF disponible pour le moment.</p>}
    </StoreShell>
  );
}
