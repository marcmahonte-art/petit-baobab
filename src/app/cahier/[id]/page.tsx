import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CahierAliasPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/learn/souvenirs/${id}`);
}
