"use client";

import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group, 
  Drawer 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { User } from '@prisma/client';
import { useApiSwr } from 'hooks/useApiSwr'; 
import DynamicList from '@/components/ui/DynamicList';
import { mutate } from 'swr';
import UserForm from '@/components/ui/users/users-form';

export default function UsersPage() {
    const url = "/api/users";
    const { data } = useApiSwr<User[]>(url);
    
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleCreateClick = () => {
        setSelectedUser(null);
        open();
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user); 
        open();
    };

    const handleSuccess = () => {
        mutate(url); 
    };

    const handleDeleteClick = (user: User) => {
      modals.openConfirmModal({
          title: 'Delete User Permanently',
          centered: true,
          children: (
              <Text size="sm">
                  Are you sure you want to delete the user <b>{user.username || user.email}</b>? 
                  This action cannot be undone and all associated data will be lost.
              </Text>
          ),
          labels: { confirm: 'Delete User', cancel: 'Cancel' },
          confirmProps: { color: 'red' },
          onConfirm: async () => {
              try {
                  const response = await fetch(`${url}/${user.id}`, {
                      method: 'DELETE',
                  });
  
                  if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Error while deleting');
                  }
  
                  // Update SWR cache
                  mutate(url);
                  
                  notifications.show({
                      title: 'Success',
                      message: 'The user has been successfully deleted.',
                      color: 'green',
                  });
              } catch (error: any) {
                  notifications.show({
                      title: 'Error',
                      message: error.message || 'The user could not be deleted.',
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
                    <Title order={2}>Users</Title>
                    <Text c="dimmed">Manage all of your users.</Text>
                </div>
                <Button onClick={handleCreateClick}>
                    Create User
                </Button>
            </Group>

            <Paper withBorder shadow="sm" radius="md" p="md">
                <DynamicList
                    data={data || []}
                    entity="users"
                    fields={["username", "email", "firstName", "lastName", "role"]}
                    fieldFormatter={{
                        role: (role) => role ? role.charAt(0).toUpperCase() + role.slice(1) : '',
                    }}
                    labelFormatter={{
                        firstName: () => "First Name",
                        lastName: () => "Last Name",
                    }}

                    showEditButton={true}
                    onEdit={handleEditClick} 

                    showDeleteButton={true}
                    onDelete={handleDeleteClick}
                />
            </Paper>

            <Drawer 
                opened={opened} 
                onClose={close} 
                title={selectedUser ? "Edit User" : "Create User"}
                position="right"
                size="md"
            >
                <UserForm 
                    user={selectedUser} 
                    onClose={close} 
                    onSuccess={handleSuccess} 
                />
            </Drawer>
        </Box>
    );
}