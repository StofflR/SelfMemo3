import { FC } from "react";
import { Paper, Text, SimpleGrid } from '@mantine/core';

interface IStat {
  name: string;
  value: string;
}

interface IDashboardCardProps {
  stats: IStat[];
}

const DashboardCard: FC<IDashboardCardProps> = ({ stats }) => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {stats.map((stat) => (
        <Paper 
          key={stat.name} 
          withBorder 
          p="lg" 
          radius="md" 
          bg="gray.0"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Text 
            size="2rem" 
            fw={700} 
            c="dark"
            style={{ lineHeight: 1 }}
            ta="center" 
          >
            {stat.value}
          </Text>
          
          <Text 
            size="sm" 
            fw={500} 
            c="dimmed" 
            mt="xs" 
            ta="center" 
          >
            {stat.name}
          </Text>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

export default DashboardCard;