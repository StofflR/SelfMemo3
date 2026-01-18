"use client";

import { useDisclosure } from '@mantine/hooks';
import { 
  AppShell, 
  Burger, 
  Group, 
  NavLink, 
  useMantineTheme, 
  Text,
  ThemeIcon,
  rem,
  Tooltip,
  Center,
  UnstyledButton
} from '@mantine/core';
import {
  Home,
  Users2,
  Calendar,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User as UserProfile } from '@/components/ui/user'; 

interface DashboardShellProps {
  children: React.ReactNode;
  isAdmin: boolean;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string; 
  };
}

export default function DashboardShell({ children, isAdmin, user }: DashboardShellProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  
  const theme = useMantineTheme();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { label: 'Dashboard', icon: Home, href: '/' },
    ...(isAdmin ? [{ label: 'Users', icon: Users2, href: '/users' }] : []),
    { label: 'Reminders', icon: Calendar, href: '/reminders' },
  ];

  const bottomItems = [
    { label: 'Settings', icon: Settings, href: '/settings' }
  ];

  const renderNavLinks = (items: typeof navItems) => 
    items.map((item) => (
      <Tooltip 
        key={item.href} 
        label={item.label} 
        position="right" 
        disabled={desktopOpened}
        withArrow
      >
        <NavLink
          component={Link}
          href={item.href}
          label={desktopOpened ? item.label : null}
          leftSection={
            <item.icon style={{ width: rem(20), height: rem(20) }} strokeWidth={1.5} />
          }
          active={isActive(item.href)}
          variant="light"
          onClick={() => {
            if (mobileOpened) toggleMobile();
          }}
          styles={{
            root: { 
              borderRadius: theme.radius.sm, 
              marginBottom: 5,
              justifyContent: desktopOpened ? 'flex-start' : 'center', 
            },
            section: { margin: desktopOpened ? undefined : 0 } 
          }}
        />
      </Tooltip>
    ));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: desktopOpened ? 250 : 80,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      padding="md"
      transitionDuration={300}
      transitionTimingFunction="ease"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger 
              opened={mobileOpened} 
              onClick={toggleMobile} 
              hiddenFrom="sm" 
              size="sm" 
            />
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Group gap="xs" wrap="nowrap">
                    <ThemeIcon variant="filled" color="blue" radius="xl" size="lg">
                        <Bell style={{ width: rem(20), height: rem(20) }} />
                    </ThemeIcon>
                    <Text fw={700} visibleFrom={desktopOpened ? 'xs' : 'sm'}>
                      {desktopOpened ? 'SelfMemo' : ''}
                    </Text>
                </Group>
            </Link>
          </Group>
          <UserProfile />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ display: 'flex', flexDirection: 'column' }}>
        
        <AppShell.Section grow>
          {renderNavLinks(navItems)}
        </AppShell.Section>

        <AppShell.Section>
           {renderNavLinks(bottomItems)}
           <div style={{ margin: '10px 0', borderTop: `1px solid ${theme.colors.gray[3]}` }} />

           <UnstyledButton 
             onClick={toggleDesktop}
             style={{
               width: '100%',
               padding: '10px',
               borderRadius: theme.radius.sm,
               color: theme.colors.gray[7],
               display: 'flex',
               justifyContent: desktopOpened ? 'flex-start' : 'center',
               alignItems: 'center',
             }}
             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[1]}
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
           >
             {desktopOpened ? (
               <>
                 <ChevronsLeft size="1.2rem" />
                 <Text size="sm" ml="md">Collapse</Text>
               </>
             ) : (
               <ChevronsRight size="1.2rem" />
             )}
           </UnstyledButton>
        </AppShell.Section>

      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}