import { Box, Title } from '@mantine/core'; 
import UserSettingsForm from '@/components/ui/settings/userSettingsForm';
import { getCurrentUser } from '@/lib/session';
import { UserService } from 'services/UserService';
import { redirect } from "next/navigation";

export default async function SettingsPage() {

    const signedInUser = await getCurrentUser();
    
    if (!signedInUser || !signedInUser.id) {
        redirect('/login');
    }

    const userService = UserService.getInstance();
    const user = await userService.getUserById(signedInUser.id);

    if (!user) {
        redirect('/');
    }

    return (
        <Box p="xl" maw={1200}>
            <Title order={2} mb="xl">Settings</Title>
            <UserSettingsForm user={user} />
        </Box>
    );
}