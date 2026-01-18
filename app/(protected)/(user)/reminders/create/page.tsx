"use client";

import { useRouter } from 'next/navigation';
import { Box, Title, Paper } from '@mantine/core';
import ReminderForm from '@/components/ui/reminders/reminder-form'; 

export default function RemindersCreatePage() {
    const router = useRouter();

    const handleRedirect = () => {
        router.push('/reminders');
    };

    return (
        <Box p="xl" maw={1200}>
            <Title order={2} mb="lg">Create New Reminder</Title>
            <Paper withBorder shadow="sm" radius="md" p="xl">
                <ReminderForm 
                    onSuccess={handleRedirect}
                    onClose={handleRedirect}
                />
            </Paper>
        </Box>
    );
}