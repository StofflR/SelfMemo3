"use client";

import { signOut, useSession } from "next-auth/react";
import { Menu, Avatar, Text, rem } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react'; 

export function User() {
  const { data: session } = useSession();

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Avatar 
          radius="xl" 
          size="md"
          color="blue" 
          name={session?.user?.name || undefined} 
          style={{ cursor: 'pointer' }} 
        />
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
            <Text size="xs" fw={500} truncate>
                {session?.user?.email}
            </Text>
        </Menu.Label>
        
        <Menu.Divider />

        <Menu.Item 
          leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => signOut()}
        >
          Log Out
        </Menu.Item>

      </Menu.Dropdown>
    </Menu>
  );
}