"use client";

import { useRouter } from 'next/navigation';
import { 
  Box, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group, 
  Badge 
} from '@mantine/core';
import DynamicList from '@/components/ui/DynamicList';
import { Reminder } from '@prisma/client';
import { useApiSwr } from 'hooks/useApiSwr';

export default function RemindersPage() {

    const url = "/api/reminders";
    const router = useRouter();

    const { data } = useApiSwr<Reminder[]>(url);

    const handleCreateReminder = () => {
        router.push('/reminders/create');
    };

    return (
        <Box p="xl" maw={1200}>
            
            <Group justify="space-between" mb="lg" align="flex-end">
                <div>
                    <Title order={2}>Reminders</Title>
                    <Text c="dimmed">Manage all of your reminders.</Text>
                </div>
                <Button onClick={handleCreateReminder}>
                    Create Reminder
                </Button>
            </Group>

            <Paper withBorder shadow="sm" radius="md" p="md" bg="white">
                <DynamicList
                    data={data || []}
                    entity="reminders"
                    mutateKey={url}
                    fields={["name", "type", "isDisabled"]}
                    combineFieldsCallbacks={{}}
                    
                    fieldFormatter={{
                        isDisabled: (value) => value 
                            ? <Badge color="gray" variant="light">Disabled</Badge> 
                            : <Badge color="green" variant="light">Active</Badge>,
                        type: (value) => value.charAt(0).toUpperCase() + value.slice(1)
                    }}
                    
                    labelFormatter={{
                        isDisabled: () => "Status"
                    }}
                    filters={false}
                    showEditButton={true}
                    entityButtonText="Edit"
                />
            </Paper>
        </Box>
    );
}