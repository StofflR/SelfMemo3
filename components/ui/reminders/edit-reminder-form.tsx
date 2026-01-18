"use client";

import { useRouter } from 'next/navigation';
import { Box, Paper, Title } from '@mantine/core';
import ReminderForm from '@/components/ui/reminders/reminder-form'; 
import { Reminder } from '@prisma/client';

interface EditReminderFormProps {
    reminder: Reminder;
}

export default function EditReminderForm({ reminder }: EditReminderFormProps) {
    const router = useRouter();

    const handleRedirect = () => {
        router.push('/reminders');
        router.refresh(); 
    };

    return (
        <Box p="xl" maw={1200}>
            <Title order={2} mb="lg">Edit Reminder</Title>
            
            <Paper withBorder shadow="sm" radius="md" p="md">
                <ReminderForm 
                    reminder={reminder} 
                    onSuccess={handleRedirect}
                    onClose={handleRedirect}
                />
            </Paper>
        </Box>
    );
}