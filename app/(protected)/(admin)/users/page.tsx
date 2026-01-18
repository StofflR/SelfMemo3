"use client";

import { useState } from 'react';
import { 
  Card, 
  Text, 
  Button, 
  Drawer, 
  Group, 
  Title 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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

  return (
    <>
      <Card withBorder shadow="sm" radius="md" p="md">
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <div>
              <Title order={3}>Users</Title>
              <Text c="dimmed" size="sm">Manage all of your users.</Text>
            </div>
            
            <Button onClick={handleCreateClick}>Create User</Button>
          </Group>
        </Card.Section>

        <Card.Section inheritPadding py="md">
          <DynamicList
            data={data || []}
            entity="users"
            mutateKey={url}
            fields={["id", "username", "email", "firstName", "lastName", "role"]}
            combineFieldsCallbacks={{}}
            fieldFormatter={{
              role: (role) => role.charAt(0).toUpperCase() + role.slice(1),
            }}
            labelFormatter={{
              firstName: () => "First Name",
              lastName: () => "Last Name",
            }}
            filters={false}
            showEditButton={true}
            entityButtonText="Edit"
            onEdit={handleEditClick} 
          />
        </Card.Section>
      </Card>

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
    </>
  );
}
