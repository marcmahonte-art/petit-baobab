import { StoreAuthGate } from "@/components/store/StoreAuthGate";
import { StoreShell } from "@/components/store/StoreShell";
import { ensureStoreProfile, getCurrentStoreUser } from "@/lib/store/auth";

export const dynamic = "force-dynamic";

export default async function StoreSettingsPage() {
  const user = await getCurrentStoreUser();
  if (!user) return <StoreAuthGate />;
  const profile = await ensureStoreProfile(user);
  return (
    <StoreShell title="Paramètres" subtitle="Notifications, confidentialité, téléchargements et gestion du compte.">
      <form action="/api/store/settings" method="post" className="space-y-4 rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm">
        <Toggle name="emailNotifications" label="Notifications email" checked={profile?.email_notifications} />
        <Toggle name="whatsappNotifications" label="Notifications WhatsApp" checked={profile?.whatsapp_notifications} />
        <Toggle name="downloadNotifications" label="Alertes téléchargements et expiration" checked={profile?.download_notifications} />
        <Toggle name="privacyAnalytics" label="Mesure d’usage confidentielle pour améliorer la boutique" checked={profile?.privacy_analytics} />
        <button className="h-12 w-full rounded-full bg-[#7D6AF8] px-5 text-sm font-black text-white">Enregistrer les paramètres</button>
      </form>
      <section className="mt-6 rounded-[24px] border border-[#F9CACA] bg-white p-5">
        <h2 className="text-lg font-black text-[#B91C1C]">Suppression compte</h2>
        <p className="mt-2 text-sm font-semibold text-[#7A6A5E]">
          Pour protéger les factures et obligations comptables, la suppression passe par le support.
        </p>
        <a href="mailto:support@petitbaobab.com?subject=Suppression%20compte%20boutique" className="mt-4 inline-block rounded-full bg-[#FEE2E2] px-4 py-2 text-sm font-black text-[#B91C1C]">
          Demander la suppression
        </a>
      </section>
    </StoreShell>
  );
}

function Toggle({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-2xl bg-[#FFF9F2] p-4 text-sm font-black">
      {label}
      <input type="checkbox" name={name} defaultChecked={checked} className="h-5 w-5 accent-[#7D6AF8]" />
    </label>
  );
}
