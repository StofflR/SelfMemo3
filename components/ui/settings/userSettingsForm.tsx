"use client";

import { FC, useState, useEffect } from 'react';
import { User } from '@prisma/client';
import {
    TextInput,
    PasswordInput,
    Button,
    Group,
    Title,
    Text,
    Grid,
    Stack,
    Divider,
    Paper,
    Alert,
    Select
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { UpdateUserDto, UpdateUserPasswordDto } from '@/lib/validations/user';

type INFUpdateUserPasswordDto = Omit<UpdateUserPasswordDto, 'id'>;

interface INFUserSettingsFormProps {
    user: User;
}

const UserSettingsForm: FC<INFUserSettingsFormProps> = ({ user }) => {
    const [updateUser, setUpdateUser] = useState<UpdateUserDto>({
        id: user.id,
        username: user.username || undefined,
        email: user.email || undefined,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as "user" | "admin",
        defaultTimezone: (user as any).defaultTimezone || 'Etc/GMT',
        dateFormat: (user as any).dateFormat || 'full'
    });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [timezones, setTimezones] = useState<Array<{ value: string; label: string }>>([]);

    const [updateUserPassword, setUpdateUserPassword] = useState<INFUpdateUserPasswordDto>({ currentPassword: '', newPassword: '' });
    const [secondUserPassword, setSecondUserPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        const tzdata = require('tzdata');
        const list = Object.keys(tzdata.zones)
            .filter(name => name.startsWith('Etc/GMT'))
            .filter(name => !['Etc/GMT0', 'Etc/GMT-0', 'Etc/GMT+0'].includes(name))
            .sort()
            .map(name => ({
                value: name,
                label: name.replace('Etc/', '').replace(/_/g, ' ')
            }));
        setTimezones(list);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setUpdateUser((prev) => ({ ...prev, [name]: value }));
    }

    const handleSelectChange = (name: string, value: string | null) => {
        setUpdateUser((prev) => ({ ...prev, [name]: value }));
    }

    const onSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);

        try {
            const response = await fetch(`/api/users/${updateUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            notifications.show({
                title: 'Settings updated!',
                message: 'You have successfully updated the user settings.',
                color: 'green',
            });

        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red',
            });
        } finally {
            setLoadingProfile(false);
        }
    }

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        if (name === 'secondPassword') {
            setSecondUserPassword(value);
        } else {
            setUpdateUserPassword((prev) => ({ ...prev, [name]: value }));
        }
    }

    const validatePassword = () => {
        if (!updateUserPassword.currentPassword || !updateUserPassword.newPassword || !secondUserPassword) {
            setPasswordError('Please fill all fields');
            return false;
        }
        if (updateUserPassword.newPassword !== secondUserPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        if (updateUserPassword.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return false;
        }
        setPasswordError(null);
        return true;
    };

    const onSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setLoadingPassword(true);

        try {
            const response = await fetch(`/api/users/${updateUser.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateUserPassword),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            notifications.show({
                title: 'Password updated!',
                message: 'Your password has been changed successfully.',
                color: 'green',
            });

            setUpdateUserPassword({ currentPassword: '', newPassword: '' });
            setSecondUserPassword('');

        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.message,
                color: 'red',
            });
        } finally {
            setLoadingPassword(false);
        }
    }

    return (
        <Stack gap="xl">
            {/*Personal info*/}
            <form onSubmit={onSubmitProfile}>
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Title order={4}>Personal Information</Title>
                        <Text c="dimmed" size="sm" mt={4}>
                            Use a permanent address where you can receive mail reminders.
                        </Text>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Paper withBorder p="md" radius="md">
                            <Stack gap="md">
                                <Group grow>
                                    <TextInput
                                        label="First Name"
                                        name="firstName"
                                        value={updateUser.firstName || ''}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />
                                    <TextInput
                                        label="Last Name"
                                        name="lastName"
                                        value={updateUser.lastName || ''}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />
                                </Group>

                                <TextInput
                                    label="Username"
                                    name="username"
                                    value={updateUser.username || ''}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />

                                <TextInput
                                    label="E-Mail"
                                    name="email"
                                    type="email"
                                    value={updateUser.email || ''}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />

                                <Select
                                    label="Default Timezone"
                                    description="This timezone will be used as default when creating new reminders"
                                    data={timezones}
                                    value={updateUser.defaultTimezone}
                                    onChange={(val) => handleSelectChange('defaultTimezone', val)}
                                    searchable
                                />

                                <Select
                                    label="Date Format"
                                    description="This format will be used for displaying dates in email notifications"
                                    data={[
                                        { value: 'full', label: 'Full (Friday, January 24, 2026 at 3:30 PM)' },
                                        { value: 'long', label: 'Long (January 24, 2026 at 3:30 PM)' },
                                        { value: 'medium', label: 'Medium (Jan 24, 2026, 3:30 PM)' },
                                        { value: 'short', label: 'Short (1/24/26, 3:30 PM)' }
                                    ]}
                                    value={updateUser.dateFormat}
                                    onChange={(val) => handleSelectChange('dateFormat', val)}
                                />

                                <Group justify="flex-end" mt="xs">
                                    <Button type="submit" loading={loadingProfile}>
                                        Save Personal Information
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </form>

            <Divider />

            {/*Change Pw*/}
            <form onSubmit={onSubmitPassword}>
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Title order={4}>Change Password</Title>
                        <Text c="dimmed" size="sm" mt={4}>
                            Update your password associated with your account.
                        </Text>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Paper withBorder p="md" radius="md">
                            <Stack gap="md">
                                <PasswordInput
                                    label="Current Password"
                                    name="currentPassword"
                                    value={updateUserPassword.currentPassword}
                                    onChange={handleChangePassword}
                                    autoComplete="off"
                                />

                                <Group grow>
                                    <PasswordInput
                                        label="New Password"
                                        name="newPassword"
                                        value={updateUserPassword.newPassword}
                                        onChange={handleChangePassword}
                                        autoComplete="off"
                                    />
                                    <PasswordInput
                                        label="Confirm New Password"
                                        name="secondPassword"
                                        value={secondUserPassword}
                                        onChange={handleChangePassword}
                                        autoComplete="off"
                                    />
                                </Group>

                                {passwordError && (
                                    <Alert variant="light" color="red" title="Error" icon={<IconInfoCircle size={16} />}>
                                        {passwordError}
                                    </Alert>
                                )}

                                <Group justify="flex-end" mt="xs">
                                    <Button type="submit" loading={loadingPassword}>
                                        Update Password
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </form>

        </Stack>
    );
}

export default UserSettingsForm;