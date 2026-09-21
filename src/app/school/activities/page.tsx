import PlaceholderPage from '@/components/school/PlaceholderPage';
import { requireTeacherPage } from '@/lib/school-auth';

export const metadata = {
  title: 'Activités – École',
};

export default async function ActivitiesPage() {
  // Garde serveur : le proxy ne vérifie que la présence du cookie adulte.
  await requireTeacherPage();

  return (
    <PlaceholderPage
      title="Activités"
      description="Cette page est en cours de construction. Vous pourrez bientôt gérer les activités de vos élèves ici."
    />
  );
}
