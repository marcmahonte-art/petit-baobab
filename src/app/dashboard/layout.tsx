import { redirect } from "next/navigation";
import { getSuperAdminSession } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSuperAdminSession();
  if (!session) {
    redirect("/login?next=/dashboard&reason=admin");
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#3B2416] font-sans antialiased flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-[#F1ECE5] bg-white/70 backdrop-blur-sm sticky top-0 z-30">
          <span className="text-sm font-bold text-[#3B2416]/60">Back-office Super Admin</span>
          <span className="text-xs font-semibold text-[#7D6AF8]">{session.email}</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
