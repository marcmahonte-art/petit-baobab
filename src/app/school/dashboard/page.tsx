import DashboardClient from '@/app/school/dashboard/DashboardClient';

export const metadata = {
  title: 'Tableau de bord – École',
};

export default function DashboardPage() {
  return <DashboardClient />;
}

/* duplicated client code moved to DashboardClient.tsx */
