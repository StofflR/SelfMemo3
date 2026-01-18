"use client";

import { Paper, Title, Text, Container, Stack } from '@mantine/core';
import UserForm from '@/components/ui/users/users-form';
import { UserService } from 'services/UserService';
import { useEffect, useState } from 'react';

type Params = Promise<{
    id: string
}>;

export default function UserEditPage({ params }: { params: Params }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then(async (p) => {
            const fetchedUser = await UserService.getInstance().getUserById(p.id);
            setUser(fetchedUser);
            setLoading(false);
        });
    }, [params]);

    if (loading) return <Text p="xl">Loading user data...</Text>;

    return (
        <Container size="sm" py="xl">
            <Paper withBorder shadow="sm" radius="md" p="xl">
                <Stack gap="md">
                    <div>
                        <Title order={2}>Edit User</Title>
                        <Text c="dimmed" size="sm">
                            Update the profile information for this user.
                        </Text>
                    </div>
                    
                    <UserForm user={user ?? undefined} />
                </Stack>
            </Paper>
        </Container>
    );
}