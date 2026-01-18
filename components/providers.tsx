'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SessionProvider } from 'next-auth/react';

const theme = createTheme({
  primaryColor: 'blue',
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <ModalsProvider>
        <TooltipProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </TooltipProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}