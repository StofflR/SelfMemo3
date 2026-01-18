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
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { mutate } from 'swr';
import DynamicList from '@/components/ui/DynamicList';
import { Reminder } from '@prisma/client';
import { useApiSwr } from 'hooks/useApiSwr';
import { useToast } from 'hooks/useToast';
import { ExportImportButtons } from '@/components/ui/reminders/ExportImportButtons';

export default function RemindersPage() {
    const url = "/api/reminders";
    const router = useRouter();
    const { data } = useApiSwr<Reminder[]>(url);

    const handleCreateReminder = () => {
        router.push('/reminders/create');
    };

    const handleEditReminder = (reminder: Reminder) => {
        router.push(`/reminders/${reminder.id}/edit`);
    };

    const handleDeleteReminder = (reminder: Reminder) => {
        modals.openConfirmModal({
            title: 'Delete Reminder Permanently',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete the reminder <b>{reminder.name}</b>?
                    This action cannot be undone and the schedule will be removed.
                </Text>
            ),
            labels: { confirm: 'Delete Reminder', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    const response = await fetch(`${url}/${reminder.id}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Error while deleting');
                    }

                    // SWR Cache aktualisieren
                    mutate(url);

                    notifications.show({
                        title: 'Success',
                        message: 'Reminder has been deleted.',
                        color: 'green',
                    });
                } catch (error: any) {
                    notifications.show({
                        title: 'Error',
                        message: error.message || 'Could not delete reminder.',
                        color: 'red',
                    });
                }
            },
        });
    };

    return (
      <Box p="xl" maw={1200}>
        <Group justify="space-between" mb="lg" align="flex-end">
          <div>
            <Title order={2}>Reminders</Title>
            <Text c="dimmed">Manage all of your reminders.</Text>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleCreateReminder()}>
              Create Reminder
            </Button>
            <ExportImportButtons />
          </div>
        </Group>

        <Paper withBorder shadow="sm" radius="md" p="md">
          <DynamicList
            data={data || []}
            entity="reminders"
            mutateKey={url}
            fields={['name', 'type', 'isDisabled']}
            fieldFormatter={{
              isDisabled: (value) =>
                value ? (
                  <Badge color="gray" variant="light">
                    Disabled
                  </Badge>
                ) : (
                  <Badge color="green" variant="light">
                    Active
                  </Badge>
                ),
              type: (value) => value.charAt(0).toUpperCase() + value.slice(1)
            }}
            labelFormatter={{
              isDisabled: () => 'Status'
            }}
            filters={false}
            showEditButton={true}
            onEdit={handleEditReminder}
            entityButtonText="Edit"
            showDeleteButton={true}
            onDelete={handleDeleteReminder}
          />
        </Paper>
      </Box>
    );
}