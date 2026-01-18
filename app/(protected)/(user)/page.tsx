import { Box, Title, Paper } from '@mantine/core';
import DashboardCard from '@/components/ui/dashboard/DashboardCard';
import { StatisticService } from 'services/StatisticService';

export default async function DashboardPage() {

  // fetch data from api
  const dashboardStats = await StatisticService.getInstance().getDashboardStatistics();

  return (
    <Box p="xl" maw={1200}>
      <Title order={2} mb="lg">Dashboard</Title>

      <Paper withBorder shadow="sm" radius="md" p="xl" bg="white">
          <DashboardCard stats={dashboardStats} />
      </Paper>
    </Box>
  );
}