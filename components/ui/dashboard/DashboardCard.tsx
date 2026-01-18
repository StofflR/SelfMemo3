"use client";

import { SimpleGrid, Paper, Text, Stack } from '@mantine/core';

interface StatItem {
  name: string;
  value: string | number;
}

export default function DashboardCard({ stats }: { stats: StatItem[] }) {
  if (!stats || !Array.isArray(stats)) {
    return <Text c="dimmed">Loading statistics...</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {stats.map((stat) => {
        const displayValue = typeof stat.value === 'string' 
          ? parseInt(stat.value, 10) 
          : Math.round(Number(stat.value));

        return (
          <Paper 
            key={stat.name} 
            withBorder 
            p="xl" 
            radius="md" 
            shadow="sm"
          >
            <Stack align="center" gap={5}>
              <Text size="xl" fw={700} style={{ fontSize: '2rem' }}>
                {isNaN(displayValue) ? 0 : displayValue}
              </Text>
              <Text c="dimmed" size="xs" fw={700} tt="uppercase" ta="center">
                {stat.name}
              </Text>
            </Stack>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}