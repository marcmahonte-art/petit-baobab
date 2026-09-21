import PlaceholderPage from '@/components/school/PlaceholderPage';
import { requireTeacherPage } from '@/lib/school-auth';

export const metadata = {
  title: 'Étoiles – École',
};

export default async function EtoilesPage() {
  // Garde serveur : le proxy ne vérifie que la présence du cookie adulte.
  await requireTeacherPage();

  return (
    <PlaceholderPage
      title="Étoiles"
      description="Cette page est en cours de construction. Vous pourrez bientôt consulter et gérer les étoiles de vos élèves ici."
    />
  );
}
