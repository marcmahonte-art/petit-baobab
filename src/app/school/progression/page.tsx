import PlaceholderPage from '@/components/school/PlaceholderPage';
import { requireTeacherPage } from '@/lib/school-auth';

export const metadata = {
  title: 'Progression – École',
};

export default async function ProgressionPage() {
  // Garde serveur : le proxy ne vérifie que la présence du cookie adulte.
  await requireTeacherPage();

  return (
    <PlaceholderPage
      title="Progression"
      description="Cette page est en cours de construction. Vous pourrez bientôt suivre la progression de vos élèves ici."
    />
  );
}
