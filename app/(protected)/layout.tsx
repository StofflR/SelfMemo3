import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import Providers from '@/components/providers';
import DashboardShell from '@/components/DashboardShell'; 

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !user.id) redirect("/login");
  const isAdmin = user.role === "admin";

  return (
    <Providers>
      <DashboardShell isAdmin={isAdmin} user={user as any}>
        {children}
      </DashboardShell>
    </Providers>
  );
}