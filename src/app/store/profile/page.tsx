import { StoreAuthGate } from "@/components/store/StoreAuthGate";
import { StoreShell } from "@/components/store/StoreShell";
import { ensureStoreProfile, getCurrentStoreUser } from "@/lib/store/auth";

export const dynamic = "force-dynamic";

export default async function StoreProfilePage() {
  const user = await getCurrentStoreUser();
  if (!user) return <StoreAuthGate />;
  const profile = await ensureStoreProfile(user);

  return (
    <StoreShell title="Profil" subtitle="Gère tes informations client utilisées pour les commandes, emails et messages WhatsApp.">
      <form action="/api/store/profile" method="post" className="grid gap-4 rounded-[24px] border border-[#F0E7DA] bg-white p-5 shadow-sm md:grid-cols-2">
        <Field name="firstName" label="Nom" defaultValue={profile?.first_name || ""} />
        <Field name="lastName" label="Prénom / famille" defaultValue={profile?.last_name || ""} />
        <Field name="phone" label="Téléphone" defaultValue={profile?.phone || ""} />
        <Field name="country" label="Pays" defaultValue={profile?.country || ""} />
        <Field name="city" label="Ville" defaultValue={profile?.city || ""} />
        <label className="text-sm font-black">
          Langue
          <select name="language" defaultValue={profile?.language || "fr"} className="mt-2 h-11 w-full rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-4 font-bold outline-none">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
        <Toggle name="newsletterEnabled" label="Newsletter" checked={profile?.newsletter_enabled} />
        <Toggle name="whatsappEnabled" label="WhatsApp" checked={profile?.whatsapp_enabled} />
        <button className="h-12 rounded-full bg-[#7D6AF8] px-5 text-sm font-black text-white md:col-span-2">Enregistrer</button>
      </form>
    </StoreShell>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="text-sm font-black">
      {label}
      <input name={name} defaultValue={defaultValue} className="mt-2 h-11 w-full rounded-2xl border border-[#F0E7DA] bg-[#FFF9F2] px-4 font-bold outline-none focus:ring-2 focus:ring-[#7D6AF8]" />
    </label>
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
