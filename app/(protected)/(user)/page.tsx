import { Box, Title } from '@mantine/core';
import DashboardCard from '@/components/ui/dashboard/DashboardCard';
import { StatisticService } from 'services/StatisticService';

export default async function DashboardPage() {
  const dashboardStats = await StatisticService.getInstance().getDashboardStatistics();
  
  // DEBUG: Schau in dein Terminal, ob hier Zahlen oder undefined stehen
  console.log("Dashboard Stats vom Server:", dashboardStats);

  return (
    <Box p="xl" maw={1200}>
      <Title order={2} mb="lg">Dashboard</Title>
      {/* Übergabe an die Client Component */}
      <DashboardCard stats={dashboardStats} />
    </Box>
  );
}